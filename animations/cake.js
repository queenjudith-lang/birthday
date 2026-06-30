/**
 * Cake — SVG cake assembly, candle rise, flame ignite, flicker, countdown, smoke simulation
 */
;(function(global) {
  'use strict';
  const { Ease, Math: M, Viewport, prefersReducedMotion, RAF } = global.Animations.Utils;

  const Cake = {
    _running: false,
    _candles: [],
    _smokeParticles: [],

    init(opts = {}) {
      this._candles = Array.from(document.querySelectorAll('#candles .candle'));
      this._running = true;
    },

    destroy() {
      this._running = false;
      this._smokeParticles = [];
    },

    pause() {},
    resume() {},
    restart() { this.destroy(); this.init(); },

    lightCandles(onComplete) {
      if (prefersReducedMotion()) {
        this._candles.forEach(c => {
          const flame = c.querySelector('.flame');
          if (flame) { flame.style.opacity = '1'; flame.style.transform = 'scale(1,1)'; }
        });
        onComplete?.();
        return;
      }

      this._candles.forEach((c, i) => {
        const flame = c.querySelector('.flame');
        if (!flame) return;
        gsap.set(flame, { opacity: 0, scale: .2, transformOrigin: 'center bottom' });
        gsap.to(flame, {
          opacity: 1, scale: 1,
          duration: .6, ease: 'back.out(1.5)',
          delay: i * .25,
        });
      });

      // Natural flicker
      setTimeout(() => {
        this._candles.forEach((c, i) => {
          const flame = c.querySelector('.flame');
          if (flame) {
            gsap.to(flame, {
              scaleX: M.rand(.92, 1.08), scaleY: M.rand(1.05, 1.2), rotation: M.rand(-3, 3),
              duration: M.rand(.8, 1.4), ease: 'sine.inOut', yoyo: true, repeat: -1,
              delay: i * .15,
            });
          }
        });
        onComplete?.();
      }, this._candles.length * 250 + 600);
    },

    async extinguish(canvas, onComplete) {
      // Extinguish in sequence
      for (let i = 0; i < this._candles.length; i++) {
        const c = this._candles[i];
        const flame = c.querySelector('.flame');
        if (flame) {
          gsap.killTweensOf(flame);
          gsap.to(flame, {
            scale: .15, opacity: 0, scaleY: .05,
            duration: .4, ease: 'power2.in',
          });
          // Smoke
          this._spawnSmoke(c);
        }
        await this._sleep(130);
      }
      await this._sleep(400);
      onComplete?.();
    },

    _spawnSmoke(candle) {
      const rect = candle.getBoundingClientRect();
      const svg = candle.closest('svg');
      if (!svg) return;
      const svgRect = svg.getBoundingClientRect();

      for (let i = 0; i < 4; i++) {
        const smoke = document.createElement('div');
        smoke.style.cssText = `
          position: fixed;
          left: ${rect.left + rect.width / 2}px;
          top: ${rect.top}px;
          width: ${M.rand(4, 8)}px;
          height: ${M.rand(4, 8)}px;
          border-radius: 50%;
          background: rgba(200,200,200,.4);
          pointer-events: none;
          z-index: 100;
        `;
        document.body.appendChild(smoke);

        gsap.to(smoke, {
          y: M.rand(-40, -70),
          x: M.rand(-15, 15),
          scale: M.rand(2, 4),
          opacity: 0,
          duration: M.rand(.8, 1.4),
          ease: 'power1.out',
          onComplete: () => smoke.remove(),
        });
      }
    },

    _sleep(ms) { return new Promise(r => setTimeout(r, ms)); },
  };

  global.Animations = global.Animations || {};
  global.Animations.Cake = Cake;
})(typeof window !== 'undefined' ? window : this);
