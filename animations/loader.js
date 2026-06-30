/**
 * Loader — Floating words rise, progress bar fills, words merge into name
 */
;(function(global) {
  'use strict';
  const { Ease, Math: M, Viewport, prefersReducedMotion, RAF } = global.Animations.Utils;

  const Loader = {
    _running: false,
    _timeline: null,

    init(opts = {}) {
      this._running = true;
      const section = document.querySelector('.chapter--preparing');
      if (!section) return;

      if (prefersReducedMotion()) { this._instantReveal(section); opts.onComplete?.(); return; }
      this._animate(section, opts.onComplete);
    },

    destroy() {
      this._running = false;
      this._timeline?.kill?.();
    },

    pause() { this._timeline?.pause?.(); },
    resume() { this._timeline?.resume?.(); },
    restart() { this.destroy(); this.init(); },

    _instantReveal(section) {
      const merged = section.querySelector('.floating-word.merged');
      const fill = document.getElementById('loader-fill');
      const pct = document.getElementById('loader-percent');
      if (merged) { merged.style.opacity = '1'; merged.style.transform = 'none'; }
      if (fill) fill.style.right = '0%';
      if (pct) pct.textContent = '100';
    },

    _animate(section, onComplete) {
      if (!window.gsap) { this._instantReveal(section); onComplete?.(); return; }

      const gs = gsap;
      const words = section.querySelectorAll('.floating-word:not(.merged)');
      const merged = section.querySelector('.floating-word.merged');
      const fill = document.getElementById('loader-fill');
      const pct = document.getElementById('loader-percent');

      const tl = gs.timeline({ onComplete });
      this._timeline = tl;

      // Animate each word floating upward
      words.forEach((w, i) => {
        gs.set(w, { opacity: 0, y: 30, filter: 'blur(10px)' });
        tl.to(w, { opacity: 1, y: -40, filter: 'blur(0px)', duration: .9, ease: 'power3.out' }, i * .7)
          .to(w, { opacity: 0, y: -90, filter: 'blur(6px)', duration: .7, ease: 'power2.in' }, i * .7 + .7);
      });

      // Progress bar
      const totalDuration = words.length * .7 + .8;
      if (fill && pct) {
        tl.to({ v: 0 }, {
          v: 100, duration: totalDuration, ease: 'none',
          onUpdate: function() {
            const val = Math.round(this.targets()[0].v);
            fill.style.right = `${100 - val}%`;
            pct.textContent = String(val);
          }
        }, 0);
      }

      // Merge into name
      if (merged) {
        gs.set(merged, { opacity: 0, y: 30, filter: 'blur(14px)', scale: .96 });
        tl.to(merged, { opacity: 1, y: 0, filter: 'blur(0px)', scale: 1, duration: 1.4, ease: 'power3.out' }, totalDuration + .2);
      }
    },
  };

  global.Animations = global.Animations || {};
  global.Animations.Loader = Loader;
})(typeof window !== 'undefined' ? window : this);
