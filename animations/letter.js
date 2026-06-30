/**
 * Letter — Typewriter effect, cursor blink, ink-writing, paragraph fade, margin photos slide
 */
;(function(global) {
  'use strict';
  const { Ease, Math: M, Viewport, prefersReducedMotion, RAF } = global.Animations.Utils;

  const Letter = {
    _running: false,
    _started: false,
    _body: null,
    _photos: [],

    init(opts = {}) {
      this._body = document.getElementById('letter-body');
      this._photos = Array.from(document.querySelectorAll('.margin-photo'));
      if (!this._body) return;
      this._running = true;
      this._started = false;
    },

    destroy() {
      this._running = false;
      this._started = false;
    },

    pause() { this._running = false; },
    resume() { this._running = true; },
    restart() { this.destroy(); this.init(); },

    async startTyping(paragraphs, photoSources) {
      if (this._started) return;
      this._started = true;

      if (prefersReducedMotion() || !window.gsap) {
        this._instantReveal(paragraphs);
        return;
      }

      for (let i = 0; i < paragraphs.length; i++) {
        if (!this._running) return;
        const p = document.createElement('p');
        this._body.appendChild(p);

        // Fade in paragraph
        gsap.set(p, { opacity: 0, y: 10 });
        gsap.to(p, { opacity: 1, y: 0, duration: .5, ease: 'power2.out' });

        // Typewriter effect
        const text = paragraphs[i];
        const caret = document.createElement('span');
        caret.className = 'caret';
        p.appendChild(caret);

        for (let j = 0; j < text.length; j++) {
          if (!this._running) return;
          const ch = document.createTextNode(text[j]);
          p.insertBefore(ch, caret);
          await this._sleep(M.rand(18, 35));
        }
        caret.remove();

        // Reveal margin photo
        if (this._photos[i]) {
          this._photos[i].classList.add('is-shown');
        }

        await this._sleep(400);
      }
    },

    _instantReveal(paragraphs) {
      this._body.innerHTML = paragraphs.map(p => `<p class="is-visible">${p}</p>`).join('');
      this._photos.forEach(ph => ph.classList.add('is-shown'));
    },

    _sleep(ms) {
      return new Promise(r => setTimeout(r, ms));
    },
  };

  global.Animations = global.Animations || {};
  global.Animations.Letter = Letter;
})(typeof window !== 'undefined' ? window : this);
