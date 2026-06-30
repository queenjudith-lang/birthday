/**
 * Particles — Floating particles with parallax, mouse interaction, chapter-aware colors
 */
;(function(global) {
  'use strict';
  const { Ease, Math: M, Viewport, prefersReducedMotion, RAF, Color } = global.Animations.Utils;

  const Particles = {
    _canvas: null,
    _ctx: null,
    _items: [],
    _mx: 0, _my: 0,
    _running: false,
    _chapter: 1,
    _targetCount: 0,

    _palettes: {
      default: ['#e98aa3', '#c4163b', '#f5d68a', '#fbe9d2', '#f6c7d3'],
      gold:    ['#f5d68a', '#ffdf9e', '#fffaf3', '#d8b67a', '#ffedc4', '#fbe9d2'],
      crimson: ['#c4163b', '#e98aa3', '#f5d68a', '#8a1331', '#f6c7d3'],
      starry:  ['#fffaf3', '#f5d68a', '#fbe9d2', '#d8b67a', '#e98aa3'],
    },

    init(opts = {}) {
      this._canvas = document.getElementById('petals-canvas');
      if (!this._canvas) return;
      this._ctx = this._canvas.getContext('2d');
      this._running = true;
      this._chapter = opts.chapter || 1;

      this._resize();
      window.addEventListener('resize', () => this._resize());

      window.addEventListener('mousemove', (e) => {
        this._mx = e.clientX;
        this._my = e.clientY;
      }, { passive: true });

      this._targetCount = M.clamp(Math.floor(Viewport.width() / 35), 14, 45);
      this._spawn(this._targetCount);

      RAF.add('particles', (t, dt) => this._tick(t, dt));
    },

    destroy() {
      this._running = false;
      this._items = [];
      RAF.remove('particles');
    },

    pause() { this._running = false; RAF.remove('particles'); },
    resume() { this._running = true; RAF.add('particles', (t, dt) => this._tick(t, dt)); },
    restart() { this.destroy(); this.init({ chapter: this._chapter }); },

    setChapter(n) {
      this._chapter = n;
      // Gradually transition particles to new palette
    },

    _getPalette() {
      if (this._chapter >= 10) return this._palettes.gold;
      if (this._chapter === 2) return this._palettes.starry;
      if (this._chapter >= 7) return this._palettes.crimson;
      return this._palettes.default;
    },

    _resize() {
      const dpr = Viewport.dpr();
      const W = Viewport.width();
      const H = Viewport.height();
      this._canvas.width = W * dpr;
      this._canvas.height = H * dpr;
      this._ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    },

    _spawn(count) {
      const pal = this._getPalette();
      const W = Viewport.width();
      const H = Viewport.height();
      for (let i = 0; i < count; i++) {
        this._items.push(this._create(pal, W, H, true));
      }
    },

    _create(pal, W, H, randomY = false) {
      const isGold = this._chapter >= 10;
      return {
        x: M.rand(0, W),
        y: randomY ? M.rand(-H * .3, H * 1.1) : M.rand(-H, 0),
        vx: M.rand(-.25, .25),
        vy: M.rand(.4, 1.2),
        size: M.rand(6, 18),
        rot: M.rand(0, Math.PI * 2),
        vr: M.rand(-.015, .015),
        color: pal[M.randInt(0, pal.length - 1)],
        sway: M.rand(.4, 1.2),
        phase: M.rand(0, Math.PI * 2),
        alpha: M.rand(.35, .8),
        glow: isGold ? M.rand(3, 10) : 0,
        depth: M.rand(.5, 1.5), // parallax depth
      };
    },

    _tick(time, dt) {
      if (!this._running) return;
      const W = Viewport.width();
      const H = Viewport.height();
      const ctx = this._ctx;
      const t = time / 1000;

      ctx.clearRect(0, 0, W, H);

      const pal = this._getPalette();

      for (let i = this._items.length - 1; i >= 0; i--) {
        const p = this._items[i];

        // Parallax: mouse influences particles based on depth
        const px = (this._mx - W / 2) * .003 * p.depth;
        const py = (this._my - H / 2) * .002 * p.depth;

        p.phase += .018;
        p.x += p.vx + Math.sin(p.phase) * p.sway * .35 + px;
        p.y += p.vy + py;
        p.rot += p.vr;

        // Recycle when out of bounds
        if (p.y > H + 30 || p.x < -30 || p.x > W + 30) {
          Object.assign(p, this._create(pal, W, H, false), { y: -20 });
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = p.alpha;

        if (p.glow > 0) {
          ctx.shadowColor = p.color;
          ctx.shadowBlur = p.glow;
        }

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * .55, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    },
  };

  global.Animations = global.Animations || {};
  global.Animations.Particles = Particles;
})(typeof window !== 'undefined' ? window : this);
