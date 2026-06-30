# Animation System — For Beavel Nyawira

Premium handcrafted animation modules powering the cinematic birthday experience.

## Architecture

Every module follows a consistent interface:

```javascript
AnimationName.init(opts)     // Initialize
AnimationName.destroy()      // Clean up all resources
AnimationName.pause()        // Pause animation loop
AnimationName.resume()       // Resume animation loop
AnimationName.restart()      // Reset and reinitialize
```

All canvas animations use the central `RAF` manager from `utils.js` for efficient single-loop rendering.

## Loading

Load `utils.js` first, then any animation module:

```html
<script src="animations/utils.js"></script>
<script src="animations/cursor.js"></script>
<script src="animations/particles.js"></script>
<!-- etc -->
```

All modules attach to `window.Animations` namespace.

## Modules

| File | Purpose | Type |
|------|---------|------|
| `utils.js` | Easing, math, RAF manager, viewport, reduced motion, color helpers | Foundation |
| `cursor.js` | Custom cursor with glow, heart trail, ripple on click, magnetic buttons | Canvas |
| `particles.js` | Floating ambient particles with parallax, mouse interaction, chapter-aware colors | Canvas |
| `petals.js` | Realistic falling rose petals with wind simulation, depth blur, rotation | Canvas |
| `stars.js` | Star field with twinkling, constellation drawing, shooting stars, parallax | Canvas |
| `intro.js` | Cinematic opening: slow zoom, staggered text reveal | GSAP/DOM |
| `unlock.js` | Passcode press scale, wrong-code shake/red-glow, unlock bloom/blur | GSAP/DOM |
| `loader.js` | Floating words rise, progress bar fills, merge into name | GSAP/DOM |
| `envelope.js` | Wax seal melt, envelope unfold, letter slide up | GSAP/DOM |
| `hero.js` | Video zoom, gradient overlay, word-by-word title, magnetic buttons, parallax | GSAP/DOM |
| `letter.js` | Typewriter effect, cursor blink, margin photo slide-in | GSAP/DOM |
| `gallery.js` | Floating scrapbook, polaroid hover lift, dynamic shadow, stacked separation | GSAP/DOM |
| `timeline.js` | Growing line, pulsing dots, alternating card slide | GSAP/Observer |
| `cards.js` | 3D flip cards, heart particles, magnetic hover, cursor-reactive tilt | GSAP/DOM |
| `cake.js` | Candle ignite/flicker, countdown, extinguish with smoke simulation | GSAP/DOM |
| `fireworks.js` | Canvas fireworks with glow, smoke, floating hearts, golden sparkles | Canvas |
| `confetti.js` | Paper confetti with physics, wind, bounce, depth | Canvas |
| `transitions.js` | Cinematic wipes, blur crossfade, zoom push, light sweep | GSAP/DOM |
| `musicVisualizer.js` | Glass audio visualizer with reactive bars and glow | Web Audio/Canvas |

## Reduced Motion

All modules check `prefers-reduced-motion` and provide instant reveals when enabled.

## Performance

- Single RAF loop via `RAF` manager (no duplicate `requestAnimationFrame`)
- Canvas objects recycled via `Pool` utility
- GPU-accelerated transforms (`translate`, `scale`, `opacity`)
- Lazy initialization — modules only run when their chapter is active
- `destroy()` cancels RAF and clears arrays to prevent memory leaks

## Customization

### Easing

```javascript
const { Ease } = Animations.Utils;
Ease.luxury(t)      // Slow-in, smooth-out
Ease.cinematic(t)   // Dramatic slow-in, crisp stop
Ease.breathe(t)     // Continuous gentle oscillation
```

### Math

```javascript
const { Math: M } = Animations.Utils;
M.lerp(a, b, t)           // Linear interpolation
M.damp(current, target, smoothing, dt)  // Smooth following
M.rand(min, max)          // Random float
M.clamp(n, min, max)      // Clamp value
M.map(n, inMin, inMax, outMin, outMax)  // Remap range
```

### Colors

```javascript
const { Color } = Animations.Utils;
Color.hslToString(h, s, l, a)  // HSL to CSS string
Color.hexToRgb('#c4163b')      // Hex to RGB object
```
