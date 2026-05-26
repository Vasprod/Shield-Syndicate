module.exports = function handler(req, res) {
  res.setHeader('Set-Cookie', 'session=; Path=/; HttpOnly; Max-Age=0');
  res.redirect('/');
};
