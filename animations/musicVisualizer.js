/**
 * MusicVisualizer — Elegant glass audio visualizer with reactive bars and glow
 */
;(function(global) {
  'use strict';
  const { Ease, Math: M, Viewport, prefersReducedMotion, RAF, Color } = global.Animations.Utils;

  const MusicVisualizer = {
    _canvas: null,
    _ctx: null,
    _audioCtx: null,
    _analyser: null,
    _source: null,
    _data: null,
    _bars: [],
    _running: false,
    _audio: null,

    init(opts = {}) {
      this._audio = document.getElementById('bg-music');
      if (!this._audio) return;

      // Create visualizer canvas
      this._canvas = document.createElement('canvas');
      this._canvas.className = 'music-visualizer';
      this._canvas.style.cssText = `
        position: fixed; bottom: 0; left: 50%; transform: translateX(-50%);
        width: min(400px, 80vw); height: 48px; z-index: 6999;
        pointer-events: none; opacity: 0; transition: opacity .6s ease;
      `;
      this._canvas.setAttribute('aria-hidden', 'true');
      document.body.appendChild(this._canvas);

      this._ctx = this._canvas.getContext('2d');
      this._running = true;
      this._resize();
      window.addEventListener('resize', () => this._resize());
    },

    destroy() {
      this._running = false;
      this._canvas?.remove();
      this._audioCtx?.close?.();
    },

    pause() { this._running = false; },
    resume() { this._running = true; RAF.add('visualizer', (t, dt) => this._tick(t, dt)); },

    connect() {
      if (this._audioCtx) return;
      try {
        this._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this._analyser = this._audioCtx.createAnalyser();
        this._analyser.fftSize = 128;
        this._analyser.smoothingTimeConstant = .82;
        this._source = this._audioCtx.createMediaElementSource(this._audio);
        this._source.connect(this._analyser);
        this._analyser.connect(this._audioCtx.destination);
        this._data = new Uint8Array(this._analyser.frequencyBinCount);
        this._canvas.style.opacity = '.7';
        RAF.add('visualizer', (t, dt) => this._tick(t, dt));
      } catch (_) {
        /* Web Audio not available */
      }
    },

    _resize() {
      const dpr = Viewport.dpr();
      const W = this._canvas?.clientWidth || 400;
      const H = this._canvas?.clientHeight || 48;
      if (this._canvas) {
        this._canvas.width = W * dpr;
        this._canvas.height = H * dpr;
        this._ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    },

    _tick(time, dt) {
      if (!this._running || !this._analyser) return;

      this._analyser.getByteFrequencyData(this._data);
      const W = this._canvas.clientWidth;
      const H = this._canvas.clientHeight;
      const ctx = this._ctx;

      ctx.clearRect(0, 0, W, H);

      // Glass background
      ctx.fillStyle = 'rgba(255,250,243,.04)';
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, 12);
      ctx.fill();

      const barCount = 24;
      const barWidth = W / barCount - 2;
      const step = Math.floor(this._data.length / barCount);

      for (let i = 0; i < barCount; i++) {
        const val = this._data[i * step] / 255;
        const barH = Math.max(2, val * H * .85);
        const x = i * (barWidth + 2) + 1;
        const y = H - barH;

        // Bar gradient
        const grad = ctx.createLinearGradient(x, H, x, y);
        grad.addColorStop(0, Color.hslToString(345, 60, 55, .8));
        grad.addColorStop(.5, Color.hslToString(350, 55, 65, .7));
        grad.addColorStop(1, Color.hslToString(45, 70, 75, .6));

        ctx.fillStyle = grad;
        ctx.shadowColor = Color.hslToString(45, 70, 75, .3);
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barH, 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    },
  };

  global.Animations = global.Animations || {};
  global.Animations.MusicVisualizer = MusicVisualizer;
})(typeof window !== 'undefined' ? window : this);
