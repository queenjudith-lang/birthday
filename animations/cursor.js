/**
 * Cursor — Luxury custom cursor with glow, heart trail, ripple, magnetic buttons
 */
;(function(global) {
  'use strict';
  const { Ease, Math: M, Viewport, prefersReducedMotion, RAF, Pool, throttle } = global.Animations.Utils;

  const Cursor = {
    _glow: null,
    _canvas: null,
    _ctx: null,
    _mx: 0, _my: 0,
    _sx: 0, _sy: 0, // smoothed
    _hearts: [],
    _ripples: [],
    _magnetics: [],
    _pool: null,
    _bound: false,

    init(opts = {}) {
      if (prefersReducedMotion() || Viewport.isMobile()) return;
      if (this._bound) return;
      this._bound = true;

      this._glow = document.querySelector('.cursor-glow');
      this._canvas = document.getElementById('cursor-hearts');
      if (!this._canvas) return;
      this._ctx = this._canvas.getContext('2d');

      this._pool = new Pool(
        () => ({ x: 0, y: 0, vx: 0, vy: 0, size: 0, life: 0, max: 0, hue: 0 }),
        h => { h.life = 0; }
      );

      this._resize();
      window.addEventListener('resize', () => this._resize());

      window.addEventListener('mousemove', throttle((e) => {
        this._mx = e.clientX;
        this._my = e.clientY;
        this._spawnHeart(e.clientX, e.clientY);
      }, 50), { passive: true });

      window.addEventListener('click', (e) => this._spawnRipple(e.clientX, e.clientY));

      this._initMagnetics();
      RAF.add('cursor', (t, dt) => this._tick(t, dt));
    },

    destroy() {
      this._bound = false;
      RAF.remove('cursor');
      this._hearts = [];
      this._ripples = [];
    },

    pause() { RAF.remove('cursor'); },
    resume() { if (this._bound) RAF.add('cursor', (t, dt) => this._tick(t, dt)); },

    _resize() {
      const dpr = Viewport.dpr();
      this._canvas.width = Viewport.width() * dpr;
      this._canvas.height = Viewport.height() * dpr;
      this._ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    },

    _spawnHeart(x, y) {
      if (this._hearts.length > 80) return;
      this._hearts.push({
        x, y,
        vx: M.rand(-.4, .4),
        vy: M.rand(-1, -.4),
        size: M.rand(6, 14),
        life: 0,
        max: M.rand(800, 1400),
        hue: M.rand(340, 365),
      });
    },

    _spawnRipple(x, y) {
      this._ripples.push({
        x, y,
        radius: 0,
        maxRadius: M.rand(40, 80),
        life: 0,
        max: 600,
      });
    },

    _initMagnetics() {
      this._magnetics = Array.from(document.querySelectorAll('button, a, [data-magnetic]'));
      this._magnetics.forEach(el => {
        el.addEventListener('mouseenter', () => el.classList.add('is-magnetic'));
        el.addEventListener('mouseleave', () => {
          el.classList.remove('is-magnetic');
          el.style.transform = '';
        });
        el.addEventListener('mousemove', (e) => {
          const rect = el.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dx = (e.clientX - cx) * .3;
          const dy = (e.clientY - cy) * .3;
          el.style.transform = `translate(${dx}px, ${dy}px)`;
        });
      });
    },

    _drawHeart(ctx, x, y, s, alpha, hue) {
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
    },

    _tick(time, dt) {
      // Smooth follow
      this._sx = M.damp(this._sx, this._mx, 12, dt / 1000);
      this._sy = M.damp(this._sy, this._my, 12, dt / 1000);

      if (this._glow) {
        this._glow.style.transform = `translate(${this._sx}px, ${this._sy}px) translate(-50%, -50%)`;
      }

      const W = Viewport.width();
      const H = Viewport.height();
      this._ctx.clearRect(0, 0, W, H);

      // Hearts
      for (let i = this._hearts.length - 1; i >= 0; i--) {
        const h = this._hearts[i];
        h.life += dt;
        if (h.life >= h.max) { this._hearts.splice(i, 1); continue; }
        h.x += h.vx;
        h.y += h.vy;
        h.vy -= .015;
        const t = h.life / h.max;
        const alpha = (1 - Ease.outCubic(t)) * .8;
        this._drawHeart(this._ctx, h.x, h.y, h.size * (1 - t * .4), alpha, h.hue);
      }

      // Ripples
      for (let i = this._ripples.length - 1; i >= 0; i--) {
        const r = this._ripples[i];
        r.life += dt;
        if (r.life >= r.max) { this._ripples.splice(i, 1); continue; }
        const t = r.life / r.max;
        r.radius = Ease.outExpo(t) * r.maxRadius;
        const alpha = (1 - t) * .4;
        this._ctx.strokeStyle = `rgba(245, 214, 138, ${alpha})`;
        this._ctx.lineWidth = 1.5;
        this._ctx.beginPath();
        this._ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        this._ctx.stroke();
      }
    },
  };

  global.Animations = global.Animations || {};
  global.Animations.Cursor = Cursor;
})(typeof window !== 'undefined' ? window : this);
