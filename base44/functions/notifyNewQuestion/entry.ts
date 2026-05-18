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

  const buildMessage = (category) => {
    const title = '📝 سؤال جديد وصلك!';
    if (category === 'contestant') {
      return { title, body: `أيها المتسابق! سؤال اليوم ${question.day_number} متاح الآن. أجب قبل انتهاء الوقت وحصّل نقاطك! 🏆` };
    } else if (category === 'guest') {
      return { title, body: `يا ضيفنا! سؤال اليوم ${question.day_number} وصل. شارك وتحدَّ نفسك! ✨` };
    } else {
      return { title, body: `سؤال اليوم ${question.day_number} متاح الآن. أجب قبل انتهاء الوقت!` };
    }
  };

  const contestantTokens = tokens.filter(t => t.user_category === 'contestant');
  const guestTokens = tokens.filter(t => t.user_category === 'guest');
  const otherTokens = tokens.filter(t => !t.user_category || (t.user_category !== 'contestant' && t.user_category !== 'guest'));

  const sends = [];
  if (contestantTokens.length > 0) {
    const { title, body } = buildMessage('contestant');
    sends.push(sendToTokens(contestantTokens, title, body, projectId, accessToken));
  }
  if (guestTokens.length > 0) {
    const { title, body } = buildMessage('guest');
    sends.push(sendToTokens(guestTokens, title, body, projectId, accessToken));
  }
  if (otherTokens.length > 0) {
    const { title, body } = buildMessage('all');
    sends.push(sendToTokens(otherTokens, title, body, projectId, accessToken));
  }

  await Promise.all(sends);

  return Response.json({ success: true, sent: tokens.length, targetAudience });
});