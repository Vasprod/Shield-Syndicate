const { getSession } = require('../_lib/auth');
const redis = require('../_lib/redis');

const VALID_ROLES = ['Участник', 'Модератор', 'Администратор', 'Основатель'];

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  const session = getSession(req);
  if (!session) return res.status(401).json({ error: 'not_logged_in' });
  if (session.discord_id !== process.env.DISCORD_OWNER_ID)
    return res.status(403).json({ error: 'forbidden' });

  let body = '';
  await new Promise(resolve => { req.on('data', c => { body += c; }); req.on('end', resolve); });

  let data;
  try { data = JSON.parse(body); } catch { return res.status(400).json({ error: 'invalid_json' }); }

  const { discord_id, role } = data;
  if (!discord_id || !VALID_ROLES.includes(role))
    return res.status(400).json({ error: 'invalid_params' });

  const user = await redis.get(`user:${discord_id}`);
  if (!user) return res.status(404).json({ error: 'user_not_found' });

  await redis.set(`user:${discord_id}`, { ...user, site_role: role });
  res.status(200).json({ ok: true });
};
