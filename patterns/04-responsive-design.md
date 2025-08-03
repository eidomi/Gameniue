# Responsive Design Pattern

## Overview
Mobile-first responsive design patterns for game interfaces that work across all devices.

## Base Structure

```html
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Game Title</title>
</head>
```

## CSS Patterns

### Container Pattern
```css
/* Mobile-first container */
.game-container {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 20px;
    padding: 15px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    width: 100%;
    max-width: 700px;
    margin: 0 auto;
}

/* Tablet and up */
@media (min-width: 768px) {
    .game-container {
        padding: 30px;
    }
}

/* Desktop */
@media (min-width: 1024px) {
    .game-container {
        padding: 40px;
        max-width: 900px;
    }
}
```

### Game Board Pattern
```css
/* Responsive game board */
.game-board {
    display: grid;
    width: 100%;
    max-width: min(90vw, 500px);
    aspect-ratio: 1;
    margin: 0 auto;
    gap: 2px;
}

/* Dynamic grid sizing */
.game-board {
    grid-template-columns: repeat(var(--grid-size, 4), 1fr);
}

/* Mobile adjustments */
@media (max-width: 480px) {
    .game-board {
        max-width: calc(100vw - 40px);
        gap: 1px;
    }
}
```

### Typography Scaling
```css
/* Fluid typography using clamp */
h1 {
    font-size: clamp(1.5rem, 5vw, 2.5rem);
    margin-bottom: clamp(15px, 3vw, 30px);
}

p {
    font-size: clamp(0.875rem, 2vw, 1.125rem);
    line-height: 1.6;
}

.button {
    font-size: clamp(0.9rem, 2vw, 1.1rem);
    padding: clamp(10px, 2vw, 15px) clamp(20px, 4vw, 30px);
}
```

### Touch-Friendly Buttons
```css
/* Minimum touch target size (44x44px iOS standard) */
.touch-button {
    min-height: 44px;
    min-width: 44px;
    padding: 12px 24px;
    border-radius: 50px;
    font-size: 16px; /* Prevents zoom on iOS */
    touch-action: manipulation; /* Faster touch response */
    user-select: none;
    -webkit-tap-highlight-color: transparent;
}

/* Button grid for mobile */
.button-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 10px;
}

@media (max-width: 480px) {
    .button-grid {
        grid-template-columns: 1fr;
    }
}
```

## JavaScript Patterns

### Touch Event Handling
```javascript
// Unified touch/click handler
function addInteraction(element, callback) {
    let isTouch = false;
    let lastTouchTime = 0;
    
    // Prevent double-firing
    const handleInteraction = (e) => {
        const now = Date.now();
        
        if (e.type === 'touchstart') {
            isTouch = true;
            if (now - lastTouchTime < 300) return;
            lastTouchTime = now;
            e.preventDefault();
        } else if (e.type === 'click' && isTouch) {
            return; // Ignore click after touch
        }
        
        callback(e);
    };
    
    element.addEventListener('touchstart', handleInteraction, { passive: false });
    element.addEventListener('click', handleInteraction);
}
```

### Viewport Detection
```javascript
// Responsive breakpoint detection
const ViewportManager = {
    isMobile() {
        return window.innerWidth <= 768;
    },
    
    isTablet() {
        return window.innerWidth > 768 && window.innerWidth <= 1024;
    },
    
    isDesktop() {
        return window.innerWidth > 1024;
    },
    
    getOrientation() {
        return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    },
    
    // Adjust game based on viewport
    adjustGameLayout() {
        const board = document.querySelector('.game-board');
        if (this.isMobile()) {
            board.style.setProperty('--grid-size', '8');
        } else {
            board.style.setProperty('--grid-size', '10');
        }
    },
    
    // Listen for changes
    init() {
        window.addEventListener('resize', () => this.adjustGameLayout());
        window.addEventListener('orientationchange', () => this.adjustGameLayout());
        this.adjustGameLayout();
    }
};
```

### Dynamic Sizing
```javascript
// Calculate optimal size based on viewport
function calculateOptimalSize(baseSize, minSize, maxSize) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const vmin = Math.min(vw, vh);
    
    // Use smaller dimension for square elements
    let size = vmin * 0.8; // 80% of viewport minimum
    
    // Apply constraints
    size = Math.max(minSize, Math.min(size, maxSize));
    
    return Math.floor(size);
}

// Apply to game board
const boardSize = calculateOptimalSize(500, 280, 600);
document.querySelector('.game-board').style.width = `${boardSize}px`;
document.querySelector('.game-board').style.height = `${boardSize}px`;
```

## Layout Patterns

### Flexible Stats Display
```css
.stats-panel {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
    margin-bottom: 20px;
}

.stat-box {
    flex: 1 1 100px;
    min-width: 80px;
    max-width: 150px;
    padding: 10px;
    text-align: center;
}

@media (max-width: 480px) {
    .stats-panel {
        justify-content: space-between;
    }
    
    .stat-box {
        flex: 1 1 30%;
    }
}
```

### Responsive Grid Games
```css
/* Card grid for memory games */
.card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
    gap: 10px;
    max-width: 500px;
    margin: 0 auto;
}

@media (min-width: 480px) {
    .card-grid {
        grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
    }
}

.card {
    aspect-ratio: 1;
    min-height: 60px;
}
```

## Performance Optimizations

```css
/* Optimize animations for mobile */
@media (max-width: 768px) {
    * {
        animation-duration: 0.3s !important; /* Faster animations */
    }
    
    /* Disable hover effects on touch devices */
    @media (hover: none) {
        .button:hover {
            transform: none;
        }
    }
}

/* Use GPU acceleration */
.animated-element {
    will-change: transform;
    transform: translateZ(0);
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
    * {
        animation: none !important;
        transition: none !important;
    }
}
```

## Best Practices
1. Mobile-first approach (min-width media queries)
2. Use relative units (rem, em, %, vw/vh)
3. Fluid typography with clamp()
4. Touch targets minimum 44x44px
5. Prevent double-tap zoom with proper viewport
6. Test on real devices, not just browser DevTools
7. Consider landscape orientation on mobile
8. Optimize animations for mobile performance

## Used In
- All game files
- Critical for: snakes-and-ladders-game.html, memory-match-game.html