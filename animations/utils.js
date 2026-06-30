/**
 * Utils — Shared utilities for the animation system
 * Easing, math, RAF manager, reduced motion, viewport helpers
 */
;(function(global) {
  'use strict';

  /* ── Easing ─────────────────────────────────────────────── */
  const Ease = {
    linear: t => t,
    inQuad: t => t * t,
    outQuad: t => t * (2 - t),
    inOutQuad: t => t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    inCubic: t => t * t * t,
    outCubic: t => (--t) * t * t + 1,
    inOutCubic: t => t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    inQuart: t => t * t * t * t,
    outQuart: t => 1 - (--t) * t * t * t,
    inOutQuart: t => t < .5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
    inQuint: t => t * t * t * t * t,
    outQuint: t => 1 + (--t) * t * t * t * t,
    inOutQuint: t => t < .5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t,
    inExpo: t => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
    outExpo: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
    inOutExpo: t => {
      if (t === 0 || t === 1) return t;
      return t < .5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;
    },
    inBack: t => t * t * (2.70158 * t - 1.70158),
    outBack: t => { const c = 1.70158; return 1 + (--t) * t * ((c + 1) * t + c); },
    inOutBack: t => {
      const c = 1.70158 * 1.525;
      return t < .5
        ? (Math.pow(2 * t, 2) * ((c + 1) * 2 * t - c)) / 2
        : (Math.pow(2 * t - 2, 2) * ((c + 1) * (t * 2 - 2) + c) + 2) / 2;
    },
    outElastic: t => {
      if (t === 0 || t === 1) return t;
      return Math.pow(2, -10 * t) * Math.sin((t - .075) * (2 * Math.PI) / .3) + 1;
    },
    outBounce: t => {
      if (t < 1 / 2.75) return 7.5625 * t * t;
      if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + .75;
      if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + .9375;
      return 7.5625 * (t -= 2.625 / 2.75) * t + .984375;
    },
    // Custom luxury easing — slow start, smooth deceleration
    luxury: t => t === 0 ? 0 : t === 1 ? 1 :
      t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    // Cinematic easing — dramatic slow-in, crisp stop
    cinematic: t => 1 - Math.pow(1 - t, 5),
    // Breathing ease — for continuous gentle motion
    breathe: t => (1 + Math.sin((t - .5) * Math.PI)) / 2,
  };

  /* ── Math Helpers ───────────────────────────────────────── */
  const MathUtils = {
    lerp: (a, b, t) => a + (b - a) * t,
    clamp: (n, min, max) => Math.max(min, Math.min(max, n)),
    rand: (min, max) => min + Math.random() * (max - min),
    randInt: (min, max) => Math.floor(MathUtils.rand(min, max + 1)),
    distance: (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1),
    map: (n, inMin, inMax, outMin, outMax) =>
      outMin + (n - inMin) * (outMax - outMin) / (inMax - inMin),
    normalize: (n, min, max) => (n - min) / (max - min),
    damp: (current, target, smoothing, dt) =>
      MathUtils.lerp(current, target, 1 - Math.exp(-smoothing * dt)),
    wrap: (n, min, max) => {
      const range = max - min;
      return ((n - min) % range + range) % range + min;
    },
    degToRad: d => d * Math.PI / 180,
    radToDeg: r => r * 180 / Math.PI,
    smoothstep: (edge0, edge1, x) => {
      const t = MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
      return t * t * (3 - 2 * t);
    },
  };

  /* ── Viewport ───────────────────────────────────────────── */
  const Viewport = {
    width: () => window.innerWidth,
    height: () => window.innerHeight,
    isMobile: () => window.innerWidth < 768,
    isTablet: () => window.innerWidth >= 768 && window.innerWidth < 1024,
    isDesktop: () => window.innerWidth >= 1024,
    dpr: () => Math.min(window.devicePixelRatio || 1, 2),
  };

  /* ── Reduced Motion ─────────────────────────────────────── */
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const prefersReducedMotion = () => reducedMotion.matches;

  /* ── Central RAF Manager ────────────────────────────────── */
  const RAF = {
    _listeners: new Map(),
    _raf: null,
    _running: false,
    _lastTime: 0,

    add(id, callback) {
      this._listeners.set(id, callback);
      if (!this._running) this._start();
    },

    remove(id) {
      this._listeners.delete(id);
      if (this._listeners.size === 0) this._stop();
    },

    has(id) {
      return this._listeners.has(id);
    },

    clear() {
      this._listeners.clear();
      this._stop();
    },

    _start() {
      this._running = true;
      this._lastTime = performance.now();
      const loop = (time) => {
        if (!this._running) return;
        const dt = Math.min(time - this._lastTime, 50); // cap at 50ms
        this._lastTime = time;
        this._listeners.forEach(cb => cb(time, dt));
        this._raf = requestAnimationFrame(loop);
      };
      this._raf = requestAnimationFrame(loop);
    },

    _stop() {
      this._running = false;
      if (this._raf) {
        cancelAnimationFrame(this._raf);
        this._raf = null;
      }
    },
  };

  /* ── Object Pool (for particle recycling) ───────────────── */
  class Pool {
    constructor(factory, reset, initialSize = 0) {
      this._factory = factory;
      this._reset = reset;
      this._pool = [];
      for (let i = 0; i < initialSize; i++) this._pool.push(factory());
    }
    get() {
      return this._pool.length > 0 ? this._pool.pop() : this._factory();
    }
    release(obj) {
      this._reset(obj);
      this._pool.push(obj);
    }
    get size() { return this._pool.length; }
  }

  /* ── Throttle / Debounce ────────────────────────────────── */
  function throttle(fn, ms) {
    let last = 0;
    return function(...args) {
      const now = Date.now();
      if (now - last >= ms) { last = now; return fn.apply(this, args); }
    };
  }
  function debounce(fn, ms) {
    let timer;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  /* ── Color Helpers ──────────────────────────────────────── */
  const Color = {
    hslToString: (h, s, l, a = 1) => `hsla(${h}, ${s}%, ${l}%, ${a})`,
    hexToRgb: hex => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return { r, g, b };
    },
    rgbToString: (r, g, b, a = 1) => `rgba(${r}, ${g}, ${b}, ${a})`,
  };

  /* ── Export ─────────────────────────────────────────────── */
  global.Animations = global.Animations || {};
  global.Animations.Utils = {
    Ease,
    Math: MathUtils,
    Viewport,
    prefersReducedMotion,
    RAF,
    Pool,
    throttle,
    debounce,
    Color,
  };

})(typeof window !== 'undefined' ? window : this);
