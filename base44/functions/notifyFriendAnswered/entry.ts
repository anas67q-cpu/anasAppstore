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

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const payload = await req.json();

  const answer = payload.data;

  // Only trigger on new answers (not updates/essay grading)
  if (!answer || payload.event?.type !== 'create') {
    return Response.json({ skipped: true, reason: 'not a new answer' });
  }

  const answererEmail = answer.user_email;
  const answererName = answer.user_name || answererEmail;
  const isCorrect = answer.is_correct;

  // Find users who are watching this person and have notify_friends enabled
  const allPrefs = await base44.asServiceRole.entities.NotificationPreferences.list();
  const watchers = allPrefs.filter(p =>
    p.notify_friends === true &&
    (p.watched_emails || []).includes(answererEmail) &&
    p.user_email !== answererEmail
  );

  if (watchers.length === 0) {
    return Response.json({ skipped: true, reason: 'no watchers for this user' });
  }

  const serviceAccount = JSON.parse(Deno.env.get('FCM_SERVICE_ACCOUNT_KEY'));
  const projectId = serviceAccount.project_id;
  const accessToken = await getAccessToken(serviceAccount);

  const title = isCorrect
    ? `🎯 ${answererName} أجاب صح!`
    : `❌ ${answererName} أجاب خطأ`;
  const body = isCorrect
    ? `${answererName} أجاب على سؤال اليوم بإجابة صحيحة! 🏆`
    : `${answererName} أجاب على سؤال اليوم بإجابة خاطئة.`;

  // Get device tokens for all watchers
  const watcherEmails = watchers.map(w => w.user_email);
  const allTokens = await base44.asServiceRole.entities.DeviceToken.list();
  const targetTokens = allTokens.filter(t => watcherEmails.includes(t.user_email));

  if (targetTokens.length === 0) {
    return Response.json({ skipped: true, reason: 'no device tokens for watchers' });
  }

  await Promise.allSettled(targetTokens.map(t =>
    fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: { token: t.token, notification: { title, body } } }),
    })
  ));

  return Response.json({ success: true, sent: targetTokens.length, answerer: answererEmail });
});