const { getSession } = require('../_lib/auth');
const redis = require('../_lib/redis');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  const session = getSession(req);
  if (!session) return res.status(401).json({ error: 'not_logged_in' });

  let body = '';
  await new Promise(resolve => {
    req.on('data', chunk => { body += chunk; });
    req.on('end', resolve);
  });

  let data;
  try { data = JSON.parse(body); } catch { return res.status(400).json({ error: 'invalid_json' }); }

  const { nickname, description, tags } = data;

  if (!nickname || !nickname.trim()) return res.status(400).json({ error: 'nickname_required' });
  if (nickname.trim().length > 32) return res.status(400).json({ error: 'nickname_too_long' });
  if (description && description.length > 200) return res.status(400).json({ error: 'description_too_long' });

  /* теги: макс 3, каждый макс 15 символов */
  const cleanTags = (Array.isArray(tags) ? tags : [])
    .map(t => String(t).trim())
    .filter(t => t.length > 0)
    .slice(0, 3);
  if (cleanTags.some(t => t.length > 15)) return res.status(400).json({ error: 'tag_too_long' });

  const existing = await redis.get(`user:${session.discord_id}`);
  if (!existing) return res.status(404).json({ error: 'user_not_found' });

  const newNickname = nickname.trim();
  if (newNickname !== existing.nickname && existing.nickname_updated_at) {
    const msSince = Date.now() - new Date(existing.nickname_updated_at).getTime();
    const msWeek  = 7 * 24 * 60 * 60 * 1000;
    if (msSince < msWeek) {
      const nextAllowed = new Date(new Date(existing.nickname_updated_at).getTime() + msWeek);
      return res.status(429).json({ error: 'nickname_cooldown', next_allowed: nextAllowed.toISOString() });
    }
  }

  const updated = {
    ...existing,
    nickname:            newNickname,
    nickname_updated_at: newNickname !== existing.nickname ? new Date().toISOString() : existing.nickname_updated_at,
    description:         (description || '').trim(),
    tags:                cleanTags,
  };
  await redis.set(`user:${session.discord_id}`, updated);

  res.status(200).json(updated);
};
