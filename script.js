/* =============================================================
   For Beavel Nyawira — A Cinematic 21st Birthday Experience
   script.js  ·  Orchestrates all eleven chapters
   ============================================================= */
'use strict';

/* -------------------------------------------------------------
   00 · CONFIG & DATA
   ------------------------------------------------------------- */
const CONFIG = Object.freeze({
  passcode: '010705',
  totalChapters: 11,
  musicSrc: 'assets/music/Yiruma ??? - River Flows in You.mp3',
  defaultLetter: [
    "There is a stillness in me whenever I think about you — the kind of quiet that only love makes.",
    "Twenty-one trips around the sun, and somehow the world only began to make sense when it began to include you.",
    "I remember the first time I heard you laugh. It rearranged something inside me, gently, the way sunlight rearranges a room.",
    "If I started writing every reason I love you, the ink would run out before the truth did.",
    "So today, on the first of July, I am giving you a small part of my heart — folded inside these pages.",
    "Happy 21st, my Beavel. The best chapter is the one we are still writing."
  ],
  defaultReasons: [
    "Your smile.",
    "Your kindness.",
    "The way you believe in me.",
    "Your laugh — my favorite sound.",
    "Your beautiful heart.",
    "How safe you make me feel.",
    "The little crinkle in your eyes when you’re happy.",
    "The way you say my name.",
    "Your patience with me.",
    "Your dreams.",
    "Your strength on the hard days.",
    "Your softness on the easy ones.",
    "The way you love your people.",
    "How thoughtful you are.",
    "Your handwriting.",
    "The songs you put on repeat.",
    "How you make ordinary days feel like ceremonies.",
    "Your courage.",
    "Your honesty.",
    "The future I see when I look at you.",
    "Everything about you."
  ],
  defaultTimeline: [
    { title: "First Conversation", when: "The day everything changed", text: "Three words from you, and the universe quietly rearranged its furniture." },
    { title: "First Date",         when: "An evening I remember in colors", text: "You laughed at something silly I said, and I knew." },
    { title: "Favorite Memory",    when: "A perfect ordinary day", text: "We were doing nothing, and it felt like everything." },
    { title: "Funniest Moment",    when: "I still laugh in private", text: "Some stories are too good to share — this one is ours." },
    { title: "Biggest Adventure",  when: "We were brave together",  text: "Wherever we went, the world arrived later than we did." },
    { title: "Future Dreams",      when: "Yet to come",              text: "A home with windows that face the light. You, beside me. Always." }
  ],
  defaultGallery: [
    { src: "assets/images/gallery/g1.jpg",  caption: "That golden afternoon" },
    { src: "assets/images/gallery/g2.jpg",  caption: "You, in the kitchen, dancing" },
    { src: "assets/images/gallery/g3.jpg",  caption: "Stolen moment" },
    { src: "assets/images/gallery/g4.jpg",  caption: "The walk we did twice" },
    { src: "assets/images/gallery/g5.jpg",  caption: "Quiet, the good kind" },
    { src: "assets/images/gallery/g6.jpg",  caption: "Just us" },
    { src: "assets/images/gallery/g7.jpg",  caption: "The smile I keep" },
    { src: "assets/images/gallery/g8.jpg",  caption: "You, beautifully" },
    { src: "assets/images/gallery/g9.jpg",  caption: "An ordinary day. Sacred." }
  ]
});

/* App state — minimal and explicit */
const state = {
  currentChapter: 1,
  unlocked: false,
  buffer: '',
  data: null,
  musicReady: false,
  musicMuted: false,
  reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  hasGSAP: false,
  hasLenis: false,
  transitionLock: false
};

/* -------------------------------------------------------------
   01 · TINY HELPERS
   ------------------------------------------------------------- */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const rand  = (a, b) => a + Math.random() * (b - a);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

/* Load JSON data, fall back gracefully */
async function loadData() {
  try {
    const res = await fetch('assets/data/memories.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error('no data file');
    const json = await res.json();
    state.data = {
      letter:   Array.isArray(json.letter)   && json.letter.length   ? json.letter   : CONFIG.defaultLetter,
      reasons:  Array.isArray(json.reasons)  && json.reasons.length  ? json.reasons  : CONFIG.defaultReasons,
      timeline: Array.isArray(json.timeline) && json.timeline.length ? json.timeline : CONFIG.defaultTimeline,
      gallery:  Array.isArray(json.gallery)  && json.gallery.length  ? json.gallery  : CONFIG.defaultGallery,
      marginPhotos: Array.isArray(json.marginPhotos) ? json.marginPhotos : []
    };
  } catch (_) {
    state.data = {
      letter: CONFIG.defaultLetter,
      reasons: CONFIG.defaultReasons,
      timeline: CONFIG.defaultTimeline,
      gallery: CONFIG.defaultGallery,
      marginPhotos: []
    };
  }
}

/* Robust image fallback: when /assets is missing, draw a soft gradient */
function applyImage(el, src, fallbackGradient) {
  const img = new Image();
  img.onload  = () => { el.style.backgroundImage = `url("${src}")`; };
  img.onerror = () => {
    el.style.backgroundImage = fallbackGradient ||
      'linear-gradient(135deg, #4d0c1f 0%, #c4163b 50%, #e98aa3 100%)';
  };
  img.src = src;
}

/* -------------------------------------------------------------
   02 · CHAPTER MANAGER (the cinematic page flow)
   ------------------------------------------------------------- */
const Chapters = {
  el: () => $$('.chapter'),

  async goTo(n, opts = {}) {
    n = clamp(n, 1, CONFIG.totalChapters);
    if (n === state.currentChapter || state.transitionLock) return;
    state.transitionLock = true;

    const fromEl = $(`#chapter-${state.currentChapter}`);
    const toEl   = $(`#chapter-${n}`);
    if (!toEl) { state.transitionLock = false; return; }

    /* Cinematic wipe */
    const wipe = $('.page-wipe');
    if (!state.reducedMotion && !opts.instant) {
      wipe.classList.remove('is-out');
      wipe.classList.add('is-in');
      await sleep(620);
    }

    /* Swap chapter visibility */
    if (fromEl) fromEl.classList.remove('is-active', 'is-entering');
    toEl.classList.add('is-active', 'is-entering');
    state.currentChapter = n;
    document.body.dataset.chapter = String(n);

    /* Scroll into focus */
    window.scrollTo({ top: 0, behavior: state.reducedMotion ? 'auto' : 'instant' });

    /* Reveal wipe out */
    if (!state.reducedMotion && !opts.instant) {
      wipe.classList.remove('is-in');
      wipe.classList.add('is-out');
      await sleep(640);
      wipe.classList.remove('is-out');
    }

    /* Run the chapter's "on enter" hook */
    Chapters.onEnter(n);

    /* Update progress + nav */
    UI.updateProgress();
    UI.markActiveNav();

    state.transitionLock = false;
  },

  next() { this.goTo(state.currentChapter + 1); },
  prev() { this.goTo(state.currentChapter - 1); },

  onEnter(n) {
    switch (n) {
      case 2:  Beginning.start();   break;
      case 3:  Preparing.start();   break;
      case 4:  Envelope.reset();    break;
      case 5:  Movie.start();       break;
      case 6:  Letter.start();      break;
      case 7:  Gallery.reveal();    break;
      case 8:  Journey.reveal();    break;
      case 9:  Reasons.reveal();    break;
      case 10: Cake.start();        break;
      case 11: Finale.start();      break;
      default: break;
    }
  }
};

/* -------------------------------------------------------------
   03 · UI (nav, dock, progress, music)
   ------------------------------------------------------------- */
const UI = {
  init() {
    /* Reveal nav + dock + progress after unlock */
    /* (done by Lock.unlock) */

    /* Glass nav */
    const toggle = $('.nav-toggle');
    const list   = $('.nav-list');
    toggle?.addEventListener('click', () => {
      const open = list.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    $$('.nav-list button').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = Number(btn.dataset.goto);
        Chapters.goTo(target);
        list.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    /* "data-next" buttons (cinematic continue) */
    $$('[data-next]').forEach(btn => {
      btn.addEventListener('click', () => Chapters.goTo(Number(btn.dataset.next)));
    });

    /* Music + mute + fullscreen */
    const audio = $('#bg-music');
    const playBtn = $('#music-toggle');
    const muteBtn = $('#mute-toggle');
    const fsBtn   = $('#fullscreen-toggle');

    audio.volume = 0.55;

    playBtn?.addEventListener('click', () => {
      if (audio.paused) {
        audio.play().then(() => playBtn.classList.add('is-active')).catch(() => {});
      } else {
        audio.pause(); playBtn.classList.remove('is-active');
      }
    });
    muteBtn?.addEventListener('click', () => {
      audio.muted = !audio.muted;
      state.musicMuted = audio.muted;
      muteBtn.classList.toggle('is-muted', audio.muted);
    });
    fsBtn?.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.().catch(() => {});
      } else {
        document.exitFullscreen?.();
      }
    });

    /* Keyboard navigation between chapters */
    window.addEventListener('keydown', (e) => {
      if (!state.unlocked) return;
      if (['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') { Chapters.next(); }
      if (e.key === 'ArrowLeft'  || e.key === 'PageUp')   { Chapters.prev(); }
      if (e.key === 'Escape')                              { $('.nav-list')?.classList.remove('is-open'); $('#lightbox')?.setAttribute('hidden',''); }
    });

    /* Touch swipe between chapters */
    let touchY = null, touchX = null;
    window.addEventListener('touchstart', (e) => {
      if (!state.unlocked) return;
      const t = e.touches[0]; touchY = t.clientY; touchX = t.clientX;
    }, { passive: true });
    window.addEventListener('touchend', (e) => {
      if (touchY === null) return;
      const t = e.changedTouches[0];
      const dy = t.clientY - touchY;
      const dx = t.clientX - touchX;
      touchY = touchX = null;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 80) {
        if (dx < 0) Chapters.next(); else Chapters.prev();
      }
    }, { passive: true });
  },

  showNavAndDock() {
    $('.glass-nav')?.removeAttribute('hidden');
    $('.control-dock')?.removeAttribute('hidden');
    $('.chapter-progress')?.removeAttribute('hidden');
  },

  updateProgress() {
    const n = state.currentChapter;
    $('#chapter-num').textContent = String(n);
    const fill = $('#chapter-fill');
    if (fill) fill.style.right = `${100 - (n / CONFIG.totalChapters) * 100}%`;
  },

  markActiveNav() {
    $$('.nav-list li').forEach(li => li.classList.remove('is-current'));
    const cur = $(`.nav-list button[data-goto="${state.currentChapter}"]`);
    cur?.parentElement?.classList.add('is-current');
  }
};

/* -------------------------------------------------------------
   04 · CURSOR GLOW + TRAILING HEARTS
   ------------------------------------------------------------- */
const Cursor = {
  init() {
    if (matchMedia('(pointer: coarse)').matches) return;
    const glow = $('.cursor-glow');
    const canvas = $('#cursor-hearts');
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize(); window.addEventListener('resize', resize);

    const hearts = [];
    let mx = innerWidth / 2, my = innerHeight / 2;
    let lastSpawn = 0;
    const spawnEvery = 90; // ms

    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      glow.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
      const now = performance.now();
      if (now - lastSpawn > spawnEvery) {
        hearts.push({
          x: mx, y: my,
          vx: rand(-.3, .3), vy: rand(-.8, -.3),
          size: rand(6, 12),
          life: 0, max: rand(900, 1500),
          hue: rand(340, 360)
        });
        lastSpawn = now;
        if (hearts.length > 90) hearts.splice(0, 20);
      }
    }, { passive: true });

    const drawHeart = (x, y, s, alpha, hue) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(s / 16, s / 16);
      ctx.fillStyle = `hsla(${hue}, 80%, 65%, ${alpha})`;
      ctx.beginPath();
      ctx.moveTo(0, 4);
      ctx.bezierCurveTo(0, -2, -8, -2, -8, 4);
      ctx.bezierCurveTo(-8, 10, 0, 14, 0, 18);
      ctx.bezierCurveTo(0, 14, 8, 10, 8, 4);
      ctx.bezierCurveTo(8, -2, 0, -2, 0, 4);
      ctx.fill();
      ctx.restore();
    };

    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = hearts.length - 1; i >= 0; i--) {
        const h = hearts[i];
        h.x += h.vx; h.y += h.vy; h.vy -= .02;
        h.life += 16;
        const t = h.life / h.max;
        if (t >= 1) { hearts.splice(i, 1); continue; }
        const alpha = (1 - t) * .8;
        drawHeart(h.x, h.y, h.size * (1 - t * .4), alpha, h.hue);
      }
      requestAnimationFrame(tick);
    }
    tick();
  }
};

/* -------------------------------------------------------------
   05 · AMBIENT PETAL / PARTICLE CANVAS
   ------------------------------------------------------------- */
const Petals = {
  init() {
    const canvas = $('#petals-canvas');
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize(); window.addEventListener('resize', resize);

    const petals = [];
    const target = Math.min(36, Math.floor(innerWidth / 40));
    const colorsBase = ['#e98aa3', '#c4163b', '#f5d68a', '#fbe9d2', '#f6c7d3'];
    const colorsGold  = ['#f5d68a', '#ffdf9e', '#fffaf3', '#d8b67a', '#ffedc4', '#fbe9d2'];

    const spawn = () => {
      const isGolden = state.currentChapter >= 10;
      const pal = isGolden ? colorsGold : colorsBase;
      return {
        x: rand(0, innerWidth),
        y: rand(-innerHeight, 0),
        vx: rand(-.3, .3),
        vy: rand(.5, 1.4),
        size: rand(8, 18),
        rot: rand(0, Math.PI * 2),
        vr: rand(-.02, .02),
        color: pal[Math.floor(rand(0, pal.length))],
        sway: rand(.4, 1.2),
        phase: rand(0, Math.PI * 2),
        alpha: rand(.4, .85),
        glow: isGolden ? rand(4, 12) : 0
      };
    };

    for (let i = 0; i < target; i++) petals.push(spawn());

    const drawPetal = (p) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      if (p.glow > 0) {
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.glow;
      }
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * .55, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    function tick(t) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of petals) {
        p.phase += .02;
        p.x += p.vx + Math.sin(p.phase) * p.sway * .4;
        p.y += p.vy;
        p.rot += p.vr;
        if (p.y > innerHeight + 30) {
          const s = spawn();
          Object.assign(p, s, { y: -30 });
        }
        drawPetal(p);
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
};

/* -------------------------------------------------------------
   06 · CHAPTER 1 — THE LOCK
   ------------------------------------------------------------- */
const Lock = {
  init() {
    const portrait = $('#hero-portrait');
    applyImage(portrait, 'assets/images/hero/beavel.jpg');

    const dots = $$('#keypad .dot');
    const hintBtn = $('.keypad__hint');
    const hintText = $('#keypad-hint');
    const keypad = $('#keypad');

    const render = () => {
      dots.forEach((d, i) => d.classList.toggle('is-filled', i < state.buffer.length));
    };

    const press = (key) => {
      if (state.unlocked) return;
      if (key === 'back') { state.buffer = state.buffer.slice(0, -1); render(); return; }
      if (key === 'hint') { hintText.classList.add('is-shown'); return; }
      if (state.buffer.length >= 6) return;
      state.buffer += String(key);
      render();
      if (state.buffer.length === 6) setTimeout(check, 200);
    };

    const check = () => {
      if (state.buffer === CONFIG.passcode) {
        Lock.unlock();
      } else {
        keypad.classList.add('is-shaking');
        setTimeout(() => {
          keypad.classList.remove('is-shaking');
          state.buffer = '';
          render();
        }, 500);
      }
    };

    $$('#keypad [data-key]').forEach(btn => {
      btn.addEventListener('click', () => press(btn.dataset.key));
    });
    window.addEventListener('keydown', (e) => {
      if (state.unlocked) return;
      if (/^[0-9]$/.test(e.key)) press(e.key);
      else if (e.key === 'Backspace') press('back');
      else if (e.key === 'Enter' && state.buffer.length === 6) check();
    });
  },

  unlock() {
    state.unlocked = true;
    const keypad = $('#keypad');
    keypad.classList.add('is-unlocked');

    // Start music softly
    const audio = $('#bg-music');
    audio.volume = 0;
    audio.play().then(() => {
      $('#music-toggle')?.classList.add('is-active');
      // Fade in
      const fade = setInterval(() => {
        if (audio.volume < 0.55) audio.volume = Math.min(0.55, audio.volume + 0.04);
        else clearInterval(fade);
      }, 80);
    }).catch(() => {
      /* Autoplay blocked — user can press the music button. */
    });

    // Reveal chrome
    UI.showNavAndDock();

    // Advance to the beginning after the unlock animation
    setTimeout(() => Chapters.goTo(2), 1100);
  }
};

/* -------------------------------------------------------------
   07 · CHAPTER 2 — THE BEGINNING (starry sky + constellation)
   ------------------------------------------------------------- */
const Beginning = {
  started: false,
  start() {
    if (this.started) return;
    this.started = true;
    const canvas = $('#stars-canvas');
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W, H;
    const resize = () => {
      W = canvas.width  = canvas.clientWidth * dpr;
      H = canvas.height = canvas.clientHeight * dpr;
    };
    new ResizeObserver(resize).observe(canvas);
    resize();

    // Background stars (random)
    const stars = [];
    const count = Math.min(220, Math.floor((canvas.clientWidth * canvas.clientHeight) / 9000));
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.4 * dpr + .4,
        a: Math.random() * .8 + .2,
        tw: Math.random() * 2 + .5,
        phase: Math.random() * Math.PI * 2,
        isConstellation: false
      });
    }

    // Constellation — pre-defined points in normalized (0..1) coords
    // forming an elegant sweeping arc with side clusters
    const constNorm = [
      [0.08, 0.72], [0.16, 0.58], [0.25, 0.48], [0.33, 0.42],
      [0.42, 0.38], [0.50, 0.36], [0.58, 0.38], [0.67, 0.42],
      [0.75, 0.48], [0.84, 0.58], [0.92, 0.72],
      // Branch — upper-left cluster
      [0.18, 0.35], [0.28, 0.32], [0.26, 0.42],
      // Branch — upper-right cluster
      [0.72, 0.32], [0.82, 0.28], [0.86, 0.38],
      // A few scattered bright stars outside the main arc
      [0.05, 0.25], [0.50, 0.12], [0.95, 0.30]
    ];
    const constellation = constNorm.map(([nx, ny]) => ({
      x: nx * W, y: ny * H,
      r: (1.0 + Math.random() * .6) * dpr,
      a: .85,
      tw: .6 + Math.random() * .8,
      phase: Math.random() * Math.PI * 2,
      isConstellation: true
    }));
    // Add constellation stars into the main array so they twinkle too
    stars.push(...constellation);

    let t0 = performance.now();
    const tick = (now) => {
      const t = (now - t0) / 1000;
      ctx.clearRect(0, 0, W, H);

      // Nebula
      const grd = ctx.createRadialGradient(W/2, H*.6, 0, W/2, H*.6, Math.max(W,H)*.7);
      grd.addColorStop(0, 'rgba(60,30,80,0.25)');
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0,0,W,H);

      // Stars
      for (const s of stars) {
        const a = s.isConstellation ? s.a : s.a * (.6 + .4 * Math.sin(t * s.tw + s.phase));
        ctx.fillStyle = `rgba(255,250,243,${a})`;
        if (s.isConstellation) {
          // Glowing constellation node
          ctx.save();
          ctx.shadowColor = 'rgba(245,214,138,.8)';
          ctx.shadowBlur = 12 * dpr;
          ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 1.5, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0;
          ctx.globalAlpha = .3;
          ctx.fillStyle = 'rgba(245,214,138,.3)';
          ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 4, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        } else {
          ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
        }
      }

      // Constellation lines (progressive draw, 0..1 over 3s)
      const p = clamp((t - 0.6) / 3, 0, 1);
      // Glow layer
      ctx.save();
      ctx.shadowColor = 'rgba(245,214,138,.4)';
      ctx.shadowBlur = 10 * dpr;
      ctx.strokeStyle = `rgba(245,214,138,${.35 * p})`;
      ctx.lineWidth = 1.2 * dpr;
      ctx.beginPath();
      const limit = Math.floor(p * (constellation.length - 7)); // main arc only
      for (let i = 0; i <= Math.min(limit, 10); i++) {
        const s = constellation[i];
        if (i === 0) ctx.moveTo(s.x, s.y); else ctx.lineTo(s.x, s.y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Branch 1 lines (upper-left cluster)
      const b1 = Math.floor(clamp(((t - 1.2) / 2) * 3, 0, 3));
      if (b1 >= 1) {
        ctx.strokeStyle = `rgba(245,214,138,${.4 * clamp((t - 1.2) / 2, 0, 1)})`;
        ctx.lineWidth = .8 * dpr;
        ctx.beginPath();
        ctx.moveTo(constellation[0].x, constellation[0].y);
        for (let i = 0; i <= Math.min(b1, 2); i++) {
          ctx.lineTo(constellation[11 + i].x, constellation[11 + i].y);
        }
        ctx.stroke();
      }
      // Branch 2 lines (upper-right cluster)
      const b2 = Math.floor(clamp(((t - 1.8) / 2) * 3, 0, 3));
      if (b2 >= 1) {
        ctx.strokeStyle = `rgba(245,214,138,${.4 * clamp((t - 1.8) / 2, 0, 1)})`;
        ctx.lineWidth = .8 * dpr;
        ctx.beginPath();
        ctx.moveTo(constellation[10].x, constellation[10].y);
        for (let i = 0; i <= Math.min(b2, 2); i++) {
          ctx.lineTo(constellation[14 + i].x, constellation[14 + i].y);
        }
        ctx.stroke();
      }
      ctx.restore();

      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    // GSAP date reveal if available
    const dateChars = $$('.beginning__date span');
    const quote = $('.beginning__quote');
    const cta   = $('.chapter--beginning .ghost-btn');

    if (window.gsap) {
      gsap.set(dateChars, { opacity: 0, y: 30, filter: 'blur(12px)' });
      gsap.set([quote, cta], { opacity: 0, y: 20 });
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.to(dateChars, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.2, stagger: .14 }, 1.5)
        .to(quote, { opacity: 1, y: 0, duration: 1 }, '+=0.4')
        .to(cta,   { opacity: 1, y: 0, duration: .8 }, '+=0.4');
    } else {
      dateChars.forEach((el, i) => { el.style.transition = `opacity .9s ${1.2 + i*.12}s ease, transform .9s ${1.2 + i*.12}s ease`; el.style.opacity = 0; el.style.transform = 'translateY(20px)'; requestAnimationFrame(() => { el.style.opacity = 1; el.style.transform = 'translateY(0)'; }); });
      [quote, cta].forEach((el, i) => { if (!el) return; el.style.transition = `opacity .8s ${2.6 + i*.4}s ease`; el.style.opacity = 0; requestAnimationFrame(() => el.style.opacity = 1); });
    }
  }
};

/* -------------------------------------------------------------
   08 · CHAPTER 3 — PREPARING YOUR SURPRISE
   ------------------------------------------------------------- */
const Preparing = {
  started: false,
  start() {
    if (this.started) return;
    this.started = true;
    const words = $$('.chapter--preparing .floating-word:not(.merged)');
    const merged = $('.chapter--preparing .floating-word.merged');
    const fill = $('#loader-fill');
    const pct  = $('#loader-percent');

    // Floating word reveal
    const perWord = 750;
    words.forEach((w, i) => {
      const delay = i * perWord;
      setTimeout(() => {
        if (window.gsap) {
          gsap.fromTo(w, { y: 30, opacity: 0, filter: 'blur(10px)' },
                          { y: -60, opacity: 1, filter: 'blur(0)', duration: 1.1, ease: 'power3.out',
                            onComplete: () => gsap.to(w, { opacity: 0, y: -100, duration: .9, delay: .2, ease: 'power2.in' }) });
        } else {
          w.style.transition = 'all .9s ease';
          w.style.opacity = 1; w.style.transform = 'translate(-50%, -120%)';
          setTimeout(() => { w.style.opacity = 0; }, 900);
        }
      }, delay);
    });

    // Progress bar
    const total = words.length * perWord + 800;
    const start = performance.now();
    const tick = () => {
      const t = clamp((performance.now() - start) / total, 0, 1);
      fill.style.right = `${(1 - t) * 100}%`;
      pct.textContent = Math.round(t * 100);
      if (t < 1) requestAnimationFrame(tick);
      else {
        // Merge into the name
        if (window.gsap) {
          gsap.fromTo(merged, { y: 30, opacity: 0, filter: 'blur(14px)', scale: .96 },
                              { y: 0, opacity: 1, filter: 'blur(0px)', scale: 1, duration: 1.4, ease: 'power3.out' });
        } else {
          merged.style.transition = 'all 1.2s ease';
          merged.style.opacity = 1;
        }
        // Auto-advance after a beat
        setTimeout(() => Chapters.goTo(4), 2400);
      }
    };
    requestAnimationFrame(tick);
  }
};

/* -------------------------------------------------------------
   09 · CHAPTER 4 — THE ENVELOPE
   ------------------------------------------------------------- */
const Envelope = {
  init() {
    const env = $('#envelope');
    const seal = $('#wax-seal');
    const open = () => {
      if (env.classList.contains('is-open')) return;
      env.classList.add('is-open');
      // After the letter is out, advance to the movie
      setTimeout(() => Chapters.goTo(5), 1800);
    };
    seal?.addEventListener('click', open);
    env?.addEventListener('click', (e) => {
      if (e.target.closest('.wax-seal')) return;
      open();
    });
    env?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
  },
  reset() {
    $('#envelope')?.classList.remove('is-open');
  }
};

/* -------------------------------------------------------------
   10 · CHAPTER 5 — THE MOVIE
   ------------------------------------------------------------- */
const Movie = {
  start() {
    const v = $('#movie-bg');
    if (!v) return;
    v.play?.().catch(() => { /* no video file — overlay still works */ });
  }
};

/* -------------------------------------------------------------
   11 · CHAPTER 6 — INTERACTIVE LOVE LETTER
   ------------------------------------------------------------- */
const Letter = {
  started: false,
  start() {
    if (this.started) return;
    this.started = true;
    const body = $('#letter-body');
    const paragraphs = state.data.letter;
    body.innerHTML = '';
    const photos = $$('.margin-photo');
    const photoSources = (state.data.marginPhotos && state.data.marginPhotos.length)
      ? state.data.marginPhotos
      : (state.data.gallery || []).slice(0, 4).map(g => g.src);

    photos.forEach((el, i) => {
      const src = photoSources[i];
      if (src) applyImage(el, src);
    });

    let pIndex = 0;
    const typeNextParagraph = async () => {
      if (pIndex >= paragraphs.length) return;
      const p = document.createElement('p');
      body.appendChild(p);
      requestAnimationFrame(() => p.classList.add('is-visible'));
      const text = paragraphs[pIndex];
      const caret = document.createElement('span');
      caret.className = 'caret';
      p.appendChild(caret);

      const charDelay = state.reducedMotion ? 0 : 22;
      for (let i = 0; i < text.length; i++) {
        const ch = document.createTextNode(text[i]);
        p.insertBefore(ch, caret);
        await sleep(charDelay);
      }
      caret.remove();

      // Reveal a margin photo in sync with paragraphs 2/3/4/5
      const photo = photos[pIndex];
      if (photo) photo.classList.add('is-shown');

      pIndex++;
      await sleep(380);
      typeNextParagraph();
    };
    typeNextParagraph();
  }
};

/* -------------------------------------------------------------
   12 · CHAPTER 7 — SCRAPBOOK GALLERY + LIGHTBOX
   ------------------------------------------------------------- */
const Gallery = {
  built: false,
  build() {
    if (this.built) return;
    this.built = true;
    const wrap = $('#scrapbook');
    const items = state.data.gallery;
    items.forEach((item, i) => {
      const polaroid = document.createElement('figure');
      polaroid.className = 'polaroid';
      polaroid.style.setProperty('--rot', `${rand(-5, 5).toFixed(2)}deg`);
      polaroid.tabIndex = 0;
      polaroid.dataset.index = String(i);
      const img = document.createElement('div');
      img.className = 'polaroid__img';
      applyImage(img, item.src);
      const cap = document.createElement('figcaption');
      cap.className = 'polaroid__caption';
      cap.textContent = item.caption || '';
      polaroid.appendChild(img);
      polaroid.appendChild(cap);
      polaroid.addEventListener('click', () => Lightbox.open(i));
      polaroid.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') Lightbox.open(i);
      });
      wrap.appendChild(polaroid);
    });
  },
  reveal() {
    this.build();
    const cards = $$('#scrapbook .polaroid');
    cards.forEach((c, i) => {
      setTimeout(() => c.classList.add('is-revealing'), i * 80);
    });
  }
};

const Lightbox = {
  index: 0,
  init() {
    $('.lightbox__close')?.addEventListener('click', () => this.close());
    $('.lightbox__next') ?.addEventListener('click', () => this.move(1));
    $('.lightbox__prev') ?.addEventListener('click', () => this.move(-1));
    $('#lightbox')?.addEventListener('click', (e) => { if (e.target.id === 'lightbox') this.close(); });
    window.addEventListener('keydown', (e) => {
      if ($('#lightbox')?.hasAttribute('hidden')) return;
      if (e.key === 'ArrowRight') this.move(1);
      if (e.key === 'ArrowLeft')  this.move(-1);
    });
  },
  open(i) {
    this.index = i;
    this.render();
    const lb = $('#lightbox');
    lb.removeAttribute('hidden');
    requestAnimationFrame(() => lb.classList.add('is-open'));
  },
  close() {
    const lb = $('#lightbox');
    lb.classList.remove('is-open');
    setTimeout(() => lb.setAttribute('hidden', ''), 400);
  },
  move(d) {
    const items = state.data.gallery;
    this.index = (this.index + d + items.length) % items.length;
    this.render();
  },
  render() {
    const items = state.data.gallery;
    const item = items[this.index];
    const img = $('#lightbox-img');
    const cap = $('#lightbox-caption');
    img.alt = item.caption || '';
    img.onerror = () => { img.style.background = 'linear-gradient(135deg, #4d0c1f, #c4163b)'; img.removeAttribute('src'); };
    img.src = item.src;
    cap.textContent = item.caption || '';
  }
};

/* -------------------------------------------------------------
   13 · CHAPTER 8 — JOURNEY / TIMELINE
   ------------------------------------------------------------- */
const Journey = {
  built: false,
  build() {
    if (this.built) return;
    this.built = true;
    const list = $('#timeline');
    state.data.timeline.forEach((ev, i) => {
      const li = document.createElement('li');
      li.className = 'timeline__item';
      const card = document.createElement('div');
      card.className = 'timeline__card';
      card.innerHTML = `
        <p class="timeline__when">${ev.when || ''}</p>
        <h3 class="timeline__title">${ev.title || ''}</h3>
        <p class="timeline__text">${ev.text || ''}</p>
      `;
      if (ev.image || ev.video) {
        const media = document.createElement('div');
        media.className = 'timeline__media';
        if (ev.image) applyImage(media, ev.image);
        card.appendChild(media);
      }
      const dot = document.createElement('span');
      dot.className = 'timeline__dot';
      li.appendChild(card);
      li.appendChild(dot);
      list.appendChild(li);
    });
  },
  reveal() {
    this.build();
    const cards = $$('#timeline .timeline__card');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.2 });
    cards.forEach(c => io.observe(c));
    // First few cards: ensure they appear soon if not in initial view
    cards.slice(0, 2).forEach((c, i) => setTimeout(() => c.classList.add('is-visible'), 250 + i * 200));
  }
};

/* -------------------------------------------------------------
   14 · CHAPTER 9 — 21 REASONS
   ------------------------------------------------------------- */
const Reasons = {
  built: false,
  build() {
    if (this.built) return;
    this.built = true;
    const grid = $('#reasons-grid');
    const reasons = state.data.reasons.slice(0, 21);
    while (reasons.length < 21) reasons.push("Everything about you.");
    reasons.forEach((text, i) => {
      const card = document.createElement('button');
      card.className = 'reason-card';
      card.type = 'button';
      card.setAttribute('aria-label', `Reason ${i + 1}`);
      card.innerHTML = `
        <div class="reason-card__face reason-card__face--front">
          <div>
            <div class="reason-card__num">${String(i + 1).padStart(2,'0')}</div>
            <svg class="reason-card__heart" viewBox="0 0 24 24"><path d="M12 21s-7-4.35-7-10a4.5 4.5 0 0 1 9-1 4.5 4.5 0 0 1 9 1c0 5.65-7 10-7 10z"/></svg>
            <div class="reason-card__hint">Tap to reveal</div>
          </div>
        </div>
        <div class="reason-card__face reason-card__face--back">
          <p class="reason-card__text">${text}</p>
        </div>
      `;
      card.addEventListener('click', () => card.classList.toggle('is-flipped'));
      grid.appendChild(card);
    });
  },
  reveal() {
    this.build();
    const cards = $$('#reasons-grid .reason-card');
    cards.forEach((c, i) => setTimeout(() => c.classList.add('is-visible'), i * 70));
  }
};

/* -------------------------------------------------------------
   15 · CHAPTER 10 — BIRTHDAY CAKE
   ------------------------------------------------------------- */
const Cake = {
  started: false,
  start() {
    if (this.started) return;
    this.started = true;

    const blowBtn = $('#blow-btn');
    const candles = $$('#candles .candle');
    const confettiCanvas = $('#cake-confetti');

    // Light the candles one by one (CSS handles flicker once present)
    candles.forEach((c, i) => {
      c.classList.remove('is-out');
      const flame = c.querySelector('.flame');
      if (flame) {
        flame.style.opacity = 0;
        flame.style.transform = 'scale(.2,.2)';
        flame.style.transformOrigin = 'center bottom';
        flame.style.transition = 'opacity .6s ease, transform .6s ease';
        setTimeout(() => {
          flame.style.opacity = 1;
          flame.style.transform = 'scale(1,1)';
        }, 400 + i * 240);
      }
    });

    blowBtn.addEventListener('click', () => Cake.runCountdown(candles, confettiCanvas), { once: true });
  },

  async runCountdown(candles, confettiCanvas) {
    const blowBtn = $('#blow-btn');
    const title = $('#cake-title');
    const cdEls = $$('#countdown .countdown__num');

    blowBtn.classList.add('is-hidden');

    // Countdown 3 - 2 - 1
    for (let i = 0; i < cdEls.length; i++) {
      cdEls.forEach(e => e.classList.remove('is-active'));
      cdEls[i].classList.add('is-active');
      await sleep(1000);
    }
    cdEls.forEach(e => e.classList.remove('is-active'));

    title.textContent = 'Make a Wish';
    await sleep(900);

    // Extinguish candles in sequence
    candles.forEach((c, i) => setTimeout(() => c.classList.add('is-out'), i * 130));
    await sleep(candles.length * 130 + 400);

    // Soften music
    const audio = $('#bg-music');
    if (audio && !audio.paused) {
      const fade = setInterval(() => {
        if (audio.volume > 0.25) audio.volume = Math.max(0.25, audio.volume - 0.04);
        else clearInterval(fade);
      }, 80);
    }

    // Confetti burst
    Confetti.burst(confettiCanvas);

    // Advance to finale after the moment lands
    setTimeout(() => Chapters.goTo(11), 3200);
  }
};

const Confetti = {
  burst(canvas) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const W = canvas.clientWidth, H = canvas.clientHeight;
    const colors = ['#f5d68a', '#c4163b', '#e98aa3', '#fbe9d2', '#d8b67a', '#fffaf3'];
    const parts = [];
    for (let i = 0; i < 220; i++) {
      parts.push({
        x: W / 2, y: H * .65,
        vx: rand(-6, 6), vy: rand(-14, -4),
        g: .25,
        size: rand(4, 10),
        rot: rand(0, Math.PI * 2),
        vr: rand(-.2, .2),
        color: colors[Math.floor(rand(0, colors.length))],
        life: 0, max: rand(2400, 4200)
      });
    }
    let last = performance.now();
    function tick(now) {
      const dt = Math.min(50, now - last); last = now;
      ctx.clearRect(0, 0, W, H);
      let alive = 0;
      for (const p of parts) {
        p.life += dt; if (p.life > p.max) continue;
        alive++;
        p.vy += p.g; p.x += p.vx; p.y += p.vy;
        p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = clamp(1 - (p.life / p.max), 0, 1);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      }
      if (alive > 0) requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, W, H);
    }
    requestAnimationFrame(tick);
  }
};

/* -------------------------------------------------------------
   16 · CHAPTER 11 — FINALE (fireworks)
   ------------------------------------------------------------- */
const Finale = {
  started: false,
  start() {
    if (this.started) return;
    this.started = true;

    const canvas = $('#fireworks-canvas');
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    new ResizeObserver(resize).observe(canvas);
    resize();

    const W = () => canvas.clientWidth;
    const H = () => canvas.clientHeight;
    const colors = ['#f5d68a', '#c4163b', '#e98aa3', '#fbe9d2', '#d8b67a', '#ff8fa3'];
    const rockets = [];
    const particles = [];
    const hearts = [];
    const sparkles = [];

    const spawnSparkle = () => {
      sparkles.push({
        x: rand(W() * .05, W() * .95),
        y: H() + rand(0, 40),
        vy: rand(-.8, -.3),
        vx: rand(-.15, .15),
        size: rand(1.5, 4),
        life: 0, max: rand(4000, 7000),
        hue: rand(38, 52),
        sat: rand(60, 90),
        light: rand(60, 85),
        phase: rand(0, Math.PI * 2),
        swayAmp: rand(.3, 1),
        swayFreq: rand(.008, .02)
      });
    };

    // Seed initial sparkles
    for (let i = 0; i < 30; i++) {
      const s = {
        x: rand(0, W()),
        y: rand(-H() * .2, H()),
        vy: rand(-.8, -.3),
        vx: rand(-.15, .15),
        size: rand(1.5, 4),
        life: rand(0, 5000),
        max: rand(4000, 7000),
        hue: rand(38, 52),
        sat: rand(60, 90),
        light: rand(60, 85),
        phase: rand(0, Math.PI * 2),
        swayAmp: rand(.3, 1),
        swayFreq: rand(.008, .02)
      };
      s.max = Math.max(s.life + 1000, s.max);
      sparkles.push(s);
    }

    const launch = () => {
      rockets.push({
        x: rand(W() * .15, W() * .85),
        y: H() + 10,
        vy: rand(-12, -9),
        color: colors[Math.floor(rand(0, colors.length))]
      });
    };

    const explode = (x, y, color) => {
      const n = 70;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const sp = rand(2, 5);
        particles.push({
          x, y,
          vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
          life: 0, max: rand(900, 1500),
          color
        });
      }
    };

    let last = performance.now(), spawnT = 0, heartSpawn = 0;
    const tick = (now) => {
      const dt = Math.min(50, now - last); last = now;
      ctx.fillStyle = 'rgba(6,1,6,.22)';
      ctx.fillRect(0, 0, W(), H());

      spawnT += dt;
      if (spawnT > 600) { spawnT = 0; launch(); if (Math.random() < .5) launch(); }

      // Rockets
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.vy += .12; r.y += r.vy;
        ctx.fillStyle = '#fffaf3';
        ctx.beginPath(); ctx.arc(r.x, r.y, 2, 0, Math.PI * 2); ctx.fill();
        if (r.vy >= -2) {
          explode(r.x, r.y, r.color);
          rockets.splice(i, 1);
        }
      }

      // Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += dt; if (p.life > p.max) { particles.splice(i, 1); continue; }
        p.vy += .04; p.vx *= .995; p.vy *= .995;
        p.x += p.vx; p.y += p.vy;
        const a = clamp(1 - p.life / p.max, 0, 1);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = a;
        ctx.beginPath(); ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Golden sparkles
      if (sparkles.length < 120 && Math.random() < .35) spawnSparkle();
      for (let i = sparkles.length - 1; i >= 0; i--) {
        const s = sparkles[i];
        s.life += dt; if (s.life > s.max) { sparkles.splice(i, 1); continue; }
        s.phase += s.swayFreq * dt;
        s.x += s.vx + Math.sin(s.phase) * s.swayAmp * .04;
        s.y += s.vy;
        const a = clamp(1 - s.life / s.max, 0, 1) * (.5 + .5 * Math.sin(s.phase));
        const glow = s.size * 3;
        ctx.save();
        ctx.globalAlpha = a * .35;
        ctx.fillStyle = `hsl(${s.hue}, ${s.sat}%, ${s.light}%)`;
        ctx.shadowColor = `hsl(${s.hue}, ${s.sat}%, ${s.light + 10}%)`;
        ctx.shadowBlur = glow;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = a * .9;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.size * .5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }

      // Floating hearts
      heartSpawn += dt;
      if (heartSpawn > 220) {
        heartSpawn = 0;
        hearts.push({
          x: rand(0, W()), y: H() + 20,
          vy: rand(-1.4, -.7),
          size: rand(10, 22),
          hue: rand(340, 360),
          life: 0, max: rand(5000, 8000),
          sway: rand(.5, 1.5), phase: rand(0, Math.PI * 2)
        });
      }
      for (let i = hearts.length - 1; i >= 0; i--) {
        const h = hearts[i];
        h.life += dt; if (h.life > h.max || h.y < -40) { hearts.splice(i, 1); continue; }
        h.phase += .03; h.y += h.vy; h.x += Math.sin(h.phase) * h.sway;
        ctx.save();
        ctx.translate(h.x, h.y);
        ctx.scale(h.size / 16, h.size / 16);
        const a = clamp(1 - h.life / h.max, 0, 1) * .9;
        ctx.fillStyle = `hsla(${h.hue}, 80%, 65%, ${a})`;
        ctx.beginPath();
        ctx.moveTo(0, 4);
        ctx.bezierCurveTo(0, -2, -8, -2, -8, 4);
        ctx.bezierCurveTo(-8, 10, 0, 14, 0, 18);
        ctx.bezierCurveTo(0, 14, 8, 10, 8, 4);
        ctx.bezierCurveTo(8, -2, 0, -2, 0, 4);
        ctx.fill();
        ctx.restore();
      }

      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    // Swell music
    const audio = $('#bg-music');
    if (audio && !audio.paused) {
      const fade = setInterval(() => {
        if (audio.volume < 0.75) audio.volume = Math.min(0.75, audio.volume + 0.02);
        else clearInterval(fade);
      }, 120);
    }

    // Title reveal with GSAP if available
    const titleEls = $$('.finale__title span, .finale__title em, .finale__quote span, .finale__sign, .finale__signature, #replay-btn');
    if (window.gsap) {
      gsap.set(titleEls, { opacity: 0, y: 30, filter: 'blur(10px)' });
      gsap.to(titleEls, { opacity: 1, y: 0, filter: 'blur(0)', duration: 1.2, stagger: .2, ease: 'power3.out', delay: .4 });
    } else {
      titleEls.forEach((el, i) => {
        el.style.transition = `opacity 1s ${i * .2}s ease, transform 1s ${i * .2}s ease`;
        el.style.opacity = 0; el.style.transform = 'translateY(20px)';
        requestAnimationFrame(() => { el.style.opacity = 1; el.style.transform = 'translateY(0)'; });
      });
    }

    $('#replay-btn')?.addEventListener('click', () => location.reload());
  }
};

/* -------------------------------------------------------------
   17 · SMOOTH SCROLL (Lenis optional)
   ------------------------------------------------------------- */
function initLenis() {
  if (!window.Lenis) return;
  state.hasLenis = true;
  const lenis = new Lenis({ duration: 1.1, smoothWheel: true, smoothTouch: false });
  function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
}

/* -------------------------------------------------------------
   18 · OFFLINE / SERVICE-WORKER (optional, only if served via http)
   ------------------------------------------------------------- */
function initOffline() {
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    // No-op; we ship without a service worker file to keep this static-only.
    // Caching is handled by the browser via standard headers on GH Pages.
  }
}

/* -------------------------------------------------------------
   19 · BOOT
   ------------------------------------------------------------- */
async function boot() {
  state.hasGSAP = !!window.gsap;
  await loadData();

  /* Ambient layers always-on */
  Petals.init();
  Cursor.init();

  /* UI shell */
  UI.init();
  Lightbox.init();

  /* Chapter-specific bindings */
  Lock.init();
  Envelope.init();

  /* Smooth scrolling */
  initLenis();
  initOffline();

  /* Initial chapter */
  document.body.classList.remove('no-scroll');
  document.body.dataset.chapter = '1';
  UI.updateProgress();
}

/* GSAP/Lenis loaded with `defer` — wait one tick after DOMContentLoaded
   so window.gsap / window.Lenis are populated. */
window.addEventListener('DOMContentLoaded', () => {
  // Give deferred libs a microtask to attach
  setTimeout(boot, 0);
});
