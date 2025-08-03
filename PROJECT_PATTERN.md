# Hebrew Games Collection - Project Pattern

## Project Structure Pattern

### Overview
This project follows a **single-file architecture** pattern where each game is a self-contained HTML file with embedded CSS and JavaScript. This approach ensures:
- Zero build dependencies
- Easy deployment
- Simple maintenance
- Fast loading times
- Offline capability

## File Structure Pattern

```
project-root/
├── index.html                 # Main landing page
├── [game-name]-game.html     # Individual game files
├── [game-name]-game-he.html  # Hebrew versions (when applicable)
├── package.json               # Simple npm scripts
├── vercel.json               # Deployment configuration
├── CLAUDE.md                 # AI assistant documentation
└── PROJECT_PATTERN.md        # This file
```

## HTML Game Template Pattern

```html
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>[Game Name] - [Description]</title>
    <style>
        /* Reset and Base Styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #[color1] 0%, #[color2] 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 10px;
        }

        /* Game Container Pattern */
        .game-container {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            padding: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            max-width: [max-width];
            width: 100%;
        }

        /* Mobile Responsive Pattern */
        @media (max-width: 768px) {
            /* Mobile optimizations */
        }

        @media (max-width: 400px) {
            /* Small phone optimizations */
        }
    </style>
</head>
<body>
    <div class="game-container">
        <!-- Game content -->
    </div>

    <script>
        // Game state pattern
        let gameState = {
            active: false,
            score: 0,
            level: 1,
            // ... other state variables
        };

        // Sound system pattern
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        function playSound(frequency, duration, type = 'sine') {
            // Standard sound generation
        }

        // Touch event handling pattern
        let lastTouchTime = 0;
        function handleTouch(event) {
            if (event && event.type === 'touchstart') {
                const currentTime = new Date().getTime();
                if (currentTime - lastTouchTime < 300) return;
                lastTouchTime = currentTime;
                event.preventDefault();
            }
            // Handle action
        }

        // Game initialization
        function initGame() {
            // Setup code
        }

        // Game loop/update pattern
        function updateGame() {
            // Game logic
        }

        // Start on load
        initGame();
    </script>
</body>
</html>
```

## Common CSS Patterns

### 1. Gradient Backgrounds
```css
background: linear-gradient(135deg, #color1 0%, #color2 100%);
```

### 2. Card-Based UI
```css
.card {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 20px;
    padding: 20px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    transition: all 0.3s ease;
}

.card:hover {
    transform: translateY(-5px);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
}
```

### 3. Responsive Grid Layout
```css
.game-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min-width, 1fr));
    gap: 15px;
}
```

### 4. Mobile-First Responsive Design
```css
/* Mobile base styles */
.element {
    font-size: clamp(0.8rem, 2vw, 1.2rem);
    padding: clamp(10px, 2vw, 20px);
}

/* Tablet and up */
@media (min-width: 768px) {
    .element {
        /* Enhanced styles */
    }
}
```

## JavaScript Patterns

### 1. Game State Management
```javascript
const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameOver'
};

let currentState = GameState.MENU;
```

### 2. Sound System Pattern
```javascript
class SoundManager {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    playTone(frequency, duration = 0.2, type = 'sine') {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = type;
        oscillator.frequency.value = frequency;
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    playSuccess() {
        [523, 659, 784, 1047].forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.2), i * 100);
        });
    }

    playError() {
        this.playTone(200, 0.5, 'sawtooth');
    }
}
```

### 3. Touch/Click Handler Pattern
```javascript
function addInteraction(element, callback) {
    let lastInteraction = 0;
    
    const handler = (event) => {
        const now = Date.now();
        if (now - lastInteraction < 300) return;
        lastInteraction = now;
        
        if (event.type === 'touchstart') {
            event.preventDefault();
        }
        
        callback(event);
    };
    
    element.addEventListener('click', handler);
    element.addEventListener('touchstart', handler);
}
```

### 4. Animation Pattern
```javascript
async function animateSequence(elements, className, delay = 300) {
    for (const element of elements) {
        element.classList.add(className);
        await new Promise(resolve => setTimeout(resolve, delay));
    }
}
```

### 5. Local Storage Pattern
```javascript
class GameStorage {
    constructor(gameId) {
        this.prefix = `game_${gameId}_`;
    }

    save(key, value) {
        localStorage.setItem(this.prefix + key, JSON.stringify(value));
    }

    load(key, defaultValue = null) {
        const item = localStorage.getItem(this.prefix + key);
        return item ? JSON.parse(item) : defaultValue;
    }

    getHighScore() {
        return this.load('highScore', 0);
    }

    setHighScore(score) {
        const current = this.getHighScore();
        if (score > current) {
            this.save('highScore', score);
            return true;
        }
        return false;
    }
}
```

## Mobile Optimization Patterns

### 1. Viewport Configuration
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

### 2. Touch-Friendly Buttons
```css
.button {
    min-height: 44px;  /* iOS touch target minimum */
    min-width: 44px;
    padding: 12px 24px;
    font-size: 16px;   /* Prevents zoom on iOS */
}
```

### 3. Responsive Board/Grid
```css
.game-board {
    width: calc(100vw - 40px);
    max-width: 500px;
    aspect-ratio: 1;
    margin: 0 auto;
}
```

## Common Game Components

### 1. Score Display
```html
<div class="stats-panel">
    <div class="stat-box">
        <h3>ניקוד</h3>
        <p id="score">0</p>
    </div>
    <div class="stat-box">
        <h3>שלב</h3>
        <p id="level">1</p>
    </div>
    <div class="stat-box">
        <h3>שיא</h3>
        <p id="highScore">0</p>
    </div>
</div>
```

### 2. Back Button
```html
<div class="back-button">
    <button onclick="window.location.href='index.html'">🏠 חזרה לדף הראשי</button>
</div>
```

### 3. Message Display
```javascript
function showMessage(text, type = 'info', duration = 3000) {
    const message = document.getElementById('message');
    message.textContent = text;
    message.className = `message ${type} show`;
    
    setTimeout(() => {
        message.classList.remove('show');
    }, duration);
}
```

## Deployment Pattern

### Vercel Configuration
```json
{
  "buildCommand": "echo 'No build required'",
  "outputDirectory": ".",
  "framework": null,
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        }
      ]
    }
  ]
}
```

### Package.json Scripts
```json
{
  "scripts": {
    "dev": "python3 -m http.server 8000",
    "build": "echo 'No build required for static HTML'"
  }
}
```

## Adding New Games

1. **Copy Template**: Start with the HTML template pattern above
2. **Customize Styling**: Adjust colors and layout for game theme
3. **Implement Logic**: Add game-specific JavaScript
4. **Test Responsive**: Ensure mobile compatibility
5. **Add to Index**: Update index.html with new game card
6. **Update Documentation**: Add to CLAUDE.md file list

## Best Practices

1. **Keep It Simple**: Single file per game, no external dependencies
2. **Mobile First**: Design for mobile, enhance for desktop
3. **Hebrew/RTL Support**: Use `dir="rtl"` and appropriate styling
4. **Performance**: Minimize DOM manipulation, use CSS animations
5. **Accessibility**: Proper touch targets, readable fonts, color contrast
6. **Sound Feedback**: Audio cues for actions (optional, non-intrusive)
7. **Visual Feedback**: Animations and transitions for user actions
8. **Error Handling**: Graceful degradation, clear error messages
9. **Progress Saving**: Use localStorage for scores and progress
10. **Cross-Browser**: Test on multiple browsers and devices

## Common Issues and Solutions

### Issue: Board not fitting on mobile
```css
/* Solution: Use viewport-relative units with max constraints */
.board {
    width: calc(100vw - 30px);
    max-width: 500px;
    aspect-ratio: 1;
}
```

### Issue: Double-firing touch events
```javascript
// Solution: Debounce and prevent default
let lastTouch = 0;
element.ontouchstart = (e) => {
    const now = Date.now();
    if (now - lastTouch < 300) return;
    lastTouch = now;
    e.preventDefault();
    handleAction();
};
```

### Issue: Text too small on mobile
```css
/* Solution: Use clamp for responsive sizing */
font-size: clamp(0.8rem, 2vw, 1.2rem);
```

## Resources and Tools

- **Colors**: Use gradient generators for consistent styling
- **Icons**: Emoji for simple, universal icons
- **Testing**: Chrome DevTools device emulation
- **Deployment**: Vercel for instant deployment
- **Version Control**: Git for tracking changes

---

This pattern document serves as a blueprint for maintaining consistency across the game collection and making it easy to add new games following the established patterns.