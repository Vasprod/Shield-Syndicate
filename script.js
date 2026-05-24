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
