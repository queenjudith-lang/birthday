/**
 * Stars — Animated night sky with twinkling, constellations, shooting stars, parallax
 */
;(function(global) {
  'use strict';
  const { Ease, Math: M, Viewport, prefersReducedMotion, RAF, Color } = global.Animations.Utils;

  const Stars = {
    _canvas: null,
    _ctx: null,
    _stars: [],
    _constellation: [],
    _shootingStars: [],
    _running: false,
    _t0: 0,
    _mx: 0, _my: 0,

    init(opts = {}) {
      this._canvas = document.getElementById('stars-canvas');
      if (!this._canvas) return;
      this._ctx = this._canvas.getContext('2d');
      this._running = true;
      this._t0 = performance.now();

      this._resize();
      window.addEventListener('resize', () => this._resize());
      window.addEventListener('mousemove', (e) => {
        this._mx = e.clientX / Viewport.width() - .5;
        this._my = e.clientY / Viewport.height() - .5;
      }, { passive: true });

      this._createStars();
      this._createConstellation();

      RAF.add('stars', (t, dt) => this._tick(t, dt));
    },

    destroy() {
      this._running = false;
      this._stars = [];
      this._constellation = [];
      this._shootingStars = [];
      RAF.remove('stars');
    },

    pause() { this._running = false; RAF.remove('stars'); },
    resume() { this._running = true; RAF.add('stars', (t, dt) => this._tick(t, dt)); },
    restart() { this.destroy(); this.init(); },

    _resize() {
      const dpr = Viewport.dpr();
      this._canvas.width = Viewport.width() * dpr;
      this._canvas.height = Viewport.height() * dpr;
      this._ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (this._stars.length) {
        this._createStars();
        this._createConstellation();
      }
    },

    _createStars() {
      const W = Viewport.width();
      const H = Viewport.height();
      const count = M.clamp(Math.floor(W * H / 8000), 100, 350);
      this._stars = [];
      for (let i = 0; i < count; i++) {
        this._stars.push({
          x: M.rand(0, W),
          y: M.rand(0, H),
          r: M.rand(.3, 1.8),
          baseAlpha: M.rand(.3, 1),
          twinkleSpeed: M.rand(.5, 3),
          twinklePhase: M.rand(0, Math.PI * 2),
          color: M.rand(0, 1) > .85
            ? { h: M.rand(38, 52), s: M.rand(40, 80), l: M.rand(80, 95) }
            : { h: 0, s: 0, l: M.rand(85, 100) },
          depth: M.rand(.2, 1), // parallax depth
        });
      }
    },

    _createConstellation() {
      const W = Viewport.width();
      const H = Viewport.height();
      // Elegant arc with branch clusters
      const norm = [
        [.08,.72],[.16,.58],[.25,.48],[.33,.42],[.42,.38],
        [.50,.36],[.58,.38],[.67,.42],[.75,.48],[.84,.58],[.92,.72],
        [.18,.35],[.28,.32],[.26,.42],
        [.72,.32],[.82,.28],[.86,.38],
        [.05,.25],[.50,.12],[.95,.30],
      ];
      this._constellation = norm.map(([nx, ny]) => ({
        x: nx * W, y: ny * H,
        r: M.rand(1.2, 2.2),
        alpha: .9,
        glow: M.rand(8, 16),
      }));
    },

    _drawStar(ctx, s, alpha) {
      const c = s.color;
      ctx.fillStyle = c.s > 0
        ? Color.hslToString(c.h, c.s, c.l, alpha)
        : Color.hslToString(0, 0, c.l, alpha);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    },

    _drawConstellationNode(ctx, node, alpha) {
      ctx.save();
      // Outer glow
      ctx.globalAlpha = alpha * .25;
      ctx.fillStyle = Color.hslToString(45, 70, 75);
      ctx.shadowColor = Color.hslToString(45, 70, 75, .8);
      ctx.shadowBlur = node.glow;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.r * 5, 0, Math.PI * 2);
      ctx.fill();
      // Core
      ctx.globalAlpha = alpha;
      ctx.shadowBlur = node.glow * .6;
      ctx.fillStyle = Color.hslToString(45, 60, 90);
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.r * 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    },

    _tick(time, dt) {
      if (!this._running) return;
      const W = Viewport.width();
      const H = Viewport.height();
      const ctx = this._ctx;
      const t = (time - this._t0) / 1000;

      ctx.clearRect(0, 0, W, H);

      // Nebula background
      const grd = ctx.createRadialGradient(W / 2, H * .6, 0, W / 2, H * .6, Math.max(W, H) * .7);
      grd.addColorStop(0, 'rgba(60,30,80,0.2)');
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);

      // Stars with parallax
      for (const s of this._stars) {
        const px = this._mx * s.depth * 15;
        const py = this._my * s.depth * 10;
        const twinkle = .5 + .5 * Math.sin(t * s.twinkleSpeed + s.twinklePhase);
        const alpha = s.baseAlpha * (.4 + .6 * twinkle);
        this._drawStar(ctx, { ...s, x: s.x + px, y: s.y + py }, alpha);
      }

      // Constellation — progressive draw
      const p = Ease.outCubic(M.clamp((t - .6) / 3, 0, 1));
      if (p > 0) {
        // Main arc lines
        ctx.save();
        ctx.shadowColor = Color.hslToString(45, 60, 75, .4);
        ctx.shadowBlur = 8;
        ctx.strokeStyle = Color.hslToString(45, 60, 75, .4 * p);
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        const arcEnd = Math.min(Math.floor(p * 11), 10);
        for (let i = 0; i <= arcEnd; i++) {
          const n = this._constellation[i];
          const px = this._mx * .5 * 10;
          const py = this._my * .5 * 8;
          if (i === 0) ctx.moveTo(n.x + px, n.y + py);
          else ctx.lineTo(n.x + px, n.y + py);
        }
        ctx.stroke();
        ctx.restore();

        // Branch 1 (upper-left)
        const b1p = M.clamp((t - 1.5) / 2, 0, 1);
        if (b1p > 0) {
          ctx.save();
          ctx.strokeStyle = Color.hslToString(45, 60, 75, .35 * b1p);
          ctx.lineWidth = .8;
          ctx.beginPath();
          const px = this._mx * .5 * 10;
          const py = this._my * .5 * 8;
          ctx.moveTo(this._constellation[0].x + px, this._constellation[0].y + py);
          for (let i = 0; i <= Math.min(Math.floor(b1p * 3), 2); i++) {
            const n = this._constellation[11 + i];
            ctx.lineTo(n.x + px, n.y + py);
          }
          ctx.stroke();
          ctx.restore();
        }

        // Branch 2 (upper-right)
        const b2p = M.clamp((t - 2.2) / 2, 0, 1);
        if (b2p > 0) {
          ctx.save();
          ctx.strokeStyle = Color.hslToString(45, 60, 75, .35 * b2p);
          ctx.lineWidth = .8;
          ctx.beginPath();
          const px = this._mx * .5 * 10;
          const py = this._my * .5 * 8;
          ctx.moveTo(this._constellation[10].x + px, this._constellation[10].y + py);
          for (let i = 0; i <= Math.min(Math.floor(b2p * 3), 2); i++) {
            const n = this._constellation[14 + i];
            ctx.lineTo(n.x + px, n.y + py);
          }
          ctx.stroke();
          ctx.restore();
        }

        // Constellation nodes (glow)
        for (let i = 0; i <= Math.min(arcEnd, 10); i++) {
          const n = this._constellation[i];
          const px = this._mx * .5 * 10;
          const py = this._my * .5 * 8;
          this._drawConstellationNode(ctx, { ...n, x: n.x + px, y: n.y + py }, p);
        }
        // Branch nodes
        for (let i = 11; i <= 13; i++) {
          if (b1p > 0) {
            const n = this._constellation[i];
            const px = this._mx * .5 * 10;
            const py = this._my * .5 * 8;
            this._drawConstellationNode(ctx, { ...n, x: n.x + px, y: n.y + py }, b1p);
          }
        }
        for (let i = 14; i <= 16; i++) {
          if (b2p > 0) {
            const n = this._constellation[i];
            const px = this._mx * .5 * 10;
            const py = this._my * .5 * 8;
            this._drawConstellationNode(ctx, { ...n, x: n.x + px, y: n.y + py }, b2p);
          }
        }
      }

      // Shooting stars (random, rare)
      if (Math.random() < .003 && this._shootingStars.length < 2) {
        this._shootingStars.push({
          x: M.rand(W * .1, W * .9),
          y: M.rand(0, H * .4),
          angle: M.rand(.3, .8),
          speed: M.rand(600, 1200),
          length: M.rand(60, 140),
          life: 0,
          max: M.rand(400, 800),
        });
      }
      for (let i = this._shootingStars.length - 1; i >= 0; i--) {
        const ss = this._shootingStars[i];
        ss.life += dt;
        if (ss.life >= ss.max) { this._shootingStars.splice(i, 1); continue; }
        const t2 = ss.life / ss.max;
        const alpha = t2 < .2 ? t2 / .2 : 1 - ((t2 - .2) / .8);
        const dx = Math.cos(ss.angle) * ss.speed * (dt / 1000);
        const dy = Math.sin(ss.angle) * ss.speed * (dt / 1000);
        ss.x += dx;
        ss.y += dy;

        const tailX = ss.x - Math.cos(ss.angle) * ss.length;
        const tailY = ss.y - Math.sin(ss.angle) * ss.length;

        const grad = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
        grad.addColorStop(0, `rgba(255,250,243,0)`);
        grad.addColorStop(1, `rgba(255,250,243,${alpha * .9})`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(ss.x, ss.y);
        ctx.stroke();

        // Head glow
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#fffaf3';
        ctx.shadowColor = '#f5d68a';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(ss.x, ss.y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    },
  };

  global.Animations = global.Animations || {};
  global.Animations.Stars = Stars;
})(typeof window !== 'undefined' ? window : this);
