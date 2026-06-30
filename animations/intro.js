/**
 * Intro — Cinematic opening: slow zoom, particles, camera move, logo fade, char-by-char type
 */
;(function(global) {
  'use strict';
  const { Ease, Math: M, Viewport, prefersReducedMotion, RAF } = global.Animations.Utils;

  const Intro = {
    _el: null,
    _running: false,
    _timeline: null,

    init(opts = {}) {
      this._el = opts.element || document.querySelector('.chapter--lock');
      if (!this._el) return;
      this._running = true;

      if (prefersReducedMotion()) {
        this._instantReveal();
        return;
      }

      this._animate(opts.onComplete);
    },

    destroy() {
      this._running = false;
      if (this._timeline) { this._timeline.kill?.(); this._timeline = null; }
    },

    pause() { this._timeline?.pause?.(); },
    resume() { this._timeline?.resume?.(); },
    restart() { this.destroy(); this.init(); },

    _instantReveal() {
      const els = this._el.querySelectorAll('.kicker, .display-1, .lock__subtitle, .keypad');
      els.forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
    },

    _animate(onComplete) {
      if (!window.gsap) { this._instantReveal(); onComplete?.(); return; }

      const gs = gsap;
      const tl = gs.timeline({ onComplete });
      this._timeline = tl;

      const kicker = this._el.querySelector('.kicker');
      const title = this._el.querySelector('.display-1');
      const sub = this._el.querySelector('.lock__subtitle');
      const keypad = this._el.querySelector('.keypad');
      const portrait = this._el.querySelector('.portrait-frame');

      // Set initial states
      gs.set([kicker, title, sub, keypad], { opacity: 0, y: 30, filter: 'blur(12px)' });
      if (portrait) gs.set(portrait, { opacity: 0, scale: .85, filter: 'blur(20px)' });

      // Sequence
      tl.to(portrait || {}, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.8, ease: 'power3.out' }, .3)
        .to(kicker, { opacity: .9, y: 0, filter: 'blur(0px)', duration: 1, ease: 'power3.out' }, 1)
        .to(title, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.4, ease: 'power3.out' }, 1.4)
        .to(sub, { opacity: .95, y: 0, filter: 'blur(0px)', duration: 1, ease: 'power3.out' }, 2)
        .to(keypad, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.2, ease: 'power3.out' }, 2.6);
    },
  };

  global.Animations = global.Animations || {};
  global.Animations.Intro = Intro;
})(typeof window !== 'undefined' ? window : this);
