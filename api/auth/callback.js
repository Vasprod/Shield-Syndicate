const { setSessionCookie } = require('../_lib/auth');
const redis = require('../_lib/redis');

module.exports = async function handler(req, res) {
  const { code } = req.query;
  if (!code) return res.redirect('/?error=no_code');

  try {
    // Обмен code на access_token
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.DISCORD_REDIRECT_URI,
      }),
    });
    const tokens = await tokenRes.json();
    if (!tokens.access_token) return res.redirect('/?error=token_fail');

    // Получаем данные пользователя
    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const user = await userRes.json();

    // Проверяем наличие роли участника через бот-токен
    const memberRes = await fetch(
      `https://discord.com/api/guilds/${process.env.DISCORD_GUILD_ID}/members/${user.id}`,
      { headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` } }
    );

    if (memberRes.status !== 200) {
      return res.redirect('/?error=not_in_server');
    }

    const member = await memberRes.json();
    const hasRole = member.roles.includes(process.env.DISCORD_MEMBER_ROLE_ID);
    if (!hasRole) {
      return res.redirect('/?error=no_role');
    }

    // Аватарка Discord
    const avatarUrl = user.avatar
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`
      : `https://cdn.discordapp.com/embed/avatars/${Number(BigInt(user.id) % 5n)}.png`;

    // Создаём или обновляем профиль
    const existing = await redis.get(`user:${user.id}`);
    const profile = {
      discord_id: user.id,
      discord_username: user.username,
      avatar_url: avatarUrl,
      nickname: existing?.nickname || member.nick || user.global_name || user.username,
      description: existing?.description || '',
      joined_at: existing?.joined_at || new Date().toISOString(),
    };
    await redis.set(`user:${user.id}`, profile);

    setSessionCookie(res, user.id);
    res.redirect('/cabinet');
  } catch (e) {
    console.error(e);
    res.redirect('/?error=server_error');
  }
};
