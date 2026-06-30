/**
 * Confetti — Paper confetti with physics, wind, bounce, depth, gold/pink/crimson
 */
;(function(global) {
  'use strict';
  const { Ease, Math: M, Viewport, prefersReducedMotion, RAF, Color } = global.Animations.Utils;

  const Confetti = {
    _running: false,

    _colors: ['#f5d68a', '#c4163b', '#e98aa3', '#fbe9d2', '#d8b67a', '#fffaf3', '#ff8fa3'],

    burst(canvas, opts = {}) {
      const ctx = canvas?.getContext('2d');
      if (!ctx) return;

      const dpr = Viewport.dpr();
      const W = canvas.clientWidth;
      const H = canvas.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = opts.count || 220;
      const parts = [];
      for (let i = 0; i < count; i++) {
        parts.push({
          x: W / 2 + M.rand(-50, 50),
          y: H * .6 + M.rand(-20, 20),
          vx: M.rand(-7, 7),
          vy: M.rand(-15, -5),
          g: .28,
          size: M.rand(4, 10),
          rot: M.rand(0, Math.PI * 2),
          vr: M.rand(-.25, .25),
          color: this._colors[M.randInt(0, this._colors.length - 1)],
          life: 0,
          max: M.rand(2400, 4200),
          wobble: M.rand(0, Math.PI * 2),
          wobbleSpeed: M.rand(.02, .06),
          depth: M.rand(.4, 1.2),
        });
      }

      let last = performance.now();
      const tick = (now) => {
        const dt = Math.min(50, now - last);
        last = now;
        ctx.clearRect(0, 0, W, H);
        let alive = 0;

        for (const p of parts) {
          p.life += dt;
          if (p.life > p.max) continue;
          alive++;

          p.vy += p.g;
          p.wobble += p.wobbleSpeed;
          p.x += p.vx + Math.sin(p.wobble) * 1.5;
          p.y += p.vy;
          p.rot += p.vr;
          p.vx *= .998;

          // Bounce at bottom
          if (p.y > H - 10 && p.vy > 0) {
            p.vy *= -.4;
            p.y = H - 10;
          }

          const t = p.life / p.max;
          const alpha = t < .1 ? t / .1 : 1 - Ease.outCubic((t - .1) / .9);
          const depthScale = M.map(p.depth, .4, 1.2, .6, 1);

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.scale(depthScale, depthScale);
          ctx.globalAlpha = alpha;
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
          ctx.restore();
        }

        if (alive > 0) requestAnimationFrame(tick);
        else ctx.clearRect(0, 0, W, H);
      };
      requestAnimationFrame(tick);
    },
  };

  global.Animations = global.Animations || {};
  global.Animations.Confetti = Confetti;
})(typeof window !== 'undefined' ? window : this);
