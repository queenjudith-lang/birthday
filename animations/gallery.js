/**
 * Gallery — Floating scrapbook, polaroid rotation, hover lift, dynamic shadows, stacked separation
 */
;(function(global) {
  'use strict';
  const { Ease, Math: M, Viewport, prefersReducedMotion, RAF } = global.Animations.Utils;

  const Gallery = {
    _items: [],
    _running: false,
    _observer: null,

    init(opts = {}) {
      this._items = Array.from(document.querySelectorAll('#scrapbook .polaroid'));
      this._running = true;
      this._bindHover();
      this._initObserver();
    },

    destroy() {
      this._running = false;
      this._observer?.disconnect?.();
    },

    pause() {},
    resume() {},
    restart() { this.destroy(); this.init(); },

    reveal() {
      if (prefersReducedMotion()) {
        this._items.forEach(c => c.classList.add('is-revealing'));
        return;
      }

      this._items.forEach((c, i) => {
        gsap.set(c, { opacity: 0, y: 60, rotation: parseFloat(getComputedStyle(c).getPropertyValue('--rot')) || 0 });
        gsap.to(c, {
          opacity: 1, y: 0,
          duration: .9, ease: 'power3.out',
          delay: i * .08,
          onStart: () => c.classList.add('is-revealing'),
        });
      });
    },

    _bindHover() {
      this._items.forEach(item => {
        item.addEventListener('mouseenter', () => {
          if (prefersReducedMotion()) return;
          gsap.to(item, {
            scale: 1.05, y: -10, rotation: 0,
            boxShadow: '0 32px 60px rgba(0,0,0,.55), 0 0 30px rgba(245,214,138,.18)',
            duration: .45, ease: 'power2.out',
          });
        });
        item.addEventListener('mouseleave', () => {
          if (prefersReducedMotion()) return;
          const rot = parseFloat(item.style.getPropertyValue('--rot')) || 0;
          gsap.to(item, {
            scale: 1, y: 0, rotation: rot,
            boxShadow: '0 20px 40px rgba(0,0,0,.4), 0 3px 8px rgba(0,0,0,.25)',
            duration: .5, ease: 'power3.out',
          });
        });
      });
    },

    _initObserver() {
      if (!('IntersectionObserver' in window)) return;
      this._observer = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('is-revealing');
            this._observer.unobserve(e.target);
          }
        });
      }, { threshold: .15 });
      this._items.forEach(c => this._observer.observe(c));
    },
  };

  global.Animations = global.Animations || {};
  global.Animations.Gallery = Gallery;
})(typeof window !== 'undefined' ? window : this);
