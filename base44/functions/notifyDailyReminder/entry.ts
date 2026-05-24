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

  const serviceAccount = JSON.parse(Deno.env.get('FCM_SERVICE_ACCOUNT_KEY'));
  const projectId = serviceAccount.project_id;
  const accessToken = await getAccessToken(serviceAccount);

  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Riyadh' });
  const questions = await base44.asServiceRole.entities.Question.filter({ status: 'published' });
  const todayQuestion = questions.find(q => q.publish_date === today);

  if (!todayQuestion) {
    return Response.json({ skipped: true, reason: 'No published question for today' });
  }

  const answers = await base44.asServiceRole.entities.Answer.filter({ question_id: todayQuestion.id });
  const answeredEmails = new Set(answers.map(a => a.user_email));

  const allTokens = await base44.asServiceRole.entities.DeviceToken.list();

  // Respect user notification preferences
  const allPrefs = await base44.asServiceRole.entities.NotificationPreferences.list();
  const prefsMap = {};
  allPrefs.forEach(p => { prefsMap[p.user_email] = p; });

  const filteredTokens = allTokens.filter(t => {
    if (answeredEmails.has(t.user_email)) return false;
    const p = prefsMap[t.user_email];
    if (!p) return true; // default: ON
    return p.notify_reminder !== false;
  });

  // Deduplicate: one token per user
  const seenEmails = new Set();
  const unansweredTokens = [];
  for (const t of filteredTokens) {
    if (!seenEmails.has(t.user_email)) {
      seenEmails.add(t.user_email);
      unansweredTokens.push(t);
    }
  }

  if (unansweredTokens.length === 0) {
    return Response.json({ skipped: true, reason: 'All users have answered or opted out' });
  }

  const title = '⏰ تذكير - سؤال اليوم!';
  const body = 'لم تجب على سؤال اليوم بعد. تبقى وقت قليل، أجب الآن!';

  await Promise.allSettled(unansweredTokens.map(t =>
    fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: { token: t.token, notification: { title, body } } }),
    })
  ));

  return Response.json({ success: true, sent: unansweredTokens.length });
});