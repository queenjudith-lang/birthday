# For Beavel Nyawira — Happy 21st Birthday

A premium interactive birthday website built as a cinematic love story experience. Handcrafted with vanilla HTML, CSS, and JavaScript.

## ✨ Features

- **11 Cinematic Screens** — A journey from a locked surprise to a grand finale
- **Passcode Lock** — Unlocks with the code `010705`
- **Three.js Particle Systems** — Unique floating particle animations per screen
- **GSAP Animations** — Buttery-smooth cinematic transitions
- **Interactive Elements** — Wax seal, flip cards, polaroid gallery, timeline, cake candles
- **Responsive Design** — Works on all devices
- **Fullscreen Mode** — Immersive experience
- **Background Music** — Play/pause toggle
- **Cursor Glow** — Custom cursor with floating hearts

## 📁 Project Structure

```
for-beavel/
├── index.html              # Main entry point
├── style.css               # Complete design system
├── script.js               # All interactions and animations
├── README.md               # This file
└── assets/
    ├── data/
    │   └── memories.json   # Editable content data
    ├── images/
    │   ├── hero/
    │   │   └── beavel.jpg  # Lock screen portrait
    │   └── gallery/
    │       ├── g1-g9.jpg   # 9 polaroid gallery photos
    ├── videos/
    │   └── story.mp4       # Movie screen background video
    ├── music/
    │   └── ambient.mp3     # Background music
    ├── icons/
    ├── fonts/
    └── animations/
```

## 🚀 Getting Started

### 1. Add Your Content

**Images:**
- `assets/images/portrait.jpg` — A beautiful portrait for the lock screen
- `assets/images/photo1-3.jpg` — Photos that float beside the love letter
- `assets/gallery/photo1-8.jpg` — 8 photos for the polaroid scrapbook gallery
- `assets/gallery/memory1-6.jpg` — 6 photos for the timeline section

**Video:**
- `assets/videos/background.mp4` — Cinematic background video for the movie screen

**Music:**
- `assets/music/background.mp3` — Background music that starts after unlocking

### 2. Customize Content

Edit `assets/data/memories.json` to personalize:
- Timeline events (dates, titles, descriptions)
- 21 reasons you love them
- The love letter text
- Your name/signature

### 3. Customize the Passcode

In `script.js`, change the `correctPasscode` array:
```js
this.correctPasscode = ['0','1','0','7','0','5']; // Change to your date
```

### 4. Deploy

**GitHub Pages:**
1. Push this folder to a GitHub repository
2. Go to Settings → Pages
3. Select the branch and root folder
4. Your site will be live at `https://<username>.github.io/<repository>/`

**Any Static Host:**
Simply upload the entire `for-beavel/` folder to any static web host.

## 🔧 Customization

### Changing Colors
Edit the CSS variables in `style.css`:
```css
:root {
  --burgundy: #4a0015;
  --crimson: #8b001a;
  --rose: #e8a0b4;
  --gold: #c9a84c;
  /* ... */
}
```

### Changing Animations
All GSAP timelines are in `script.js`. Each screen has its own animation method.

## 🎨 Design Notes

- Uses Apple-inspired glassmorphism, smooth gradients, and cinematic transitions
- All animations are powered by GSAP for maximum smoothness
- Particle systems use Three.js for interactive backgrounds
- Typography uses Google Fonts: Playfair Display, Cormorant Garamond, Dancing Script, Great Vibes

## 💻 Browser Support

- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers with touch support
- Fullscreen mode available on supported browsers

## 📝 License

Free for personal use. Made with love.

---

*"If I had a thousand lifetimes, I'd still look for you in every one."*
