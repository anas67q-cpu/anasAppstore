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
  const oldAnswer = payload.old_data;

  if (!answer || answer.graded !== true) {
    return Response.json({ skipped: true, reason: 'not graded' });
  }

  if (oldAnswer && oldAnswer.graded === true) {
    return Response.json({ skipped: true, reason: 'already was graded' });
  }

  // Respect user notification preference
  const userPrefs = await base44.asServiceRole.entities.NotificationPreferences.filter({ user_email: answer.user_email });
  if (userPrefs[0] && userPrefs[0].notify_grade === false) {
    return Response.json({ skipped: true, reason: 'user opted out of grade notifications' });
  }

  const userStats = await base44.asServiceRole.entities.UserStats.filter({ user_email: answer.user_email });
  const userCategory = userStats[0]?.category || 'guest';

  const allUserTokens = await base44.asServiceRole.entities.DeviceToken.filter({ user_email: answer.user_email });
  // Deduplicate: one token per user
  const tokens = allUserTokens.slice(0, 1);

  if (tokens.length === 0) {
    return Response.json({ skipped: true, reason: 'no device token for user' });
  }

  const serviceAccount = JSON.parse(Deno.env.get('FCM_SERVICE_ACCOUNT_KEY'));
  const projectId = serviceAccount.project_id;
  const accessToken = await getAccessToken(serviceAccount);

  const title = '📋 تم التصحيح!';
  const body = `ترا سؤال رقم ${answer.day_number} صححته الإدارة 👀`;

  await Promise.allSettled(tokens.map(t =>
    fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: { token: t.token, notification: { title, body } } }),
    })
  ));

  return Response.json({ success: true, sent: tokens.length, userCategory, isCorrect });
});