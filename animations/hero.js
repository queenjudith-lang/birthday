/**
 * Hero — Movie section: video zoom, gradient overlay, word-by-word title, magnetic buttons, parallax
 */
;(function(global) {
  'use strict';
  const { Ease, Math: M, Viewport, prefersReducedMotion, RAF } = global.Animations.Utils;

  const Hero = {
    _video: null,
    _running: false,
    _mouseParallax: false,

    init(opts = {}) {
      this._video = document.getElementById('movie-bg');
      this._running = true;

      this._initVideo();
      this._initMagneticButtons();
      this._initParallax();
      this._animateTitle();
    },

    destroy() {
      this._running = false;
      if (this._video) this._video.pause?.();
    },

    pause() { this._video?.pause?.(); },
    resume() { this._video?.play?.().catch(() => {}); },
    restart() { this.destroy(); this.init(); },

    _initVideo() {
      if (!this._video) return;
      this._video.play?.().catch(() => {});
      // Slow zoom effect via CSS animation (already in style.css)
    },

    _initMagneticButtons() {
      document.querySelectorAll('.chapter--movie button, .chapter--movie a').forEach(btn => {
        btn.addEventListener('mouseenter', () => {
          if (window.gsap) gsap.to(btn, { scale: 1.04, duration: .3, ease: 'power2.out' });
        });
        btn.addEventListener('mouseleave', () => {
          if (window.gsap) gsap.to(btn, { scale: 1, x: 0, y: 0, duration: .4, ease: 'power3.out' });
        });
        btn.addEventListener('mousemove', (e) => {
          const rect = btn.getBoundingClientRect();
          const dx = (e.clientX - rect.left - rect.width / 2) * .2;
          const dy = (e.clientY - rect.top - rect.height / 2) * .2;
          btn.style.transform = `translate(${dx}px, ${dy}px)`;
        });
      });
    },

    _initParallax() {
      if (prefersReducedMotion() || !this._video) return;
      document.addEventListener('mousemove', (e) => {
        if (!this._running) return;
        const x = (e.clientX / Viewport.width() - .5) * 8;
        const y = (e.clientY / Viewport.height() - .5) * 5;
        this._video.style.transform = `scale(1.06) translate(${x}px, ${y}px)`;
      }, { passive: true });
    },

    _animateTitle() {
      if (prefersReducedMotion() || !window.gsap) return;

      const overlay = document.querySelector('.chapter--movie .movie__overlay');
      if (!overlay) return;

      const elements = overlay.querySelectorAll('.kicker, .display-2, .movie__starring, .primary-btn');
      gsap.set(elements, { opacity: 0, y: 25, filter: 'blur(8px)' });
      gsap.to(elements, {
        opacity: 1, y: 0, filter: 'blur(0px)',
        duration: 1.2, stagger: .2, ease: 'power3.out', delay: .3,
      });
    },
  };

  global.Animations = global.Animations || {};
  global.Animations.Hero = Hero;
})(typeof window !== 'undefined' ? window : this);
