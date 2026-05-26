const jwt = require('jsonwebtoken');

function getSession(req) {
  const cookie = req.headers.cookie || '';
  const match = cookie.match(/session=([^;]+)/);
  if (!match) return null;
  try {
    return jwt.verify(match[1], process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

function setSessionCookie(res, discordId) {
  const token = jwt.sign(
    { discord_id: discordId },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
  const maxAge = 30 * 24 * 60 * 60;
  res.setHeader(
    'Set-Cookie',
    `session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`
  );
}

module.exports = { getSession, setSessionCookie };
