const redis = require('./_lib/redis');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  try {
    let cursor = 0;
    const keys = [];
    do {
      const [nextCursor, batch] = await redis.scan(cursor, { match: 'user:*', count: 100 });
      cursor = parseInt(nextCursor);
      keys.push(...batch);
    } while (cursor !== 0);

    if (keys.length === 0) return res.json([]);

    const users = await Promise.all(keys.map(k => redis.get(k)));
    const members = users
      .filter(Boolean)
      .map(u => ({
        discord_id:       u.discord_id,
        discord_username: u.discord_username,
        nickname:         u.nickname,
        description:      u.description || '',
        avatar_url:       u.avatar_url,
        tags:             u.tags || [],
        joined_at:        u.joined_at,
      }))
      .sort((a, b) => new Date(a.joined_at) - new Date(b.joined_at));

    res.json(members);
  } catch (e) {
    console.error(e);
    res.status(500).json([]);
  }
};
