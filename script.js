/* Image paths (encodeURI handles spaces + cyrillic) */
const IMG = {
  heroBg:      'img/blockone.png',
  joinBg:      'img/lastblock.png',
  logoRed:     'img/ChatGPT Image 1 мая 2026 г., 22_30_30-Photoroom.png',
  logoGrey:    'img/ChatGPT Image 2 мая 2026 г., 14_03_30-Photoroom.png',
  banner:      'img/ChatGPT Image 1 мая 2026 г., 22_38_52.png',
  divider:     'img/Frame 257.png',
};

function setImg(id, path, asBg) {
  const el = document.getElementById(id);
  if (!el) return;
  const url = encodeURI(path);
  if (asBg) el.style.backgroundImage = `url("${url}")`;
  else el.src = url;
}

setImg('heroBg',        IMG.heroBg,    true);
setImg('joinBg',        IMG.joinBg,    true);
setImg('heroLogoImg',   IMG.logoRed,   false);
setImg('navLogoImg',    IMG.logoGrey,  false);
setImg('footerLogoImg', IMG.logoGrey,  false);
setImg('aboutBannerImg',IMG.logoRed,   false);
setImg('dividerImg',    IMG.divider,   false);

/* Parallax — только на десктопе */
const heroBg = document.getElementById('heroBg');
if (window.innerWidth > 768) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    heroBg.style.transform = `scale(1.06) translateY(${y * 0.28}px)`;
  }, { passive: true });
} else {
  heroBg.style.transform = 'none';
  heroBg.style.backgroundPosition = 'center center';
}

/* Горизонтальный скролл колесом — плавный */
const membersGrid = document.querySelector('.members-grid');
let targetX = 0;
let currentX = 0;
let rafId = null;

membersGrid.addEventListener('wheel', e => {
  if (e.deltaY === 0) return;
  e.preventDefault();
  targetX += e.deltaY * 1.2;
  targetX = Math.max(0, Math.min(targetX, membersGrid.scrollWidth - membersGrid.clientWidth));
  if (!rafId) animate();
}, { passive: false });

function animate() {
  currentX += (targetX - currentX) * 0.08;
  membersGrid.scrollLeft = currentX;
  if (Math.abs(targetX - currentX) > 0.3) {
    rafId = requestAnimationFrame(animate);
  } else {
    membersGrid.scrollLeft = targetX;
    currentX = targetX;
    rafId = null;
  }
}

/* Scroll reveal */
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('on'); obs.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll('.rv').forEach(el => obs.observe(el));

/* ── MOUSE-TRACKING CARD SPOTLIGHT ─────────────────────────── */
document.querySelectorAll('.feat-card, .val-card, .hero-card, .member-card').forEach(card => {
  const glow = document.createElement('span');
  glow.className = 'card-glow';
  card.appendChild(glow);

  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    glow.style.setProperty('--gx', `${e.clientX - r.left}px`);
    glow.style.setProperty('--gy', `${e.clientY - r.top}px`);
  });
  card.addEventListener('mouseleave', () => {
    glow.style.setProperty('--gx', '-999px');
    glow.style.setProperty('--gy', '-999px');
  });
});


/* ── HERO INTRO ANIMATION ───────────────────────────────────── */

function splitLetters(el) {
  const chars = [...el.textContent.trim()];
  el.textContent = '';
  return chars.map(char => {
    const s = document.createElement('span');
    s.textContent = char;
    s.style.display = 'inline-block';
    el.appendChild(s);
    return s;
  });
}

const heroTitleEl     = document.querySelector('.hero-title');
const heroSyndicateEl = document.querySelector('.hero-syndicate');
const heroCrumb       = document.querySelector('.hero-breadcrumb');
const heroFounded     = document.querySelector('.hero-founded');
const heroActions     = document.querySelector('.hero-actions');
const decoEls         = document.querySelectorAll('.deco-corner, .deco-plus, .deco-dots, .deco-year');

/* если уже видели анимацию в этой сессии — сразу показываем всё */
if (sessionStorage.getItem('heroAnimDone')) {
  heroTitleEl.classList.add('shimmer');
  // tl ниже не создаём, просто выходим из блока
} else {

// Скрываем до старта анимации
[heroCrumb, heroFounded, heroActions, heroSyndicateEl].forEach(el => {
  if (el) el.style.opacity = '0';
});
decoEls.forEach(el => { el.style.opacity = '0'; });

const shieldLetters = splitLetters(heroTitleEl);

// Сканирующая линия
const heroSection = document.getElementById('hero');
const scanLine = document.createElement('div');
scanLine.style.cssText =
  'position:absolute;top:0;bottom:0;width:2px;left:0;z-index:10;pointer-events:none;opacity:0;' +
  'background:linear-gradient(to bottom,transparent 0%,rgba(192,57,43,.95) 30%,rgba(192,57,43,.95) 70%,transparent 100%);' +
  'box-shadow:0 0 14px rgba(192,57,43,.8),0 0 32px rgba(192,57,43,.4);';
heroSection.appendChild(scanLine);

// Страховка: если анимация упадёт — через 2.5с восстанавливаем видимость
const restoreTimer = setTimeout(() => {
  [heroCrumb, heroFounded, heroActions, heroSyndicateEl].forEach(el => {
    if (el) el.style.opacity = '';
  });
}, 2500);

const tl = anime.timeline({
  easing: 'easeOutExpo',
  complete() {
    clearTimeout(restoreTimer);
    const text = shieldLetters.map(s => s.textContent).join('');
    heroTitleEl.textContent = text;
    heroTitleEl.classList.add('shimmer');
    sessionStorage.setItem('heroAnimDone', '1');
  },
});

tl
  .add({
    targets: scanLine,
    opacity: [0, 1, 0],
    left: ['-1%', '101%'],
    duration: 850,
    easing: 'easeInOutSine',
  })
  .add({
    targets: shieldLetters,
    translateY: ['80px', '0px'],
    opacity: [0, 1],
    duration: 700,
    delay: anime.stagger(55),
  }, '-=400')
  .add({
    targets: heroSyndicateEl,
    opacity: [0, 1],
    translateY: ['-14px', '0px'],
    duration: 800,
  }, '-=350')
  .add({
    targets: heroCrumb,
    opacity: [0, 1],
    translateX: ['-22px', '0px'],
    duration: 500,
    easing: 'easeOutQuad',
  }, '-=700')
  .add({
    targets: heroFounded,
    opacity: [0, 1],
    translateY: ['8px', '0px'],
    duration: 400,
    easing: 'easeOutQuad',
  }, '-=250')
  .add({
    targets: heroActions,
    opacity: [0, 1],
    translateY: ['10px', '0px'],
    scale: [0.95, 1],
    duration: 500,
    easing: 'easeOutBack',
  }, '-=200')
  .add({
    targets: decoEls,
    opacity: [0, 1],
    scale: [0.5, 1],
    duration: 550,
    delay: anime.stagger(50),
    easing: 'easeOutBack',
  }, '-=300');

} // end else (hero animation)

/* ── STAT COUNTERS (about section) ─────────────────────────── */

const statNums = document.querySelectorAll('.stat-num');
if (statNums.length) {
  const counterObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const end = parseInt(el.textContent);
      const obj = { v: 0 };
      anime({
        targets: obj,
        v: end,
        round: 1,
        duration: 1600,
        easing: 'easeOutExpo',
        update() { el.textContent = obj.v; },
      });
      counterObs.unobserve(el);
    });
  }, { threshold: 0.6 });
  statNums.forEach(el => counterObs.observe(el));
}

/* ── GALLERY DRUM ───────────────────────────────────────── */
(function () {
  const slides   = Array.from(document.querySelectorAll('.drum-slide'));
  const dotsWrap = document.getElementById('drumDots');
  const prevBtn  = document.getElementById('drumPrev');
  const nextBtn  = document.getElementById('drumNext');
  const slider   = document.getElementById('drumSlider');
  if (!slides.length) return;

  let current = 0;
  let timer;
  const n = slides.length;

  /* точки */
  slides.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'drum-dot';
    d.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(d);
  });

  /* позиции: translateX в % от ширины слайда, scale, blur, opacity */
  const POS = [
    { tx: 0,   scale: 1,    blur: 0, opacity: 1,    z: 5 },  // центр
    { tx: 76,  scale: 0.52, blur: 4, opacity: 0.65, z: 4 },  // +1
    { tx: -76, scale: 0.52, blur: 4, opacity: 0.65, z: 4 },  // -1
    { tx: 90,  scale: 0.36, blur: 8, opacity: 0.2,  z: 3 },  // +2
    { tx: -90, scale: 0.36, blur: 8, opacity: 0.2,  z: 3 },  // -2
  ];

  function update() {
    const dots = dotsWrap.querySelectorAll('.drum-dot');
    dots.forEach((d, i) => d.classList.toggle('active', i === current));

    slides.forEach((slide, i) => {
      let rel = ((i - current) % n + n) % n;
      if (rel > n / 2) rel -= n; /* -n/2 .. n/2 */

      const absRel = Math.abs(rel);
      if (absRel > 2) {
        slide.style.opacity = '0';
        slide.style.pointerEvents = 'none';
        return;
      }

      const cfg = POS.find(p => p.tx === 0 && absRel === 0)
        || POS.find(p => Math.abs(p.tx) === (absRel === 1 ? 78 : 138) && (rel > 0 ? p.tx > 0 : p.tx < 0))
        || (absRel === 0 ? POS[0] : absRel === 1 ? (rel > 0 ? POS[1] : POS[2]) : (rel > 0 ? POS[3] : POS[4]));

      slide.style.transform  = `translateX(calc(-50% + ${cfg.tx}%)) translateY(-50%) scale(${cfg.scale})`;
      slide.style.filter     = cfg.blur ? `blur(${cfg.blur}px)` : 'none';
      slide.style.opacity    = cfg.opacity;
      slide.style.zIndex     = cfg.z;
      slide.style.pointerEvents = absRel === 0 ? 'none' : 'auto';
    });
  }

  /* клик по боковым — переход к ним */
  slides.forEach((slide, i) => {
    slide.addEventListener('click', () => {
      if (i !== current) goTo(i);
    });
  });

  function goTo(idx) {
    current = ((idx % n) + n) % n;
    update();
    resetTimer();
  }

  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), 2500);
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));
  slider.addEventListener('mouseenter', () => clearInterval(timer));
  slider.addEventListener('mouseleave', resetTimer);

  /* свайп на мобилке */
  let touchX = 0;
  slider.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
  slider.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) goTo(dx < 0 ? current + 1 : current - 1);
  }, { passive: true });

  update();
  resetTimer();
})();

/* ── DYNAMIC MEMBERS ────────────────────────────────────── */
const memberModal        = document.getElementById('memberModal');
const memberModalClose   = document.getElementById('memberModalClose');
const memberModalAva     = document.getElementById('memberModalAva');
const memberModalName    = document.getElementById('memberModalName');
const memberModalRole    = document.getElementById('memberModalRole');
const memberModalTags    = document.getElementById('memberModalTags');
const memberModalDesc    = document.getElementById('memberModalDesc');
const memberModalSince   = document.getElementById('memberModalSince');

function openMemberModal({ avatarSrc, name, role, description, tags, since }) {
  memberModalAva.src          = avatarSrc || '';
  memberModalName.textContent = name || '';
  memberModalRole.textContent = role || '';

  memberModalTags.innerHTML   = (tags && tags.length)
    ? tags.map(t => `<span class="member-modal-tag${t.accent ? ' accent' : ''}">${t.text}</span>`).join('')
    : '';

  memberModalDesc.textContent = description || '';
  memberModalDesc.style.display = description ? '' : 'none';

  memberModalSince.textContent  = since || '';
  memberModalSince.style.display = since ? '' : 'none';

  memberModal.classList.add('open');
}

memberModalClose.addEventListener('click', () => memberModal.classList.remove('open'));
memberModal.addEventListener('click', e => { if (e.target === memberModal) memberModal.classList.remove('open'); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') memberModal.classList.remove('open'); });

const membersSection = document.getElementById('members');
const membersGlow    = membersSection && membersSection.querySelector('.members-glow');
if (membersSection && membersGlow) {
  membersSection.addEventListener('mousemove', e => {
    const r = membersSection.getBoundingClientRect();
    membersGlow.style.left = (e.clientX - r.left) + 'px';
    membersGlow.style.top  = (e.clientY - r.top)  + 'px';
  });
}

function addGlow(card) {
  const glow = document.createElement('span');
  glow.className = 'card-glow';
  card.appendChild(glow);
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    glow.style.setProperty('--gx', `${e.clientX - r.left}px`);
    glow.style.setProperty('--gy', `${e.clientY - r.top}px`);
  });
  card.addEventListener('mouseleave', () => {
    glow.style.setProperty('--gx', '-999px');
    glow.style.setProperty('--gy', '-999px');
  });
}

(async () => {
  try {
    const res = await fetch('/api/members');
    if (!res.ok) return;
    const members = await res.json();
    if (!members.length) return;

    const grid = document.querySelector('.members-grid');

    members.forEach(user => {
      const tags = (user.tags || []).map((t, i, arr) => ({ text: t, accent: i === arr.length - 1 }));
      let since = null;
      if (user.joined_at) {
        const d = new Date(user.joined_at);
        since = 'В клане с ' + d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
      }
      const role = user.site_role || 'Участник';
      const userData = {
        avatarSrc:   user.avatar_url,
        name:        user.nickname,
        role,
        description: user.description || '',
        tags,
        since,
      };

      const card = document.createElement('div');
      card.className = 'member-card rv';
      card.dataset.role = role;
      if (role === 'Основатель') card.classList.add('is-leader');
      card.innerHTML = `
        <div class="member-ava"><img src="${user.avatar_url}" alt="${user.nickname}"></div>
        <div class="member-name">${user.nickname}</div>
        ${tags.length ? `<div class="member-tags">${tags.map(t => `<span class="member-tag${t.accent ? ' accent' : ''}">${t.text}</span>`).join('')}</div>` : ''}
        ${user.description ? `<div class="member-desc">${user.description}</div>` : ''}
        <div class="member-card-more">Подробнее →</div>
      `;
      card._userData = userData;

      addGlow(card);
      card.addEventListener('click', () => openMemberModal(card._userData));

      obs.observe(card);
      grid.appendChild(card);
    });
  } catch (e) { /* API недоступен (статика/оффлайн) */ }
})();

/* ── ABOUT KEYWORD FLASH ────────────────────────────────── */
(function () {
  const words = ['Minecraft', 'компания', 'десяти лет', 'разные люди', 'смех', 'поддержку', '2026-м', 'органично'];
  const copy = document.querySelector('.about-copy');
  if (!copy) return;
  copy.querySelectorAll('p').forEach(p => {
    let html = p.innerHTML;
    words.forEach(w => {
      html = html.replace(new RegExp(w, 'g'), `<span class="about-kw">${w}</span>`);
    });
    p.innerHTML = html;
  });
  const kws = Array.from(copy.querySelectorAll('.about-kw'));
  if (!kws.length) return;
  function flash() {
    const el = kws[Math.floor(Math.random() * kws.length)];
    el.classList.add('lit');
    setTimeout(() => el.classList.remove('lit'), 900 + Math.random() * 400);
    setTimeout(flash, 1200 + Math.random() * 1800);
  }
  setTimeout(flash, 2000);
})();

/* ── NAV AUTH STATE ─────────────────────────────────────── */
(async () => {
  const authBtn   = document.getElementById('navAuthBtn');
  const profile   = document.getElementById('navProfile');
  const profileAva  = document.getElementById('navProfileAva');
  const profileName = document.getElementById('navProfileName');
  if (!authBtn) return;

  try {
    const res = await fetch('/api/user/me');
    if (res.ok) {
      const user = await res.json();
      authBtn.style.display = 'none';
      profileAva.src = user.avatar_url;
      profileName.textContent = user.nickname;
      profile.style.display = 'flex';
    }
  } catch { /* оффлайн или статика — просто показываем кнопку Войти */ }
})();
