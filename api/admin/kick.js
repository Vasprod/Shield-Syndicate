const { getSession } = require('../_lib/auth');
const redis = require('../_lib/redis');

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

  const { discord_id } = data;
  if (!discord_id) return res.status(400).json({ error: 'invalid_params' });
  if (discord_id === session.discord_id) return res.status(400).json({ error: 'cannot_kick_self' });

  await redis.del(`user:${discord_id}`);
  res.status(200).json({ ok: true });
};
