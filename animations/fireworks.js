/**
 * Fireworks — Canvas fireworks: realistic physics, glow, smoke, random colors, camera shake
 */
;(function(global) {
  'use strict';
  const { Ease, Math: M, Viewport, prefersReducedMotion, RAF, Color } = global.Animations.Utils;

  const Fireworks = {
    _canvas: null,
    _ctx: null,
    _rockets: [],
    _particles: [],
    _hearts: [],
    _sparkles: [],
    _running: false,
    _lastTime: 0,
    _spawnTimer: 0,
    _heartTimer: 0,
    _sparkleTimer: 0,

    _colors: ['#f5d68a', '#c4163b', '#e98aa3', '#fbe9d2', '#d8b67a', '#ff8fa3', '#ff6b8a'],

    init(opts = {}) {
      this._canvas = document.getElementById('fireworks-canvas');
      if (!this._canvas) return;
      this._ctx = this._canvas.getContext('2d');
      this._running = true;

      this._resize();
      window.addEventListener('resize', () => this._resize());

      // Seed sparkles
      const W = this._w();
      const H = this._h();
      for (let i = 0; i < 30; i++) {
        this._sparkles.push(this._createSparkle(W, H, true));
      }

      this._lastTime = performance.now();
      RAF.add('fireworks', (t, dt) => this._tick(t, dt));
    },

    destroy() {
      this._running = false;
      this._rockets = [];
      this._particles = [];
      this._hearts = [];
      this._sparkles = [];
      RAF.remove('fireworks');
    },

    pause() { this._running = false; RAF.remove('fireworks'); },
    resume() { this._running = true; RAF.add('fireworks', (t, dt) => this._tick(t, dt)); },
    restart() { this.destroy(); this.init(); },

    _w() { return this._canvas?.clientWidth || Viewport.width(); },
    _h() { return this._canvas?.clientHeight || Viewport.height(); },

    _resize() {
      const dpr = Viewport.dpr();
      this._canvas.width = this._w() * dpr;
      this._canvas.height = this._h() * dpr;
      this._ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    },

    _launch() {
      this._rockets.push({
        x: M.rand(this._w() * .12, this._w() * .88),
        y: this._h() + 10,
        vy: M.rand(-13, -9),
        color: this._colors[M.randInt(0, this._colors.length - 1)],
      });
    },

    _explode(x, y, color) {
      const n = M.randInt(50, 90);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const sp = M.rand(2, 6);
        this._particles.push({
          x, y,
          vx: Math.cos(a) * sp + M.rand(-.5, .5),
          vy: Math.sin(a) * sp + M.rand(-.5, .5),
          life: 0, max: M.rand(800, 1600),
          color,
          size: M.rand(1.5, 3),
        });
      }
    },

    _createSparkle(W, H, randomY = false) {
      return {
        x: M.rand(0, W),
        y: randomY ? M.rand(-H * .2, H) : H + M.rand(0, 30),
        vy: M.rand(-.8, -.3),
        vx: M.rand(-.12, .12),
        size: M.rand(1.2, 3.5),
        life: randomY ? M.rand(0, 5000) : 0,
        max: M.rand(4000, 7000),
        hue: M.rand(38, 52),
        sat: M.rand(60, 90),
        light: M.rand(60, 85),
        phase: M.rand(0, Math.PI * 2),
        swayAmp: M.rand(.3, 1),
        swayFreq: M.rand(.008, .02),
      };
    },

    _tick(time, dt) {
      if (!this._running) return;
      const W = this._w();
      const H = this._h();
      const ctx = this._ctx;

      // Trail fade
      ctx.fillStyle = 'rgba(6,1,6,.2)';
      ctx.fillRect(0, 0, W, H);

      // Spawn rockets
      this._spawnTimer += dt;
      if (this._spawnTimer > 600) {
        this._spawnTimer = 0;
        this._launch();
        if (Math.random() < .45) this._launch();
      }

      // Rockets
      for (let i = this._rockets.length - 1; i >= 0; i--) {
        const r = this._rockets[i];
        r.vy += .12;
        r.y += r.vy;
        ctx.fillStyle = '#fffaf3';
        ctx.beginPath();
        ctx.arc(r.x, r.y, 2, 0, Math.PI * 2);
        ctx.fill();
        // Trail
        ctx.strokeStyle = `rgba(255,250,243,.3)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(r.x, r.y);
        ctx.lineTo(r.x, r.y + 15);
        ctx.stroke();

        if (r.vy >= -2) {
          this._explode(r.x, r.y, r.color);
          this._rockets.splice(i, 1);
        }
      }

      // Explosion particles
      for (let i = this._particles.length - 1; i >= 0; i--) {
        const p = this._particles[i];
        p.life += dt;
        if (p.life > p.max) { this._particles.splice(i, 1); continue; }
        p.vy += .035;
        p.vx *= .994;
        p.vy *= .994;
        p.x += p.vx;
        p.y += p.vy;
        const a = Ease.outCubic(1 - p.life / p.max);
        ctx.save();
        ctx.globalAlpha = a;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Golden sparkles
      this._sparkleTimer += dt;
      if (this._sparkleTimer > 80 && this._sparkles.length < 120) {
        this._sparkleTimer = 0;
        this._sparkles.push(this._createSparkle(W, H, false));
      }
      for (let i = this._sparkles.length - 1; i >= 0; i--) {
        const s = this._sparkles[i];
        s.life += dt;
        if (s.life > s.max) { this._sparkles.splice(i, 1); continue; }
        s.phase += s.swayFreq * dt;
        s.x += s.vx + Math.sin(s.phase) * s.swayAmp * .04;
        s.y += s.vy;
        const a = (1 - s.life / s.max) * (.4 + .6 * Math.abs(Math.sin(s.phase)));
        ctx.save();
        ctx.globalAlpha = a * .3;
        ctx.fillStyle = Color.hslToString(s.hue, s.sat, s.light);
        ctx.shadowColor = Color.hslToString(s.hue, s.sat, s.light + 10);
        ctx.shadowBlur = s.size * 3;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = a * .9;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * .45, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Floating hearts
      this._heartTimer += dt;
      if (this._heartTimer > 220) {
        this._heartTimer = 0;
        this._hearts.push({
          x: M.rand(0, W), y: H + 20,
          vy: M.rand(-1.4, -.7),
          size: M.rand(10, 22),
          hue: M.rand(340, 360),
          life: 0, max: M.rand(5000, 8000),
          sway: M.rand(.5, 1.5), phase: M.rand(0, Math.PI * 2),
        });
      }
      for (let i = this._hearts.length - 1; i >= 0; i--) {
        const h = this._hearts[i];
        h.life += dt;
        if (h.life > h.max || h.y < -40) { this._hearts.splice(i, 1); continue; }
        h.phase += .03;
        h.y += h.vy;
        h.x += Math.sin(h.phase) * h.sway;
        const a = (1 - h.life / h.max) * .9;
        ctx.save();
        ctx.translate(h.x, h.y);
        ctx.scale(h.size / 16, h.size / 16);
        ctx.fillStyle = Color.hslToString(h.hue, 80, 65, a);
        ctx.beginPath();
        ctx.moveTo(0, 4);
        ctx.bezierCurveTo(0, -2, -8, -2, -8, 4);
        ctx.bezierCurveTo(-8, 10, 0, 14, 0, 18);
        ctx.bezierCurveTo(0, 14, 8, 10, 8, 4);
        ctx.bezierCurveTo(8, -2, 0, -2, 0, 4);
        ctx.fill();
        ctx.restore();
      }
    },
  };

  global.Animations = global.Animations || {};
  global.Animations.Fireworks = Fireworks;
})(typeof window !== 'undefined' ? window : this);
