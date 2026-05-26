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

  const { nickname, description } = data;

  if (!nickname || !nickname.trim()) return res.status(400).json({ error: 'nickname_required' });
  if (nickname.trim().length > 32) return res.status(400).json({ error: 'nickname_too_long' });
  if (description && description.length > 300) return res.status(400).json({ error: 'description_too_long' });

  const existing = await redis.get(`user:${session.discord_id}`);
  if (!existing) return res.status(404).json({ error: 'user_not_found' });

  const updated = { ...existing, nickname: nickname.trim(), description: (description || '').trim() };
  await redis.set(`user:${session.discord_id}`, updated);

  res.status(200).json(updated);
};
