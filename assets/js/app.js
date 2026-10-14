/* Hotem — interactions & animation */
(() => {
  'use strict';

  const DISHES = window.HOTEM_DISHES;
  const byId = Object.fromEntries(DISHES.map((d) => [d.id, d]));
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const money = (n) => '$' + (Number.isInteger(n) ? n : n.toFixed(2));

  const store = {
    get(key, fallback) {
      try { return JSON.parse(localStorage.getItem('hotem:' + key)) ?? fallback; } catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem('hotem:' + key, JSON.stringify(value)); } catch { /* storage unavailable */ }
    }
  };

  const ARROW = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  const HEART = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20Z"/></svg>';
  const CHILI = '<svg viewBox="0 0 32 32" fill="currentColor"><path d="M22.6 6.2c.9-1.6 2.3-2.6 3.9-2.9.5-.1.7.5.3.8-1.2.7-2 1.6-2.4 2.8 1.5.9 2.3 2.5 2.1 4.4-.6 6.6-6.8 14.4-17.6 17.4-1.4.4-2.2-1.4-1-2.2 5.2-3.4 8-7.4 9.4-12.4.8-2.9 2.4-5.4 5.3-7.9Z"/></svg>';

  /* ------------------------------------------------------------------
     Intro
     ------------------------------------------------------------------ */
  $$('.hero__title .word').forEach((w, i) => w.style.setProperty('--i', i));
  $$('.reveal-up').forEach((w, i) => w.style.setProperty('--i', i));

  const ready = () => {
    document.body.classList.add('is-ready');
    document.body.classList.remove('is-loading');
  };
  const minIntro = new Promise((r) => setTimeout(r, reduced ? 0 : 1300));
  const loaded = new Promise((r) => (document.readyState === 'complete' ? r() : addEventListener('load', r, { once: true })));
  Promise.race([Promise.all([minIntro, loaded]), new Promise((r) => setTimeout(r, 3500))]).then(ready);

  /* ------------------------------------------------------------------
     Drag-to-rotate
     ------------------------------------------------------------------ */
  class Rotator {
    constructor(el, { maxY = 36, maxX = 20, idle = true } = {}) {
      this.el = el;
      this.tilt = $('.rotator__tilt', el);
      this.shine = $('.rotator__shine', el);
      this.shadow = $('.rotator__shadow', el);
      this.max = { x: maxX, y: maxY };
      this.raw = { x: 0, y: 0 };
      this.vel = { x: 0, y: 0 };
      this.hover = { x: 0, y: 0 };
      this.idle = idle && !reduced;
      this.dragging = false;
      this.visible = true;
      this.bind();
      new IntersectionObserver(([e]) => {
        this.visible = e.isIntersecting;
        if (this.visible) this.start();
      }).observe(el);
      this.start();
    }

    bind() {
      const el = this.el;
      let lx = 0;
      let ly = 0;
      el.addEventListener('pointerdown', (e) => {
        if (e.button !== 0) return;
        this.dragging = true;
        lx = e.clientX;
        ly = e.clientY;
        this.vel.x = this.vel.y = 0;
        el.setPointerCapture(e.pointerId);
        el.classList.add('is-dragging');
        this.start();
      });
      el.addEventListener('pointermove', (e) => {
        if (this.dragging) {
          const dx = e.clientX - lx;
          const dy = e.clientY - ly;
          lx = e.clientX;
          ly = e.clientY;
          this.raw.y += dx * 0.42;
          this.raw.x -= dy * 0.3;
          this.vel.y = dx * 0.42;
          this.vel.x = -dy * 0.3;
        } else if (e.pointerType === 'mouse') {
          const r = el.getBoundingClientRect();
          this.hover.y = ((e.clientX - r.left) / r.width - 0.5) * 14;
          this.hover.x = -((e.clientY - r.top) / r.height - 0.5) * 10;
          this.start();
        }
      });
      const end = () => {
        this.dragging = false;
        el.classList.remove('is-dragging');
      };
      el.addEventListener('pointerup', end);
      el.addEventListener('pointercancel', end);
      el.addEventListener('pointerleave', () => { this.hover.x = this.hover.y = 0; });
    }

    kick(amount = 9) {
      this.vel.y += amount;
      this.vel.x -= amount * 0.35;
      this.start();
    }

    start() {
      if (this.raf || !this.visible) return;
      const tick = (t) => {
        this.raf = 0;
        this.step(t);
        const settled = !this.idle && !this.dragging &&
          Math.abs(this.raw.x - this.hover.x) < 0.02 && Math.abs(this.raw.y - this.hover.y) < 0.02 &&
          Math.abs(this.vel.x) < 0.01 && Math.abs(this.vel.y) < 0.01;
        if (this.visible && !settled) this.raf = requestAnimationFrame(tick);
      };
      this.raf = requestAnimationFrame(tick);
    }

    step(t) {
      if (!this.dragging) {
        this.raw.x += this.vel.x;
        this.raw.y += this.vel.y;
        this.vel.x *= 0.9;
        this.vel.y *= 0.9;
        const ty = this.hover.y + (this.idle ? Math.sin(t * 0.0007) * 8 : 0);
        const tx = this.hover.x + (this.idle ? Math.sin(t * 0.0005 + 1) * 3 : 0);
        this.raw.x += (tx - this.raw.x) * 0.05;
        this.raw.y += (ty - this.raw.y) * 0.05;
      }
      // rubber-band past the limits: a photo can only turn so far
      const ry = this.max.y * Math.tanh(this.raw.y / this.max.y);
      const rx = this.max.x * Math.tanh(this.raw.x / this.max.x);
      if (this.dragging) {
        this.raw.y = clamp(this.raw.y, -this.max.y * 2.2, this.max.y * 2.2);
        this.raw.x = clamp(this.raw.x, -this.max.x * 2.2, this.max.x * 2.2);
      }
      const s = this.tilt.style;
      s.setProperty('--rx', rx.toFixed(2) + 'deg');
      s.setProperty('--ry', ry.toFixed(2) + 'deg');
      s.setProperty('--rz', (ry * 0.08).toFixed(2) + 'deg');
      if (this.shine) this.shine.style.setProperty('--sx', (50 - ry * 1.6).toFixed(1) + '%');
      if (this.shadow) this.shadow.style.translate = `${(-ry * 0.9).toFixed(1)}px 0`;
    }

    setMask(src) {
      if (!this.shine) return;
      const v = src ? `url("${new URL(src, location.href).href}")` : 'none';
      this.shine.style.webkitMaskImage = v;
      this.shine.style.maskImage = v;
    }
  }

  const heroRotator = new Rotator($('.rotator--hero'), { maxY: 30, maxX: 16 });
  heroRotator.setMask('assets/img/hero-ramen.webp');
  const dishRotator = new Rotator($('.rotator--dish'), { maxY: 34, maxX: 18 });

  $('.drag-badge').addEventListener('click', () => heroRotator.kick(14));

  /* ------------------------------------------------------------------
     Floating particles + parallax
     ------------------------------------------------------------------ */
  const particles = $('.particles');
  const rand = (a, b) => a + Math.random() * (b - a);
  const kinds = [['sesame', 7, 11], ['drop', 10, 22], ['ring', 14, 26], ['seed', 4, 7], ['sesame', 6, 9], ['drop', 8, 16]];
  for (let i = 0; i < (innerWidth < 640 ? 12 : 22); i++) {
    const [kind, a, b] = kinds[i % kinds.length];
    const p = document.createElement('span');
    p.className = 'particle particle--' + kind;
    // keep them around the bowl, not on it
    const angle = rand(0, Math.PI * 2);
    const dist = rand(0.36, 0.5);
    p.style.cssText = [
      `--x:${(50 + Math.cos(angle) * dist * 100).toFixed(1)}%`,
      `--y:${(48 + Math.sin(angle) * dist * 92).toFixed(1)}%`,
      `--s:${rand(a, b).toFixed(1)}px`,
      `--d:${rand(5, 9).toFixed(1)}s`,
      `--delay:${(-rand(0, 8)).toFixed(1)}s`,
      `--dx:${rand(-18, 18).toFixed(0)}px`,
      `--dy:${rand(-34, -10).toFixed(0)}px`,
      `--r:${rand(-200, 200).toFixed(0)}deg`,
      `--z:${rand(0.2, 1.4).toFixed(2)}`
    ].join(';');
    particles.appendChild(p);
  }

  const hero = $('.hero');
  if (!reduced) {
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      particles.style.setProperty('--mx', ((e.clientX - r.left) / r.width - 0.5) * -40 + 'px');
      particles.style.setProperty('--my', ((e.clientY - r.top) / r.height - 0.5) * -30 + 'px');
    });
    hero.addEventListener('pointerleave', () => {
      particles.style.setProperty('--mx', '0px');
      particles.style.setProperty('--my', '0px');
    });
  }

  /* ------------------------------------------------------------------
     Header
     ------------------------------------------------------------------ */
  const nav = $('.nav');
  const ink = $('.nav__ink');
  const navLinks = $$('.nav__links a');
  let activeLink = null;

  const moveInk = (a) => {
    if (!a) { ink.style.opacity = 0; return; }
    ink.style.opacity = 1;
    ink.style.width = a.offsetWidth - 40 + 'px';
    ink.style.transform = `translateX(${a.offsetLeft + 20}px)`;
  };
  const setActive = (a) => {
    activeLink = a;
    navLinks.forEach((l) => l.classList.toggle('is-active', l === a));
    moveInk(a);
  };
  navLinks.forEach((a) => a.addEventListener('mouseenter', () => moveInk(a)));
  $('.nav__links').addEventListener('mouseleave', () => moveInk(activeLink));

  const burger = $('.burger');
  burger.addEventListener('click', () => {
    const open = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open);
  });
  const closeNav = () => {
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
  };

  /* ------------------------------------------------------------------
     Scroll effects
     ------------------------------------------------------------------ */
  const heroVisualRot = $('.rotator--hero');
  const storyTitle = $('.story__title');
  storyTitle.innerHTML = storyTitle.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(' ');
  const storyWords = $$('.w', storyTitle);

  let scrollQueued = false;
  const onScroll = () => {
    scrollQueued = false;
    const y = scrollY;
    nav.classList.toggle('is-scrolled', y > 10);
    if (!reduced && !homeHidden()) {
      if (y < innerHeight * 1.2) {
        heroVisualRot.style.translate = `0 ${(y * 0.18).toFixed(1)}px`;
        heroVisualRot.style.rotate = `${(y * 0.012).toFixed(2)}deg`;
        heroVisualRot.style.scale = String(1 - Math.min(y, 800) * 0.00012);
      }
      const r = storyTitle.getBoundingClientRect();
      const p = clamp((innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35), 0, 1);
      const lit = Math.round(p * storyWords.length);
      storyWords.forEach((w, i) => w.classList.toggle('is-lit', i < lit));
    }
  };
  addEventListener('scroll', () => {
    if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  if (reduced) storyWords.forEach((w) => w.classList.add('is-lit'));

  // reveal on enter
  const revealer = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      revealer.unobserve(e.target);
      const num = e.target.querySelector?.('[data-count]');
      if (num) countUp(num, +num.dataset.count, 1400);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  const watch = (els) => els.forEach((el, i) => {
    if (!el.style.getPropertyValue('--i')) el.style.setProperty('--i', i % 3);
    revealer.observe(el);
  });

  // scrollspy for the nav underline
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting && !homeHidden()) setActive(navLinks.find((a) => a.dataset.section === e.target.id) || null);
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['menu', 'story', 'reserve'].forEach((id) => spy.observe(document.getElementById(id)));
  new IntersectionObserver(([e]) => { if (e.isIntersecting && !homeHidden()) setActive(null); }, { rootMargin: '-45% 0px -50% 0px' }).observe(hero);

  function countUp(el, to, dur = 1000, delay = 0) {
    if (reduced) { el.textContent = to; return; }
    const t0 = performance.now() + delay;
    const tick = (t) => {
      const p = clamp((t - t0) / dur, 0, 1);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ------------------------------------------------------------------
     Signature strip
     ------------------------------------------------------------------ */
  const sigWrap = $('.signature__inner');
  sigWrap.innerHTML = DISHES.filter((d) => d.thumb).map((d, i) => `
    <a class="sig" href="#/dish/${d.id}" data-dish="${d.id}" style="--i:${i}">
      <img class="sig__img" src="${d.thumb}" alt="" width="136" height="130" loading="lazy">
      <span class="sig__name">${d.short}</span>
      <span class="round-arrow">${ARROW}</span>
    </a>`).join('');
  watch([$('.signature')]);

  /* ------------------------------------------------------------------
     Menu grid + filters
     ------------------------------------------------------------------ */
  const grid = $('#grid');
  const favs = new Set(store.get('favs', []));
  grid.innerHTML = DISHES.map((d, i) => `
    <article class="card" data-cat="${d.category}" data-dish="${d.id}" style="--i:${i % 3}">
      <div class="card__media">
        <img src="${d.card}" alt="${d.name}" width="442" height="272" loading="lazy">
        <span class="badge">${d.category}</span>
        <button class="heart${favs.has(d.id) ? ' is-on' : ''}" aria-label="Save ${d.name}" aria-pressed="${favs.has(d.id)}">
          ${HEART}<span class="burst">${Array.from({ length: 8 }, (_, k) => `<i style="--a:${k * 45}deg"></i>`).join('')}</span>
        </button>
      </div>
      <div class="card__body">
        <div>
          <h3 class="card__name"><a class="card__link" href="#/dish/${d.id}">${d.name}</a></h3>
          <p class="card__price">${money(d.price)}</p>
        </div>
        <span class="round-arrow" aria-hidden="true">${ARROW}</span>
      </div>
    </article>`).join('');
  watch($$('.card', grid));

  grid.addEventListener('click', (e) => {
    const heart = e.target.closest('.heart');
    if (!heart) return;
    e.preventDefault();
    const id = heart.closest('.card').dataset.dish;
    const on = !favs.has(id);
    on ? favs.add(id) : favs.delete(id);
    heart.classList.toggle('is-on', on);
    heart.setAttribute('aria-pressed', on);
    store.set('favs', [...favs]);
    toast(on ? `${byId[id].name} saved to favourites` : `${byId[id].name} removed from favourites`);
  });

  const filterPill = $('.filters__pill');
  const filterBtns = $$('.filter');
  const movePill = (btn) => {
    filterPill.style.width = btn.offsetWidth + 'px';
    filterPill.style.transform = `translate(${btn.offsetLeft}px, ${btn.offsetTop}px)`;
  };

  function applyFilter(cat) {
    const cards = $$('.card', grid);
    const before = new Map(cards.map((c) => [c, c.classList.contains('is-hidden') ? null : c.getBoundingClientRect()]));
    cards.forEach((c) => c.classList.toggle('is-hidden', !(cat === 'all' || c.dataset.cat === cat)));
    if (reduced) return;
    let n = 0;
    cards.forEach((c) => {
      if (c.classList.contains('is-hidden')) return;
      c.classList.add('is-in');
      const a = before.get(c);
      const b = c.getBoundingClientRect();
      if (!a) {
        c.animate([{ opacity: 0, transform: 'translateY(30px) scale(0.92)' }, { opacity: 1, transform: 'none' }],
          { duration: 600, delay: n++ * 60, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'backwards' });
      } else if (a.left !== b.left || a.top !== b.top) {
        c.animate([{ transform: `translate(${a.left - b.left}px, ${a.top - b.top}px)` }, { transform: 'none' }],
          { duration: 650, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
      }
    });
  }

  filterBtns.forEach((btn) => btn.addEventListener('click', () => {
    filterBtns.forEach((b) => {
      b.classList.toggle('is-active', b === btn);
      b.setAttribute('aria-selected', b === btn);
    });
    movePill(btn);
    applyFilter(btn.dataset.filter);
  }));
  const syncPill = () => movePill($('.filter.is-active'));
  addEventListener('resize', () => { syncPill(); moveInk(activeLink); });
  document.fonts?.ready.then(syncPill);
  syncPill();

  /* ------------------------------------------------------------------
     Dish detail
     ------------------------------------------------------------------ */
  const home = $('#home');
  const dishEl = $('#dish');
  const dishImg = $('.dish__img');
  const hotspotsEl = $('.hotspots', dishEl);
  const thumbsEl = $('.dish__thumbs');
  const dishRot = $('.rotator--dish');
  const addBtn = $('.add-btn');
  let currentDish = null;

  const homeHidden = () => home.hidden;

  function renderView(d, idx) {
    const v = d.views[idx];
    dishImg.src = v.src;
    dishImg.width = v.w;
    dishImg.height = v.h;
    dishImg.alt = `${d.name}, view ${idx + 1}`;
    dishRot.classList.toggle('is-photo', v.kind === 'photo');
    dishRotator.setMask(v.kind === 'cut' ? v.src : null);
    hotspotsEl.innerHTML = v.hotspots.map((h, i) => {
      const dot = '<span class="hotspot__dot"></span>';
      if (h.box) {
        const [x, y, w, hh] = h.box;
        return `<span class="hotspot hotspot--box" style="--x:${x};--y:${y};--w:${w};--h:${hh};--i:${i}">${h.side === 'l' ? `${h.label}${dot}` : `${dot}${h.label}`}</span>`;
      }
      return `<span class="hotspot${h.side === 'l' ? ' hotspot--l' : ''}" style="--x:${h.x};--y:${h.y};--i:${i}">${dot}${h.label}</span>`;
    }).join('');
    $$('.thumb', thumbsEl).forEach((t, i) => {
      t.classList.toggle('is-active', i === idx);
      t.setAttribute('aria-selected', i === idx);
    });
  }

  function renderDish(d) {
    currentDish = d;
    document.title = `${d.name} — Hotem`;
    $('.dish__cat').textContent = d.category === 'Mains' ? d.short : d.category;
    $('.dish__name').textContent = d.name;
    $('.dish__price').textContent = money(d.price);
    $('.dish__desc').textContent = d.desc;
    $('.spice-num').textContent = d.spice === 0 ? '0 · mild' : d.spice;
    $('.chilis').innerHTML = Array.from({ length: 5 }, (_, i) => `<span class="chili${i < d.spice ? ' is-hot' : ''}" style="--i:${i}">${CHILI}</span>`).join('');
    $('.dish__nutrition dl').innerHTML = Object.entries(d.nutrition).map(([k, [n, u]]) =>
      `<div><dt>${k}</dt><dd><span data-n="${n}">0</span> ${u}</dd></div>`).join('');
    thumbsEl.innerHTML = d.views.map((v, i) => `
      <button class="thumb${v.kind === 'photo' ? ' thumb--photo' : ''}" role="tab" style="--i:${i}" data-view="${i}" aria-label="View ${i + 1}">
        <img src="${v.src}" alt="" loading="lazy">
      </button>`).join('');
    $$('.dish__info > *').forEach((el, i) => el.style.setProperty('--i', i));
    addBtn.classList.remove('is-added');
    $('span', addBtn).textContent = 'Add to order';
    renderView(d, 0);
  }

  function playDishIntro() {
    dishEl.classList.remove('is-in');
    void dishEl.offsetWidth; // restart transitions
    dishEl.classList.add('is-in');
    $$('[data-n]', dishEl).forEach((el, i) => countUp(el, +el.dataset.n, 1100, 450 + i * 90));
    dishRotator.kick(-10);
  }

  thumbsEl.addEventListener('click', (e) => {
    const t = e.target.closest('.thumb');
    if (!t || t.classList.contains('is-active')) return;
    const idx = +t.dataset.view;
    dishImg.classList.add('is-swapping');
    setTimeout(() => {
      renderView(currentDish, idx);
      const done = () => {
        dishImg.classList.remove('is-swapping');
        dishRotator.kick(12);
      };
      dishImg.complete ? done() : dishImg.addEventListener('load', done, { once: true });
    }, reduced ? 0 : 280);
  });

  addBtn.addEventListener('click', () => {
    if (!currentDish) return;
    fly(dishImg);
    cart.add(currentDish.id);
    addBtn.classList.add('is-added');
    $('span', addBtn).textContent = 'Added — add another?';
  });

  /* ------------------------------------------------------------------
     Router (with shared-element view transitions)
     ------------------------------------------------------------------ */
  let rendered = '';

  function showHome(target) {
    dishEl.hidden = true;
    dishEl.classList.remove('is-in');
    home.hidden = false;
    document.title = 'Hotem — Taste it from every angle';
    const el = target && document.getElementById(target);
    window.scrollTo({ top: el ? el.getBoundingClientRect().top + scrollY - 70 : 0, behavior: 'instant' });
    onScroll();
  }

  function showDish(d) {
    if (currentDish !== d) renderDish(d);
    home.hidden = true;
    dishEl.hidden = false;
    window.scrollTo({ top: 0, behavior: 'instant' });
    setActive(navLinks[0]);
  }

  function parse(hash) {
    const m = hash.match(/^#\/dish\/([\w-]+)/);
    if (m && byId[m[1]]) return { dish: byId[m[1]] };
    const id = hash.replace(/^#\/?/, '');
    return { section: ['menu', 'story', 'reserve'].includes(id) ? id : null };
  }

  function cardImgFor(id) {
    const img = $(`.card[data-dish="${id}"]:not(.is-hidden) .card__media img`);
    if (!img) return null;
    const r = img.getBoundingClientRect();
    return r.bottom > 0 && r.top < innerHeight ? img : null;
  }

  function route(animate = false) {
    const hash = location.hash;
    if (hash === rendered) return;
    const from = parse(rendered);
    const to = parse(hash);
    rendered = hash;
    closeNav();

    if (!to.dish && !from.dish) { // plain in-page scrolling on home
      if (to.section) document.getElementById(to.section).scrollIntoView({ behavior: reduced ? 'instant' : 'smooth' });
      else if (hash === '#/' || hash === '') window.scrollTo({ top: 0, behavior: reduced ? 'instant' : 'smooth' });
      return;
    }

    const update = () => {
      if (to.dish) {
        const src = cardImgFor(to.dish.id);
        if (src) src.style.viewTransitionName = '';
        showDish(to.dish);
        dishImg.style.viewTransitionName = 'dish-media';
      } else {
        dishImg.style.viewTransitionName = '';
        showHome(to.section || (from.dish ? 'menu' : null));
        const back = from.dish && cardImgFor(from.dish.id);
        if (back) back.style.viewTransitionName = 'dish-media';
      }
    };

    if (animate && document.startViewTransition && !reduced) {
      if (to.dish) {
        const src = cardImgFor(to.dish.id) || $(`.sig[data-dish="${to.dish.id}"] .sig__img`);
        if (src) src.style.viewTransitionName = 'dish-media';
      } else if (from.dish) {
        dishImg.style.viewTransitionName = 'dish-media';
      }
      const vt = document.startViewTransition(update);
      vt.finished.finally(() => $$('[style*="view-transition-name"]').forEach((el) => { el.style.viewTransitionName = ''; }));
      vt.updateCallbackDone.then(() => { if (to.dish) playDishIntro(); });
    } else {
      update();
      $$('[style*="view-transition-name"]').forEach((el) => { el.style.viewTransitionName = ''; });
      if (to.dish) playDishIntro();
    }
  }

  function go(hash) {
    if (location.hash !== hash) history.pushState(null, '', hash);
    rendered = rendered === hash ? '' : rendered; // re-run same-hash links (e.g. Menu while on Menu)
    route(true);
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || a.dataset.action) return;
    e.preventDefault();
    closeOverlays();
    go(a.getAttribute('href'));
  });
  addEventListener('popstate', () => route(true));
  route(false);

  /* ------------------------------------------------------------------
     Cart
     ------------------------------------------------------------------ */
  const drawer = $('.drawer');
  const cartBtn = $('.cart-btn');
  const cart = {
    items: store.get('cart', {}),
    add(id) {
      this.items[id] = (this.items[id] || 0) + 1;
      this.save();
    },
    set(id, q) {
      if (q <= 0) delete this.items[id];
      else this.items[id] = q;
      this.save();
    },
    clear() { this.items = {}; this.save(); },
    count() { return Object.values(this.items).reduce((a, b) => a + b, 0); },
    save() { store.set('cart', this.items); renderCart(); }
  };
  for (const id of Object.keys(cart.items)) if (!byId[id]) delete cart.items[id];

  function renderCart() {
    const ids = Object.keys(cart.items);
    const n = cart.count();
    $('.cart-btn__count').textContent = n;
    cartBtn.classList.toggle('has-items', n > 0);
    drawer.classList.toggle('is-empty', n === 0);
    $('.drawer__list').innerHTML = ids.map((id, i) => {
      const d = byId[id];
      return `<li class="line-item" data-id="${id}" style="animation-delay:${i * 50}ms">
        <img src="${d.card}" alt="">
        <div><h3>${d.name}</h3><p>${money(d.price * cart.items[id])}</p></div>
        <div class="qty">
          <button data-q="-1" aria-label="One less ${d.name}">−</button>
          <span>${cart.items[id]}</span>
          <button data-q="1" aria-label="One more ${d.name}">+</button>
        </div>
      </li>`;
    }).join('');
    $('.total').textContent = money(ids.reduce((s, id) => s + byId[id].price * cart.items[id], 0));
  }
  renderCart();

  $('.drawer__list').addEventListener('click', (e) => {
    const b = e.target.closest('[data-q]');
    if (!b) return;
    const id = b.closest('.line-item').dataset.id;
    cart.set(id, cart.items[id] + +b.dataset.q);
  });
  $('.checkout').addEventListener('click', () => {
    const n = cart.count();
    cart.clear();
    closeOverlays();
    toast(`Order placed — ${n} item${n === 1 ? '' : 's'} on the way to the pass.`);
  });

  function fly(img) {
    const r = img.getBoundingClientRect();
    const to = cartBtn.getBoundingClientRect();
    const bump = () => {
      cartBtn.classList.remove('bump');
      void cartBtn.offsetWidth;
      cartBtn.classList.add('bump');
    };
    if (reduced || !r.width) { bump(); return; }
    const size = Math.min(r.width, r.height, 240);
    const el = document.createElement('img');
    el.src = img.currentSrc || img.src;
    el.className = 'flyer';
    Object.assign(el.style, { width: size + 'px', height: size + 'px', left: 0, top: 0 });
    document.body.appendChild(el);
    const x0 = r.left + r.width / 2 - size / 2;
    const y0 = r.top + r.height / 2 - size / 2;
    const x1 = to.left + to.width / 2 - size / 2;
    const y1 = to.top + to.height / 2 - size / 2;
    const mx = (x0 + x1) / 2;
    const my = Math.min(y0, y1) - 140;
    el.animate([
      { transform: `translate(${x0}px, ${y0}px) scale(1) rotate(0)` },
      { transform: `translate(${mx}px, ${my}px) scale(0.55) rotate(-140deg)`, offset: 0.55 },
      { transform: `translate(${x1}px, ${y1}px) scale(0.08) rotate(-300deg)`, opacity: 0.4 }
    ], { duration: 900, easing: 'cubic-bezier(0.55, 0, 0.45, 1)' }).finished.then(() => {
      el.remove();
      bump();
    });
  }

  /* ------------------------------------------------------------------
     Overlays: cart drawer & search
     ------------------------------------------------------------------ */
  const searchEl = $('.search');
  const searchInput = $('input', searchEl);
  const results = $('.search__results');

  function openCart() {
    closeOverlays();
    document.body.classList.add('cart-open');
    drawer.setAttribute('aria-hidden', 'false');
    renderCart();
    setTimeout(() => $('.drawer .icon-btn').focus(), 50);
  }
  function openSearch() {
    closeOverlays();
    document.body.classList.add('search-open');
    searchEl.setAttribute('aria-hidden', 'false');
    searchInput.value = '';
    renderResults('');
    setTimeout(() => searchInput.focus(), 80);
  }
  function closeOverlays() {
    document.body.classList.remove('cart-open', 'search-open');
    drawer.setAttribute('aria-hidden', 'true');
    searchEl.setAttribute('aria-hidden', 'true');
    closeNav();
  }

  function renderResults(q) {
    q = q.trim().toLowerCase();
    const list = q ? DISHES.filter((d) => `${d.name} ${d.category} ${d.desc}`.toLowerCase().includes(q)) : DISHES;
    results.innerHTML = list.length
      ? list.map((d, i) => `<li><a href="#/dish/${d.id}" style="--i:${i}"><img src="${d.card}" alt=""><strong>${d.name}</strong><span>${money(d.price)}</span></a></li>`).join('')
      : `<li class="none">Nothing matches “${q.replace(/[<>&]/g, '')}” — try ramen or mochi.</li>`;
  }
  searchInput.addEventListener('input', () => renderResults(searchInput.value));
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { const a = $('a', results); if (a) a.click(); }
  });

  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-action]');
    if (!t) return;
    const action = t.dataset.action;
    if (action === 'cart') { e.preventDefault(); openCart(); }
    if (action === 'search') openSearch();
    if (action === 'close') closeOverlays();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeOverlays();
    if (e.key === '/' && !/input|textarea|select/i.test(document.activeElement.tagName)) {
      e.preventDefault();
      openSearch();
    }
  });

  /* ------------------------------------------------------------------
     Reservations
     ------------------------------------------------------------------ */
  const form = $('.reserve__form');
  const guests = $('output', form);
  const dateInput = form.elements.date;
  const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const today = new Date();
  dateInput.min = iso(today);
  dateInput.value = iso(new Date(today.getTime() + 86400000));

  form.addEventListener('click', (e) => {
    const b = e.target.closest('[data-step]');
    if (!b) return;
    guests.value = clamp(+guests.value + +b.dataset.step, 1, 12);
    guests.classList.remove('tick');
    void guests.offsetWidth;
    guests.classList.add('tick');
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let ok = true;
    for (const name of ['name', 'date']) {
      const input = form.elements[name];
      const bad = !input.value.trim() || (name === 'date' && input.value < dateInput.min);
      input.closest('.field').classList.toggle('is-invalid', bad);
      if (bad) ok = false;
    }
    if (!ok) { toast('Please add your name and a date.'); return; }
    const when = new Date(dateInput.value + 'T12:00').toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
    toast(`Table for ${guests.value} on ${when} at ${form.elements.time.value} — see you then, ${form.elements.name.value.trim().split(' ')[0]}!`);
    form.elements.name.value = '';
  });
  form.addEventListener('input', (e) => e.target.closest('.field')?.classList.remove('is-invalid'));

  /* ------------------------------------------------------------------
     Toast & misc reveals
     ------------------------------------------------------------------ */
  const toastEl = $('.toast');
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), 3200);
  }

  $$('.story .reveal, .reserve .reveal').forEach((el, i) => el.style.setProperty('--i', i % 3));
  watch($$('.reveal'));
  onScroll();
})();
