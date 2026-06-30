/**
 * Timeline — Growing line, pulsing dots, alternating card slide, background shift
 */
;(function(global) {
  'use strict';
  const { Ease, Math: M, Viewport, prefersReducedMotion, RAF } = global.Animations.Utils;

  const Timeline = {
    _items: [],
    _line: null,
    _observer: null,
    _running: false,

    init(opts = {}) {
      this._items = Array.from(document.querySelectorAll('#timeline .timeline__item'));
      this._line = document.querySelector('.timeline::before');
      this._running = true;
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
        this._items.forEach(item => {
          item.querySelector('.timeline__card')?.classList.add('is-visible');
        });
        return;
      }

      const cards = this._items.map(item => item.querySelector('.timeline__card')).filter(Boolean);

      // Animate first few cards immediately
      cards.slice(0, 2).forEach((card, i) => {
        gsap.set(card, { opacity: 0, y: 30, x: i % 2 === 0 ? -20 : 20 });
        gsap.to(card, {
          opacity: 1, y: 0, x: 0,
          duration: .9, ease: 'power3.out',
          delay: .3 + i * .2,
          onStart: () => card.classList.add('is-visible'),
        });
      });

      // Pulsing dots
      this._items.forEach(item => {
        const dot = item.querySelector('.timeline__dot');
        if (dot) {
          gsap.to(dot, {
            boxShadow: '0 0 0 8px rgba(245,214,138,.3), 0 0 30px rgba(245,214,138,.6)',
            duration: 1.5, ease: 'power1.inOut', yoyo: true, repeat: -1,
          });
        }
      });
    },

    _initObserver() {
      if (!('IntersectionObserver' in window)) return;
      this._observer = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const card = e.target.querySelector('.timeline__card');
            if (card && !card.classList.contains('is-visible')) {
              const isOdd = this._items.indexOf(e.target) % 2 === 0;
              if (window.gsap) {
                gsap.set(card, { opacity: 0, y: 30, x: isOdd ? -20 : 20 });
                gsap.to(card, {
                  opacity: 1, y: 0, x: 0,
                  duration: .9, ease: 'power3.out',
                  onStart: () => card.classList.add('is-visible'),
                });
              } else {
                card.classList.add('is-visible');
              }
            }
            this._observer.unobserve(e.target);
          }
        });
      }, { threshold: .2 });
      this._items.forEach(item => this._observer.observe(item));
    },
  };

  global.Animations = global.Animations || {};
  global.Animations.Timeline = Timeline;
})(typeof window !== 'undefined' ? window : this);
