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

/* ── GALLERY SLIDER ─────────────────────────────────────── */
(function () {
  const slides   = document.querySelectorAll('.gallery-slide');
  const dotsWrap = document.getElementById('galleryDots');
  const prevBtn  = document.getElementById('galleryPrev');
  const nextBtn  = document.getElementById('galleryNext');
  if (!slides.length) return;

  let current = 0;
  let timer;

  // создаём точки
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'gallery-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  function goTo(n) {
    slides[current].classList.remove('active');
    dotsWrap.children[current].classList.remove('active');
    current = (n + slides.length) % slides.length;
    slides[current].classList.add('active');
    dotsWrap.children[current].classList.add('active');
    resetTimer();
  }

  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), 5000);
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  // пауза при наведении
  const slider = document.querySelector('.gallery-slider');
  slider.addEventListener('mouseenter', () => clearInterval(timer));
  slider.addEventListener('mouseleave', resetTimer);

  resetTimer();
})();

/* ── DYNAMIC MEMBERS ────────────────────────────────────── */
const memberModal        = document.getElementById('memberModal');
const memberModalClose   = document.getElementById('memberModalClose');
const memberModalAva     = document.getElementById('memberModalAva');
const memberModalName    = document.getElementById('memberModalName');
const memberModalRole    = document.getElementById('memberModalRole');
const memberModalDesc    = document.getElementById('memberModalDesc');
const memberModalSince   = document.getElementById('memberModalSince');

function openMemberModal(user) {
  memberModalAva.src        = user.avatar_url;
  memberModalName.textContent = user.nickname;
  memberModalRole.textContent = 'Участник';
  memberModalDesc.textContent = user.description || 'Описание не указано';
  if (user.joined_at) {
    const d = new Date(user.joined_at);
    memberModalSince.textContent = 'В клане с ' + d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  memberModal.classList.add('open');
}

memberModalClose.addEventListener('click', () => memberModal.classList.remove('open'));
memberModal.addEventListener('click', e => { if (e.target === memberModal) memberModal.classList.remove('open'); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') memberModal.classList.remove('open'); });

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
      const card = document.createElement('div');
      card.className = 'member-card rv';

      const hasLongDesc = user.description && user.description.length > 80;

      card.innerHTML = `
        <div class="member-ava"><img src="${user.avatar_url}" alt="${user.nickname}"></div>
        <div class="member-name">${user.nickname}</div>
        <div class="member-role">Участник</div>
        ${user.description ? `<div class="member-desc">${user.description}</div>` : ''}
        ${hasLongDesc ? `<button class="member-desc-btn">Подробнее</button>` : ''}
        <div class="member-tags"></div>
      `;

      if (hasLongDesc) {
        card.querySelector('.member-desc-btn').addEventListener('click', () => openMemberModal(user));
      }

      addGlow(card);
      obs.observe(card);
      grid.appendChild(card);
    });
  } catch (e) { /* API недоступен (статика/оффлайн) */ }
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
