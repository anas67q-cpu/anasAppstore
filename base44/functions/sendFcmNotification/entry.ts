import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Get OAuth2 access token from service account
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

  // Import private key
  const pemKey = serviceAccount.private_key;
  const pemBody = pemKey.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\n/g, '');
  const binaryKey = Uint8Array.from(atob(pemBody), c => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const encoder = new TextEncoder();
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, encoder.encode(signingInput));
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  const jwt = `${signingInput}.${signatureB64}`;

  // Exchange JWT for access token
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
  const user = await base44.auth.me();
  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { title, body, target } = await req.json();
  // target: 'all' | 'contestants' | 'guests'

  const serviceAccount = JSON.parse(Deno.env.get('FCM_SERVICE_ACCOUNT_KEY'));
  const projectId = serviceAccount.project_id;
  const accessToken = await getAccessToken(serviceAccount);

  // Fetch device tokens
  const allTokens = await base44.asServiceRole.entities.DeviceToken.list();
  const tokens = allTokens.filter(t => {
    if (target === 'all') return true;
    if (target === 'contestants') return t.user_category === 'contestant';
    if (target === 'guests') return t.user_category === 'guest';
    return true;
  });

  if (tokens.length === 0) {
    return Response.json({ success: true, sent: 0, message: 'No tokens found' });
  }

  // Send to each token
  const results = await Promise.allSettled(tokens.map(async (t) => {
    const res = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          token: t.token,
          notification: { title, body },
        },
      }),
    });
    return res.json();
  }));

  const sent = results.filter(r => r.status === 'fulfilled').length;
  return Response.json({ success: true, sent, total: tokens.length });
});