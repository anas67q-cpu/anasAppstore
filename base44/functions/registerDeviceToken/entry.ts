import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { token, platform } = await req.json();
  if (!token) {
    return Response.json({ error: 'Token is required' }, { status: 400 });
  }

  // Get user category from UserStats
  const stats = await base44.asServiceRole.entities.UserStats.filter({ user_email: user.email });
  const userCategory = stats[0]?.category || 'guest';

  // Check if token already exists for this user
  const existing = await base44.asServiceRole.entities.DeviceToken.filter({ user_email: user.email, token });

  if (existing.length > 0) {
    // Update category in case it changed
    await base44.asServiceRole.entities.DeviceToken.update(existing[0].id, { user_category: userCategory });
    return Response.json({ success: true, action: 'updated' });
  }

  // Delete old tokens for this user (keep only latest)
  const oldTokens = await base44.asServiceRole.entities.DeviceToken.filter({ user_email: user.email });
  await Promise.all(oldTokens.map(t => base44.asServiceRole.entities.DeviceToken.delete(t.id)));

  // Create new token
  await base44.asServiceRole.entities.DeviceToken.create({
    user_email: user.email,
    token,
    platform: platform || 'ios',
    user_category: userCategory,
  });

  return Response.json({ success: true, action: 'registered' });
});