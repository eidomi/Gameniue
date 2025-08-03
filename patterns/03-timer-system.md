# Timer System Pattern

## Overview
Robust timer management for game countdowns, intervals, and time-based mechanics.

## Implementation

```javascript
// Timer Management
class GameTimer {
    constructor() {
        this.timers = new Map();
        this.intervals = new Map();
        this.paused = false;
        this.setupVisibilityHandling();
    }
    
    // Countdown Timer
    startCountdown(id, duration, onTick, onComplete) {
        this.clearTimer(id);
        
        let timeLeft = duration;
        const startTime = Date.now();
        
        const timer = setInterval(() => {
            if (!this.paused) {
                const elapsed = Math.floor((Date.now() - startTime) / 1000);
                timeLeft = Math.max(0, duration - elapsed);
                
                onTick(timeLeft);
                
                if (timeLeft <= 0) {
                    this.clearTimer(id);
                    onComplete();
                }
            }
        }, 100); // Update frequently for smooth display
        
        this.timers.set(id, timer);
        return timer;
    }
    
    // Repeating Interval
    setGameInterval(id, callback, interval) {
        this.clearInterval(id);
        
        const intervalId = setInterval(() => {
            if (!this.paused) {
                callback();
            }
        }, interval);
        
        this.intervals.set(id, intervalId);
        return intervalId;
    }
    
    // Clear Functions
    clearTimer(id) {
        if (this.timers.has(id)) {
            clearInterval(this.timers.get(id));
            this.timers.delete(id);
        }
    }
    
    clearInterval(id) {
        if (this.intervals.has(id)) {
            clearInterval(this.intervals.get(id));
            this.intervals.delete(id);
        }
    }
    
    clearAll() {
        this.timers.forEach(timer => clearInterval(timer));
        this.intervals.forEach(interval => clearInterval(interval));
        this.timers.clear();
        this.intervals.clear();
    }
    
    // Pause/Resume
    pause() {
        this.paused = true;
    }
    
    resume() {
        this.paused = false;
    }
    
    // Visibility Handling
    setupVisibilityHandling() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });
        
        window.addEventListener('beforeunload', () => {
            this.clearAll();
        });
    }
}

// Usage Instance
const gameTimer = new GameTimer();
```

## Visual Timer Display

```javascript
// Timer Bar Component
function createTimerBar(maxTime) {
    const html = `
        <div class="timer-container">
            <div class="timer-bar">
                <div class="timer-fill" id="timerFill"></div>
            </div>
            <div class="timer-text" id="timerText">${maxTime}</div>
        </div>
    `;
    
    return {
        update(timeLeft) {
            const percentage = (timeLeft / maxTime) * 100;
            const fill = document.getElementById('timerFill');
            const text = document.getElementById('timerText');
            
            fill.style.width = percentage + '%';
            text.textContent = timeLeft;
            
            // Visual warnings
            if (percentage < 20) {
                fill.style.background = '#e74c3c';
                fill.style.animation = 'pulse 1s infinite';
            } else if (percentage < 50) {
                fill.style.background = '#f39c12';
            } else {
                fill.style.background = '#2ecc71';
            }
            
            // Audio warning
            if (timeLeft === 5) {
                playWarningSound();
            }
        }
    };
}

// CSS for Timer Bar
const timerStyles = `
.timer-container {
    width: 100%;
    margin-bottom: 20px;
}

.timer-bar {
    width: 100%;
    height: 10px;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    overflow: hidden;
}

.timer-fill {
    height: 100%;
    background: linear-gradient(90deg, #2ecc71, #f39c12, #e74c3c);
    transition: width 0.3s linear;
}

.timer-text {
    text-align: center;
    font-size: 1.5em;
    font-weight: bold;
    margin-top: 10px;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}
`;
```

## Advanced Timer Patterns

```javascript
// Adaptive Timer (gets harder)
class AdaptiveTimer {
    constructor(baseTime) {
        this.baseTime = baseTime;
        this.level = 1;
    }
    
    getTimeForLevel() {
        // Reduce time as level increases
        const reduction = Math.min(this.level * 2, this.baseTime * 0.5);
        return Math.max(this.baseTime - reduction, 10); // Min 10 seconds
    }
    
    start(onComplete) {
        const time = this.getTimeForLevel();
        gameTimer.startCountdown('main', time, 
            (timeLeft) => this.updateDisplay(timeLeft),
            () => {
                onComplete();
                this.level++;
            }
        );
    }
}

// Bonus Time System
class BonusTimer {
    constructor() {
        this.bonusTime = 0;
    }
    
    addBonus(seconds) {
        this.bonusTime += seconds;
        this.showBonusAnimation(seconds);
    }
    
    showBonusAnimation(seconds) {
        const elem = document.createElement('div');
        elem.className = 'bonus-time';
        elem.textContent = `+${seconds}s`;
        document.body.appendChild(elem);
        
        setTimeout(() => elem.remove(), 2000);
    }
}
```

## Best Practices
1. Always clean up timers on page unload
2. Pause timers when page is hidden
3. Use Map for managing multiple timers
4. Update display frequently for smooth countdown
5. Add visual/audio warnings for low time
6. Consider network latency for multiplayer
7. Save timer state for resume functionality

## Used In
- word-scramble-game.html (countdown timer)
- simon-says-game.html (sequence display timer)
- pattern-memory-game.html (display duration)
- math-quiz-game.html (question timer)