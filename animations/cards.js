/**
 * Cards — 21 flip cards: 3D flip, heart particles, glow, magnetic hover, floating, cursor-reactive shadow
 */
;(function(global) {
  'use strict';
  const { Ease, Math: M, Viewport, prefersReducedMotion, RAF } = global.Animations.Utils;

  const Cards = {
    _items: [],
    _running: false,
    _mx: 0, _my: 0,

    init(opts = {}) {
      this._items = Array.from(document.querySelectorAll('#reasons-grid .reason-card'));
      this._running = true;

      window.addEventListener('mousemove', (e) => {
        this._mx = e.clientX;
        this._my = e.clientY;
      }, { passive: true });

      this._bindFlip();
      this._bindHover();
    },

    destroy() {
      this._running = false;
    },

    pause() {},
    resume() {},
    restart() { this.destroy(); this.init(); },

    reveal() {
      if (prefersReducedMotion()) {
        this._items.forEach(c => c.classList.add('is-visible'));
        return;
      }
      this._items.forEach((c, i) => {
        gsap.set(c, { opacity: 0, y: 25, rotateY: 0 });
        gsap.to(c, {
          opacity: 1, y: 0,
          duration: .7, ease: 'power3.out',
          delay: i * .06,
          onStart: () => c.classList.add('is-visible'),
        });
      });
    },

    _bindFlip() {
      this._items.forEach(card => {
        card.addEventListener('click', () => {
          const isFlipped = card.classList.toggle('is-flipped');
          if (isFlipped && !prefersReducedMotion()) {
            this._spawnHeartParticles(card);
          }
        });
      });
    },

    _bindHover() {
      if (prefersReducedMotion() || Viewport.isMobile()) return;
      this._items.forEach(card => {
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dx = (e.clientX - cx) / rect.width;
          const dy = (e.clientY - cy) / rect.height;
          // Subtle tilt
          const tiltX = dy * -6;
          const tiltY = dx * 6;
          card.style.transform = card.classList.contains('is-flipped')
            ? `rotateY(180deg) rotateX(${tiltX}deg) rotateY(${tiltY + 180}deg)`
            : `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
        });
        card.addEventListener('mouseleave', () => {
          card.style.transform = card.classList.contains('is-flipped') ? 'rotateY(180deg)' : '';
        });
      });
    },

    _spawnHeartParticles(card) {
      if (prefersReducedMotion()) return;
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      for (let i = 0; i < 6; i++) {
        const heart = document.createElement('div');
        heart.style.cssText = `
          position: fixed; left: ${cx}px; top: ${cy}px;
          width: 10px; height: 10px; pointer-events: none; z-index: 9999;
          background: hsl(${M.rand(340, 360)}, 80%, 65%);
          clip-path: path('M5 1C3-1 0 0 0 3 0 5 5 9 5 9 5 9 10 5 10 3 10 0 7-1 5 1Z');
        `;
        document.body.appendChild(heart);

        gsap.to(heart, {
          x: M.rand(-60, 60),
          y: M.rand(-80, -20),
          scale: M.rand(.5, 1.5),
          opacity: 0,
          duration: M.rand(.6, 1),
          ease: 'power2.out',
          onComplete: () => heart.remove(),
        });
      }
    },
  };

  global.Animations = global.Animations || {};
  global.Animations.Cards = Cards;
})(typeof window !== 'undefined' ? window : this);
