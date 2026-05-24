import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

async function getAccessToken(serviceAccount) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  const encode = (obj) => btoa(JSON.stringify(obj)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const headerB64 = encode(header);
  const payloadB64 = encode(payload);
  const signingInput = `${headerB64}.${payloadB64}`;

  const pemKey = serviceAccount.private_key;
  const pemBody = pemKey.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\n/g, '');
  const binaryKey = Uint8Array.from(atob(pemBody), c => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8', binaryKey.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false, ['sign']
  );

  const encoder = new TextEncoder();
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, encoder.encode(signingInput));
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const jwt = `${signingInput}.${signatureB64}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  const tokenData = await tokenRes.json();
  return tokenData.access_token;
}

async function sendToTokens(tokens, title, body, projectId, accessToken) {
  await Promise.allSettled(tokens.map(t =>
    fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: { token: t.token, notification: { title, body } } }),
    })
  ));
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const payload = await req.json();

  const question = payload.data;
  const oldQuestion = payload.old_data;

  if (!question || question.status !== 'published') {
    return Response.json({ skipped: true, reason: 'not published' });
  }

  if (payload.event?.type === 'update' && oldQuestion?.status === 'published') {
    return Response.json({ skipped: true, reason: 'already was published' });
  }

  const serviceAccount = JSON.parse(Deno.env.get('FCM_SERVICE_ACCOUNT_KEY'));
  const projectId = serviceAccount.project_id;
  const accessToken = await getAccessToken(serviceAccount);

  const allTokens = await base44.asServiceRole.entities.DeviceToken.list();

  const targetAudience = question.target_audience || 'all';
  let tokens = allTokens;
  if (targetAudience === 'contestants') {
    tokens = allTokens.filter(t => t.user_category === 'contestant');
  } else if (targetAudience === 'guests') {
    tokens = allTokens.filter(t => t.user_category === 'guest');
  } else if (targetAudience === 'specific' && question.target_emails?.length) {
    tokens = allTokens.filter(t => question.target_emails.includes(t.user_email));
  }

  // Respect user notification preferences
  const allPrefs = await base44.asServiceRole.entities.NotificationPreferences.list();
  const prefsMap = {};
  allPrefs.forEach(p => { prefsMap[p.user_email] = p; });
  tokens = tokens.filter(t => {
    const p = prefsMap[t.user_email];
    if (!p) return true; // default: ON
    return p.notify_new_question !== false;
  });

  // Deduplicate: one token per user (pick the latest one)
  const seenEmails = new Set();
  const uniqueTokens = [];
  for (const t of tokens) {
    if (!seenEmails.has(t.user_email)) {
      seenEmails.add(t.user_email);
      uniqueTokens.push(t);
    }
  }

  const title = '📝 سؤال جديد!';
  const body = `ترا وصل سؤال اليوم ${question.day_number}، بالتوفيق! 🌟`;
  await sendToTokens(uniqueTokens, title, body, projectId, accessToken);

  return Response.json({ success: true, sent: uniqueTokens.length, targetAudience });
});