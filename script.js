/* ═══════════════════════════════════════════════════════════
   OmarsWorld v7 — script.js
   Cinematic Portfolio — Refined JavaScript
   
   New in v7:
   ─────────
   • Animated number counters (Numbers section)
   • Build progress bars (Currently Building section)
   • Dedicated observers per section type
   • All previous: cursor, magnetic, parallax, tilt,
     scroll reveal, skill bars, Q&A, form, nav
═══════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────────
   SELECTORS
───────────────────────────────────────────────────────── */
const cursorDot  = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');
const progressBar = document.getElementById('progress-bar');
const nav        = document.getElementById('nav');
const navBurger  = document.getElementById('nav-burger');
const navList    = document.getElementById('nav-list');
const form       = document.getElementById('contact-form');
const formOk     = document.getElementById('form-ok');

const srFades    = document.querySelectorAll('.sr-fade');
const srUps      = document.querySelectorAll('.sr-up');
const skillFills = document.querySelectorAll('.sk-fill[data-pct]');
const btrFills   = document.querySelectorAll('.btr-fill[data-pct]');
const numVals    = document.querySelectorAll('.num-val[data-count]');
const qaItems    = document.querySelectorAll('.qa-item');
const tiltEls    = document.querySelectorAll('.tilt[data-tilt]');
const magEls     = document.querySelectorAll('[data-mag]');
const blobs      = document.querySelectorAll('.blob[data-depth]');
const sections   = document.querySelectorAll('section[id]');
const navLinks   = document.querySelectorAll('.nav-a');

/* ─────────────────────────────────────────────────────────
   FUNCTIONS
───────────────────────────────────────────────────────── */

/* ══ 1. CUSTOM CURSOR ════════════════════════════════════
   Dot snaps instantly. Ring lerps behind for cinematic feel.
═══════════════════════════════════════════════════════ */
let mx = -300, my = -300, rx = -300, ry = -300;
const LERP = 0.13;

function tickCursor() {
  cursorDot.style.left = mx + 'px';
  cursorDot.style.top  = my + 'px';

  rx += (mx - rx) * LERP;
  ry += (my - ry) * LERP;
  cursorRing.style.left = rx + 'px';
  cursorRing.style.top  = ry + 'px';

  requestAnimationFrame(tickCursor);
}

/** Expand cursor on interactive elements */
function bindCursorGrow() {
  const targets = document.querySelectorAll(
    'a, button, .tilt, input, textarea, .process-step, .proj-card, .pc-chips span, .tool-tags span, .hstat, .lchip'
  );
  targets.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cur-on'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cur-on'));
  });
}

/* ══ 2. MAGNETIC ELEMENTS ════════════════════════════════
   [data-mag] elements attract toward cursor (subtle pull).
═══════════════════════════════════════════════════════ */
function initMagnetic() {
  magEls.forEach(el => {
    el.addEventListener('mousemove', e => {
      const r  = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width  / 2)) * 0.27;
      const dy = (e.clientY - (r.top  + r.height / 2)) * 0.27;
      el.style.transform = `translate(${dx}px, ${dy}px) scale(1.03)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });
}

/* ══ 3. PARALLAX BLOBS ═══════════════════════════════════
   Hero background blobs shift with mouse for depth layers.
=══════════════════════════════════════════════════════ */
function initParallax() {
  const W = window.innerWidth  / 2;
  const H = window.innerHeight / 2;
  document.addEventListener('mousemove', e => {
    const nx = (e.clientX - W) / W;
    const ny = (e.clientY - H) / H;
    blobs.forEach(b => {
      const d  = parseFloat(b.dataset.depth) || 0.03;
      b.style.transform = `translate(${nx * d * 80}px, ${ny * d * 60}px)`;
    });
  }, { passive: true });
}

/* ══ 4. SCROLL EVENTS ════════════════════════════════════
   Progress bar + frosted nav + active nav link.
=══════════════════════════════════════════════════════ */
function onScroll() {
  const sy  = window.scrollY;
  const max = document.body.scrollHeight - window.innerHeight;

  // Progress bar
  progressBar.style.width = (max > 0 ? (sy / max) * 100 : 0).toFixed(2) + '%';

  // Nav frosted glass
  nav.classList.toggle('scrolled', sy > 60);

  // Active nav link
  let current = '';
  sections.forEach(s => { if (sy >= s.offsetTop - 110) current = s.id; });
  navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + current));
}

/* ══ 5. SCROLL REVEAL ════════════════════════════════════
   IntersectionObserver for .sr-fade and .sr-up.
=══════════════════════════════════════════════════════ */
function initScrollReveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('vis');
      io.unobserve(e.target);
    });
  }, { threshold: 0.08 });
  [...srFades, ...srUps].forEach(el => io.observe(el));
}

/* ══ 6. SKILL BARS ═══════════════════════════════════════
   Animate width when bars scroll into view.
=══════════════════════════════════════════════════════ */
function initSkillBars() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      setTimeout(() => { e.target.style.width = (e.target.dataset.pct || 0) + '%'; }, 260);
      io.unobserve(e.target);
    });
  }, { threshold: 0.4 });
  [...skillFills, ...btrFills].forEach(el => io.observe(el));
}

/* ══ 7. NUMBER COUNTERS ══════════════════════════════════
   Animates from 0 to [data-count] with easing.
   Fires once when the Numbers section enters viewport.
=══════════════════════════════════════════════════════ */
function countUp(el, target, duration) {
  const start    = performance.now();
  const from     = 0;

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(from + (target - from) * eased);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  }
  requestAnimationFrame(step);
}

function initCounters() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const target = parseInt(e.target.dataset.count) || 0;
      countUp(e.target, target, 1600);
      io.unobserve(e.target);
    });
  }, { threshold: 0.5 });
  numVals.forEach(el => io.observe(el));
}

/* ══ 8. 3D TILT ══════════════════════════════════════════
   Perspective rotation on [data-tilt] elements.
=══════════════════════════════════════════════════════ */
function initTilt() {
  tiltEls.forEach(el => {
    el.addEventListener('mousemove', e => {
      const r  = el.getBoundingClientRect();
      const nx = ((e.clientX - r.left)  / r.width  - 0.5) * 2;
      const ny = ((e.clientY - r.top)   / r.height - 0.5) * 2;
      el.style.transform  = `perspective(700px) rotateX(${-ny * 6}deg) rotateY(${nx * 6}deg)`;
      el.style.transition = 'transform 0.08s linear';
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform  = '';
      el.style.transition = 'transform 0.55s var(--ease)';
    });
  });
}

/* ══ 9. Q&A ACCORDION ════════════════════════════════════
   One item open at a time; max-height CSS transition.
=══════════════════════════════════════════════════════ */
function initQA() {
  qaItems.forEach(item => {
    const btn   = item.querySelector('.qa-btn');
    const panel = item.querySelector('.qa-panel');

    btn.addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');

      // Close all
      qaItems.forEach(i => {
        i.classList.remove('open');
        i.querySelector('.qa-btn').setAttribute('aria-expanded', 'false');
        i.querySelector('.qa-panel').classList.remove('open');
      });

      // Open if was closed
      if (!wasOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        panel.classList.add('open');
      }
    });
  });
}

/* ══ 10. CONTACT FORM ════════════════════════════════════
   Front-end validation + success toast.
=══════════════════════════════════════════════════════ */
function initForm() {
  form.addEventListener('submit', e => {
    e.preventDefault();

    const name  = document.getElementById('f-name').value.trim();
    const email = document.getElementById('f-email').value.trim();
    const msg   = document.getElementById('f-msg').value.trim();

    if (!name || !email || !msg || !isEmail(email)) {
      shakeEl(form.querySelector('.form-card'));
      return;
    }

    form.reset();
    formOk.classList.add('show');
    setTimeout(() => formOk.classList.remove('show'), 6000);
  });
}

/* ══ 11. MOBILE NAV ══════════════════════════════════════
=══════════════════════════════════════════════════════ */
function initMobileNav() {
  navBurger.addEventListener('click', () => {
    const open = navList.classList.toggle('open');
    navBurger.classList.toggle('open', open);
    navBurger.setAttribute('aria-expanded', open);
  });
  document.addEventListener('click', e => {
    if (!nav.contains(e.target)) {
      navList.classList.remove('open');
      navBurger.classList.remove('open');
    }
  });
}

/* ══ 12. SMOOTH SCROLL ═══════════════════════════════════
=══════════════════════════════════════════════════════ */
function initSmoothScroll() {
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || href === '#') return;
    e.preventDefault();
    navList.classList.remove('open');
    navBurger.classList.remove('open');
    const target = document.querySelector(href);
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY - 78;
    window.scrollTo({ top, behavior: 'smooth' });
  });
}

/* ─── HELPERS ──────────────────────────────────────────── */
function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

function shakeEl(el) {
  el.style.animation = 'none';
  void el.offsetHeight;
  el.style.animation = '_shake 0.44s ease';
  setTimeout(() => (el.style.animation = ''), 480);
}

(function injectShake() {
  const s = document.createElement('style');
  s.textContent = `@keyframes _shake {
    0%,100%{transform:translateX(0)}
    16%{transform:translateX(-9px)}
    36%{transform:translateX(9px)}
    54%{transform:translateX(-6px)}
    74%{transform:translateX(6px)}
  }`;
  document.head.appendChild(s);
})();

/* ─────────────────────────────────────────────────────────
   BOOT
───────────────────────────────────────────────────────── */
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
tickCursor();
bindCursorGrow();

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

initMagnetic();
initParallax();
initScrollReveal();
initSkillBars();
initCounters();
initTilt();
initQA();
initForm();
initMobileNav();
initSmoothScroll();