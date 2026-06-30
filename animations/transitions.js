/**
 * Transitions — Cinematic screen transitions: blur, camera push, zoom, crossfade, gradient wipe, light sweep
 */
;(function(global) {
  'use strict';
  const { Ease, Math: M, Viewport, prefersReducedMotion, RAF } = global.Animations.Utils;

  const Transitions = {
    _wipe: null,
    _isTransitioning: false,

    init(opts = {}) {
      this._wipe = document.querySelector('.page-wipe');
    },

    destroy() {
      this._isTransitioning = false;
    },

    pause() {},
    resume() {},
    restart() { this.destroy(); this.init(); },

    /**
     * Cinematic wipe transition
     * @returns {Promise} resolves when transition completes
     */
    async wipe(fromEl, toEl) {
      if (this._isTransitioning) return;
      if (prefersReducedMotion()) {
        this._instantSwap(fromEl, toEl);
        return;
      }
      this._isTransitioning = true;

      // Wipe in
      if (this._wipe) {
        this._wipe.classList.remove('is-out');
        this._wipe.classList.add('is-in');
        await this._sleep(580);
      }

      // Swap chapters
      if (fromEl) {
        fromEl.classList.remove('is-active', 'is-entering');
        fromEl.style.opacity = '0';
      }
      if (toEl) {
        toEl.classList.add('is-active', 'is-entering');
        toEl.style.opacity = '1';
      }

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'instant' });

      // Wipe out
      if (this._wipe) {
        this._wipe.classList.remove('is-in');
        this._wipe.classList.add('is-out');
        await this._sleep(600);
        this._wipe.classList.remove('is-out');
      }

      this._isTransitioning = false;
    },

    /**
     * Blur crossfade — for overlapping content
     */
    async blurCrossfade(fromEl, toEl, duration = .8) {
      if (this._isTransitioning) return;
      if (prefersReducedMotion()) { this._instantSwap(fromEl, toEl); return; }
      this._isTransitioning = true;

      if (window.gsap) {
        const tl = gsap.timeline({
          onComplete: () => { this._isTransitioning = false; }
        });

        if (fromEl) {
          tl.to(fromEl, { filter: 'blur(20px)', opacity: 0, duration: duration / 2, ease: 'power2.in' });
        }
        tl.call(() => {
          if (fromEl) { fromEl.classList.remove('is-active'); fromEl.style.filter = ''; }
          if (toEl) { toEl.classList.add('is-active'); }
        });
        if (toEl) {
          gsap.set(toEl, { filter: 'blur(20px)', opacity: 0 });
          tl.to(toEl, { filter: 'blur(0px)', opacity: 1, duration: duration / 2, ease: 'power2.out' });
        }
      } else {
        this._instantSwap(fromEl, toEl);
        this._isTransitioning = false;
      }
    },

    /**
     * Zoom transition — cinematic camera push
     */
    async zoomPush(fromEl, toEl) {
      if (this._isTransitioning) return;
      if (prefersReducedMotion()) { this._instantSwap(fromEl, toEl); return; }
      this._isTransitioning = true;

      if (window.gsap && fromEl) {
        await new Promise(resolve => {
          gsap.to(fromEl, {
            scale: 1.1, filter: 'blur(8px)', opacity: 0,
            duration: .6, ease: 'power2.in',
            onComplete: () => {
              fromEl.classList.remove('is-active');
              fromEl.style.cssText = '';
              if (toEl) toEl.classList.add('is-active');
              window.scrollTo({ top: 0, behavior: 'instant' });
              if (toEl) {
                gsap.fromTo(toEl,
                  { scale: .95, filter: 'blur(8px)', opacity: 0 },
                  { scale: 1, filter: 'blur(0px)', opacity: 1, duration: .7, ease: 'power2.out', onComplete: resolve }
                );
              } else {
                resolve();
              }
            }
          });
        });
      } else {
        this._instantSwap(fromEl, toEl);
      }
      this._isTransitioning = false;
    },

    /**
     * Light sweep — gradient passes across the screen
     */
    async lightSweep(fromEl, toEl) {
      if (this._isTransitioning) return;
      if (prefersReducedMotion()) { this._instantSwap(fromEl, toEl); return; }
      this._isTransitioning = true;

      // Create sweep element
      const sweep = document.createElement('div');
      sweep.style.cssText = `
        position: fixed; inset: 0; z-index: 9600; pointer-events: none;
        background: linear-gradient(90deg, transparent 0%, rgba(245,214,138,.3) 50%, transparent 100%);
        transform: translateX(-101%);
      `;
      document.body.appendChild(sweep);

      if (window.gsap) {
        const tl = gsap.timeline({
          onComplete: () => { sweep.remove(); this._isTransitioning = false; }
        });
        tl.to(sweep, { x: '101%', duration: .8, ease: 'power2.inOut' });
        tl.call(() => {
          if (fromEl) fromEl.classList.remove('is-active');
          if (toEl) toEl.classList.add('is-active');
          window.scrollTo({ top: 0, behavior: 'instant' });
        }, null, .4);
      } else {
        this._instantSwap(fromEl, toEl);
        sweep.remove();
        this._isTransitioning = false;
      }
    },

    _instantSwap(fromEl, toEl) {
      if (fromEl) fromEl.classList.remove('is-active');
      if (toEl) toEl.classList.add('is-active');
      window.scrollTo({ top: 0, behavior: 'instant' });
    },

    _sleep(ms) { return new Promise(r => setTimeout(r, ms)); },
  };

  global.Animations = global.Animations || {};
  global.Animations.Transitions = Transitions;
})(typeof window !== 'undefined' ? window : this);
