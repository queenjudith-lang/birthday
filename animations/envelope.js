/**
 * Envelope — Wax seal melt, envelope unfolds, letter slides up, paper unfolds
 */
;(function(global) {
  'use strict';
  const { Ease, Math: M, Viewport, prefersReducedMotion, RAF } = global.Animations.Utils;

  const Envelope = {
    _el: null,
    _seal: null,
    _running: false,

    init(opts = {}) {
      this._el = document.getElementById('envelope');
      this._seal = document.getElementById('wax-seal');
      if (!this._el) return;
      this._running = true;
    },

    destroy() { this._running = false; },
    pause() {},
    resume() {},
    restart() { this.destroy(); this.init(); },

    animateSealBreak(seal, onComplete) {
      const el = seal || this._seal;
      if (!el) { onComplete?.(); return; }
      if (prefersReducedMotion()) { el.style.display = 'none'; onComplete?.(); return; }

      if (window.gsap) {
        gsap.to(el, {
          scale: 1.15, rotation: 8, opacity: 0,
          duration: .8, ease: 'power2.in',
          onComplete
        });
      } else {
        el.style.animation = 'waxMelt 1.1s var(--ease-in-out) forwards';
        setTimeout(onComplete, 1100);
      }
    },

    animateOpen(envelope, onComplete) {
      const el = envelope || this._el;
      if (!el) { onComplete?.(); return; }
      if (prefersReducedMotion()) { el.classList.add('is-open'); onComplete?.(); return; }

      if (window.gsap) {
        const flap = el.querySelector('.envelope__flap');
        const letter = el.querySelector('.envelope__letter');
        const seal = el.querySelector('.wax-seal');

        const tl = gs.timeline({ onComplete: () => el.classList.add('is-open') });
        tl.call(onComplete, null, '+=1.8');

        if (seal) {
          tl.to(seal, { scale: 1.1, opacity: .5, duration: .3, ease: 'power2.out' }, 0)
            .to(seal, { y: '120%', scale: .4, opacity: 0, filter: 'blur(8px)', duration: .8, ease: 'power2.in' }, .3);
        }
        if (flap) {
          tl.to(flap, { rotateX: 180, duration: 1, ease: 'power2.inOut' }, .4);
        }
        if (letter) {
          tl.to(letter, { y: '-46%', duration: 1.2, ease: 'power3.out' }, .6);
        }
      } else {
        el.classList.add('is-open');
        setTimeout(onComplete, 1800);
      }
    },

    reset(envelope) {
      const el = envelope || this._el;
      if (el) el.classList.remove('is-open');
    },
  };

  global.Animations = global.Animations || {};
  global.Animations.Envelope = Envelope;
})(typeof window !== 'undefined' ? window : this);
