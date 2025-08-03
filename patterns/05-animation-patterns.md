# Animation Patterns

## Overview
Performant and engaging animation patterns for game interactions and feedback.

## CSS Animations

### Basic Animations
```css
/* Pulse Animation */
@keyframes pulse {
    0%, 100% { 
        transform: scale(1); 
        opacity: 1;
    }
    50% { 
        transform: scale(1.05); 
        opacity: 0.8;
    }
}

/* Shake Animation (for errors) */
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    75% { transform: translateX(10px); }
}

/* Bounce Animation */
@keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
}

/* Fade In/Out */
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeOut {
    from { opacity: 1; transform: translateY(0); }
    to { opacity: 0; transform: translateY(20px); }
}

/* Spin Animation */
@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

/* Slide Animations */
@keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes slideInUp {
    from { transform: translateY(100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}
```

### Card Flip Animation
```css
/* 3D Card Flip */
.card-container {
    perspective: 1000px;
}

.card {
    position: relative;
    transform-style: preserve-3d;
    transition: transform 0.6s;
}

.card.flipped {
    transform: rotateY(180deg);
}

.card-front,
.card-back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
}

.card-back {
    transform: rotateY(180deg);
}
```

### Success Animation
```css
@keyframes successPulse {
    0% { 
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(46, 204, 113, 0.7);
    }
    50% {
        transform: scale(1.05);
        box-shadow: 0 0 0 20px rgba(46, 204, 113, 0);
    }
    100% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(46, 204, 113, 0);
    }
}

.success {
    animation: successPulse 0.6s ease;
}
```

## JavaScript Animation Control

### Animation Manager
```javascript
class AnimationManager {
    constructor() {
        this.animations = new Map();
        this.reducedMotion = this.checkReducedMotion();
    }
    
    checkReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    
    // Add animation to element
    animate(element, animationName, duration = 500, options = {}) {
        if (this.reducedMotion && !options.essential) {
            return Promise.resolve();
        }
        
        return new Promise((resolve) => {
            // Remove any existing animation
            this.stopAnimation(element);
            
            // Apply animation class
            element.style.animation = `${animationName} ${duration}ms ${options.easing || 'ease'}`;
            
            if (options.className) {
                element.classList.add(options.className);
            }
            
            // Store animation
            const animationEnd = () => {
                element.style.animation = '';
                if (options.className) {
                    element.classList.remove(options.className);
                }
                this.animations.delete(element);
                resolve();
            };
            
            this.animations.set(element, animationEnd);
            setTimeout(animationEnd, duration);
        });
    }
    
    // Stop animation
    stopAnimation(element) {
        if (this.animations.has(element)) {
            const cleanup = this.animations.get(element);
            cleanup();
        }
    }
    
    // Chain animations
    async sequence(animations) {
        for (const {element, animation, duration, options} of animations) {
            await this.animate(element, animation, duration, options);
        }
    }
    
    // Parallel animations
    parallel(animations) {
        return Promise.all(
            animations.map(({element, animation, duration, options}) =>
                this.animate(element, animation, duration, options)
            )
        );
    }
}

const animator = new AnimationManager();
```

### Performant JavaScript Animations
```javascript
// RequestAnimationFrame based animation
class SmoothAnimator {
    constructor() {
        this.animations = [];
        this.running = false;
    }
    
    // Animate numeric value
    animateValue(from, to, duration, callback) {
        const start = performance.now();
        
        const animation = {
            update: (now) => {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function
                const eased = this.easeInOutCubic(progress);
                const current = from + (to - from) * eased;
                
                callback(current);
                
                return progress < 1;
            }
        };
        
        this.animations.push(animation);
        this.start();
        
        return animation;
    }
    
    // Animate element position
    animatePosition(element, fromX, fromY, toX, toY, duration) {
        return this.animateValue(0, 1, duration, (progress) => {
            const x = fromX + (toX - fromX) * progress;
            const y = fromY + (toY - fromY) * progress;
            element.style.transform = `translate(${x}px, ${y}px)`;
        });
    }
    
    // Easing functions
    easeInOutCubic(t) {
        return t < 0.5 
            ? 4 * t * t * t 
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    
    easeOutElastic(t) {
        if (t === 0 || t === 1) return t;
        const p = 0.3;
        return Math.pow(2, -10 * t) * Math.sin((t - p/4) * (2 * Math.PI) / p) + 1;
    }
    
    // Animation loop
    start() {
        if (this.running) return;
        this.running = true;
        this.tick();
    }
    
    tick() {
        const now = performance.now();
        
        this.animations = this.animations.filter(anim => anim.update(now));
        
        if (this.animations.length > 0) {
            requestAnimationFrame(() => this.tick());
        } else {
            this.running = false;
        }
    }
}
```

### Game-Specific Animations
```javascript
// Score counter animation
function animateScore(element, from, to, duration = 1000) {
    const startTime = Date.now();
    
    const update = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = Math.floor(from + (to - from) * progress);
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.classList.add('pulse');
            setTimeout(() => element.classList.remove('pulse'), 300);
        }
    };
    
    update();
}

// Card reveal animation
async function revealCards(cards) {
    for (let i = 0; i < cards.length; i++) {
        await new Promise(resolve => {
            setTimeout(() => {
                cards[i].classList.add('revealed');
                cards[i].style.animationDelay = `${i * 100}ms`;
                resolve();
            }, i * 100);
        });
    }
}

// Cascade animation
function cascadeAnimation(elements, className, delay = 50) {
    elements.forEach((element, index) => {
        setTimeout(() => {
            element.classList.add(className);
        }, index * delay);
    });
}
```

### Mobile-Optimized Animations
```javascript
// Reduce animations on mobile for performance
const AnimationConfig = {
    isMobile: window.innerWidth <= 768,
    
    getDuration(baseDuration) {
        return this.isMobile ? baseDuration * 0.7 : baseDuration;
    },
    
    shouldAnimate(priority = 'normal') {
        if (priority === 'essential') return true;
        if (this.isMobile && priority === 'low') return false;
        return true;
    },
    
    getAnimationClass(desktop, mobile) {
        return this.isMobile ? mobile : desktop;
    }
};

// Usage
if (AnimationConfig.shouldAnimate('low')) {
    element.style.animation = `fadeIn ${AnimationConfig.getDuration(500)}ms`;
}
```

## CSS Animation Utilities
```css
/* Animation utility classes */
.animate-pulse { animation: pulse 2s infinite; }
.animate-bounce { animation: bounce 1s infinite; }
.animate-shake { animation: shake 0.5s; }
.animate-spin { animation: spin 1s linear infinite; }
.animate-fadeIn { animation: fadeIn 0.5s; }

/* Animation delays */
.delay-100 { animation-delay: 100ms; }
.delay-200 { animation-delay: 200ms; }
.delay-300 { animation-delay: 300ms; }

/* Animation speeds */
.animate-fast { animation-duration: 0.3s; }
.animate-normal { animation-duration: 0.5s; }
.animate-slow { animation-duration: 1s; }

/* Disable animations conditionally */
.no-animation {
    animation: none !important;
    transition: none !important;
}
```

## Best Practices
1. Use CSS animations for simple effects
2. Use requestAnimationFrame for complex animations
3. Respect prefers-reduced-motion
4. Keep mobile animations shorter and simpler
5. Use transform and opacity for best performance
6. Avoid animating layout properties (width, height, top, left)
7. Use will-change sparingly
8. Clean up animations when done

## Used In
- memory-match-game.html (card flips)
- simon-says-game.html (button sequences)
- puzzle-slider-game.html (tile slides)
- pattern-memory-game.html (pattern reveals)