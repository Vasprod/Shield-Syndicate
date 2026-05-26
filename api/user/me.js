const { getSession } = require('../_lib/auth');
const redis = require('../_lib/redis');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  const session = getSession(req);
  if (!session) return res.status(401).json({ error: 'not_logged_in' });

  const user = await redis.get(`user:${session.discord_id}`);
  if (!user) return res.status(404).json({ error: 'user_not_found' });

  res.status(200).json(user);
};
