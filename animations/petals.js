/**
 * Petals — Realistic falling rose petals with wind, rotation, depth blur
 */
;(function(global) {
  'use strict';
  const { Ease, Math: M, Viewport, prefersReducedMotion, RAF, Color } = global.Animations.Utils;

  const Petals = {
    _canvas: null,
    _ctx: null,
    _items: [],
    _wind: 0,
    _windTarget: 0,
    _running: false,

    _colors: [
      { h: 340, s: 65, l: 72 }, // soft pink
      { h: 350, s: 70, l: 60 }, // rose
      { h: 345, s: 55, l: 80 }, // blush
      { h: 10,  s: 50, l: 75 }, // warm rose
      { h: 355, s: 60, l: 55 }, // deep rose
    ],

    init(opts = {}) {
      this._canvas = document.getElementById('petals-canvas');
      if (!this._canvas) return;
      this._ctx = this._canvas.getContext('2d');
      this._running = true;

      this._resize();
      window.addEventListener('resize', () => this._resize());

      const count = M.clamp(Math.floor(Viewport.width() / 45), 12, 38);
      for (let i = 0; i < count; i++) this._items.push(this._create(true));

      // Wind shifts periodically
      this._windInterval = setInterval(() => {
        this._windTarget = M.rand(-.8, .8);
      }, 4000);

      RAF.add('petals', (t, dt) => this._tick(t, dt));
    },

    destroy() {
      this._running = false;
      this._items = [];
      clearInterval(this._windInterval);
      RAF.remove('petals');
    },

    pause() { this._running = false; RAF.remove('petals'); },
    resume() { this._running = true; RAF.add('petals', (t, dt) => this._tick(t, dt)); },
    restart() { this.destroy(); this.init(); },

    _resize() {
      const dpr = Viewport.dpr();
      this._canvas.width = Viewport.width() * dpr;
      this._canvas.height = Viewport.height() * dpr;
      this._ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    },

    _create(randomY = false) {
      const W = Viewport.width();
      const H = Viewport.height();
      const c = this._colors[M.randInt(0, this._colors.length - 1)];
      return {
        x: M.rand(-50, W + 50),
        y: randomY ? M.rand(-H, H) : M.rand(-H * .5, -20),
        vx: M.rand(-.3, .3),
        vy: M.rand(.6, 1.8),
        size: M.rand(10, 22),
        rot: M.rand(0, Math.PI * 2),
        vr: M.rand(-.04, .04),
        wobble: M.rand(0, Math.PI * 2),
        wobbleSpeed: M.rand(.008, .025),
        wobbleAmp: M.rand(.3, 1),
        color: c,
        alpha: M.rand(.45, .85),
        depth: M.rand(.3, 1.2), // for blur
        tilt: M.rand(-.3, .3), // 3D tilt simulation
      };
    },

    _drawPetal(ctx, p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);

      // Depth-based blur: far petals are slightly blurred
      if (p.depth < .6) ctx.filter = `blur(${M.map(p.depth, .3, .6, 2, 0)}px)`;

      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = Color.hslToString(p.color.h, p.color.s, p.color.l);

      // Main petal shape
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * .5, p.tilt, 0, Math.PI * 2);
      ctx.fill();

      // Inner highlight
      ctx.globalAlpha = p.alpha * .25;
      ctx.fillStyle = Color.hslToString(p.color.h, p.color.s - 10, p.color.l + 15);
      ctx.beginPath();
      ctx.ellipse(-p.size * .15, -p.size * .1, p.size * .5, p.size * .25, p.tilt, 0, Math.PI * 2);
      ctx.fill();

      ctx.filter = 'none';
      ctx.restore();
    },

    _tick(time, dt) {
      if (!this._running) return;
      const W = Viewport.width();
      const H = Viewport.height();
      const ctx = this._ctx;

      // Smooth wind
      this._wind = M.damp(this._wind, this._windTarget, .5, dt / 1000);

      ctx.clearRect(0, 0, W, H);

      // Sort by depth for painter's algorithm (far petals behind)
      this._items.sort((a, b) => a.depth - b.depth);

      for (let i = this._items.length - 1; i >= 0; i--) {
        const p = this._items[i];

        // Physics
        p.wobble += p.wobbleSpeed;
        p.x += p.vx + Math.sin(p.wobble) * p.wobbleAmp * .4 + this._wind;
        p.y += p.vy;
        p.rot += p.vr;

        // Wind effect on rotation
        p.vr += this._wind * .0003;

        // Recycle
        if (p.y > H + 40) {
          Object.assign(p, this._create(false), { y: -30 });
          continue;
        }

        this._drawPetal(ctx, p);
      }
    },
  };

  global.Animations = global.Animations || {};
  global.Animations.Petals = Petals;
})(typeof window !== 'undefined' ? window : this);
