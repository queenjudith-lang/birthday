/**
 * Unlock — Passcode unlock: scale press, glow bloom, blur, camera push, door-open effect
 */
;(function(global) {
  'use strict';
  const { Ease, Math: M, Viewport, prefersReducedMotion, RAF } = global.Animations.Utils;

  const Unlock = {
    _keypad: null,
    _running: false,

    init(opts = {}) {
      this._keypad = document.getElementById('keypad');
      if (!this._keypad) return;
      this._running = true;
      this._bindKeyAnimations();
    },

    destroy() {
      this._running = false;
      this._keypad?.removeEventListener('click', this._handleClick);
    },

    pause() {},
    resume() {},
    restart() { this.destroy(); this.init(); },

    _bindKeyAnimations() {
      this._keypad.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-key]');
        if (!btn || btn.dataset.key === 'hint' || btn.dataset.key === 'back') return;
        this._animatePress(btn);
      });
    },

    _animatePress(btn) {
      if (prefersReducedMotion()) return;
      if (window.gsap) {
        gsap.fromTo(btn,
          { scale: 1 },
          { scale: .92, duration: .1, ease: 'power2.in', yoyo: true, repeat: 1 }
        );
      }
    },

    animateWrongPasscode(keypad) {
      if (prefersReducedMotion()) return;
      const el = keypad || this._keypad;
      if (window.gsap) {
        const tl = gsap.timeline();
        tl.to(el, { x: -8, duration: .06, ease: 'power2.out' })
          .to(el, { x: 8, duration: .06, ease: 'power2.out' })
          .to(el, { x: -5, duration: .06, ease: 'power2.out' })
          .to(el, { x: 5, duration: .06, ease: 'power2.out' })
          .to(el, { x: 0, duration: .1, ease: 'power2.out' });

        // Red flash
        gsap.to(el, {
          boxShadow: '0 0 40px rgba(196,22,59,.5), inset 0 0 0 1px rgba(196,22,59,.3)',
          duration: .3, yoyo: true, repeat: 1, ease: 'power2.out'
        });
      } else {
        el.classList.add('is-shaking');
        setTimeout(() => el.classList.remove('is-shaking'), 500);
      }
    },

    animateUnlock(keypad, onComplete) {
      if (prefersReducedMotion()) { onComplete?.(); return; }
      const el = keypad || this._keypad;

      if (window.gsap) {
        const tl = gsap.timeline({ onComplete });
        tl.to(el, { scale: 1.05, filter: 'brightness(1.4)', duration: .4, ease: 'power2.out' })
          .to(el, {
            scale: .3, opacity: 0, filter: 'blur(24px)',
            duration: 1, ease: 'power3.inOut'
          });
      } else {
        el.classList.add('is-unlocked');
        setTimeout(onComplete, 1200);
      }
    },
  };

  global.Animations = global.Animations || {};
  global.Animations.Unlock = Unlock;
})(typeof window !== 'undefined' ? window : this);
