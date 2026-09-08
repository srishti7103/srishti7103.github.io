# 🪄 A Hogwarts Journey — Interactive Wizarding Experience

An immersive, multi-scene interactive web application engineered with modular vanilla ES6, CSS3 3D transforms, HTML5 Canvas particle systems, and the Web Audio API — accompanied by a modern React component architecture.

---

## 🏛️ Software Architecture & Separation of Concerns

This project is organized into clean, maintainable, and decoupled modules:

```
showcase/hogwarts/
├── index.html                  # Lightweight semantic HTML entry point
├── package.json                # Modern package configuration & build scripts
├── css/
│   └── style.css               # Modular design system, parchment typography & CSS3 keyframes
├── js/
│   ├── letters-data.js         # Sanitized lore-accurate wizarding mail store
│   └── main.js                 # Multi-scene state machine & canvas physics engine
├── src/                        # Modern React architecture implementation
│   ├── App.jsx                 # React root application wrapper
│   └── components/
│       └── HogwartsExperience.jsx # Full state-driven React component with hooks & refs
├── assets/                     # Audio theme (assets/theme.mp3) and background textures
└── images/                     # Sanitized wizarding SVG tarot & portrait cards
```

---

## ⚡ Engineering Highlights & Concepts Demonstrated

1. **State-Driven Multi-Scene Engine**:
   - Manages state transitions across distinct interactive scenes: *Platform 9¾*, *Cinematic Train*, *The Marauder's Map*, *The Owlery*, *Moving Staircase Memory Reel*, and *The Room of Requirement*.
2. **HTML5 Canvas Particle Physics**:
   - Real-time wand cursor sparkler follower with velocity damping and alpha decay.
   - Ambient floating golden embers with randomized sinusoidal drift.
3. **Responsive CSS3 Design Tokens**:
   - Vintage parchment textures, dynamic ink-bleed filters, and smooth 3D perspective flips.
4. **Web Audio Integration**:
   - Autoplay handling respecting modern browser interaction policies with ambient volume attenuation.
5. **Modern React Implementation (`src/components/HogwartsExperience.jsx`)**:
   - Shows how the state machine, canvas refs, audio context, and letter modals translate cleanly into modern React functional component design with `useState`, `useEffect`, and `useRef`.

---

## 🤖 AI-Assisted Craftsmanship ("Vibecoding")

> *"True engineering productivity in the AI era comes from possessing deep, fundamental software concepts (DOM lifecycles, event loops, canvas rendering, modular design, separation of concerns) and leveraging AI assistance to execute and iterate 10x faster."*

This showcase illustrates how rapid AI pair-programming enables complex, highly polished interactive web applications to be architected and deployed without technical debt or bloated dependencies.

---

## 🚀 Running the Showcase

### 1. Zero-Build Static Preview (GitHub Pages Native)
Open `index.html` directly in any modern browser, or serve via:
```bash
python -m http.server 8080
```
Navigate to `http://localhost:8080/showcase/hogwarts/index.html`.

### 2. React / Vite Development
```bash
npm install
npm run dev
```

---

*Crafted by Srishti Lamba — M.Sc. Data Science @ DA-IICT.*
