# UI Components Pattern

## Overview
Reusable UI component patterns for consistent game interfaces.

## Navigation Components

### Back Button
```html
<div class="back-button">
    <button onclick="window.location.href = '../index.html'">
        🏠 חזרה לדף הראשי
    </button>
</div>
```

```css
.back-button {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
}

.back-button button {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 12px 25px;
    border-radius: 50px;
    font-size: 1.1em;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    transition: all 0.3s ease;
}

.back-button button:hover {
    transform: scale(1.05);
    box-shadow: 0 7px 20px rgba(0, 0, 0, 0.4);
}
```

## Stats Display Components

### Stats Panel
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
        <h3>חיים</h3>
        <p id="lives">❤️❤️❤️</p>
    </div>
</div>
```

```css
.stats-panel {
    display: flex;
    justify-content: space-around;
    margin-bottom: 30px;
    gap: 15px;
    flex-wrap: wrap;
}

.stat-box {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    color: white;
    padding: 15px 20px;
    border-radius: 15px;
    text-align: center;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    flex: 1;
    min-width: 100px;
    transition: transform 0.3s ease;
}

.stat-box:hover {
    transform: translateY(-2px);
}

.stat-box h3 {
    font-size: 0.9em;
    margin-bottom: 5px;
    opacity: 0.9;
}

.stat-box p {
    font-size: 1.8em;
    font-weight: bold;
}

/* Animated stat update */
.stat-box.updated {
    animation: statPulse 0.5s ease;
}

@keyframes statPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
}
```

## Message System

### Message Display
```html
<div class="message" id="message"></div>
```

```css
.message {
    text-align: center;
    font-size: 1.3em;
    font-weight: bold;
    padding: 20px;
    border-radius: 15px;
    margin-top: 20px;
    display: none;
    animation: slideIn 0.5s ease;
}

.message.show {
    display: block;
}

.message.success {
    background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
    color: white;
}

.message.error {
    background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
    color: white;
}

.message.info {
    background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
    color: white;
}

.message.warning {
    background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
    color: white;
}
```

```javascript
// Message Manager
class MessageManager {
    constructor(elementId = 'message') {
        this.element = document.getElementById(elementId);
        this.queue = [];
        this.isShowing = false;
    }
    
    show(text, type = 'info', duration = 3000) {
        this.queue.push({ text, type, duration });
        this.processQueue();
    }
    
    async processQueue() {
        if (this.isShowing || this.queue.length === 0) return;
        
        this.isShowing = true;
        const { text, type, duration } = this.queue.shift();
        
        this.element.textContent = text;
        this.element.className = `message ${type} show`;
        
        await new Promise(resolve => setTimeout(resolve, duration));
        
        this.element.classList.remove('show');
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        this.isShowing = false;
        this.processQueue();
    }
    
    clear() {
        this.queue = [];
        this.element.className = 'message';
    }
}

const messages = new MessageManager();
```

## Modal/Dialog Components

### Game Over Modal
```html
<div class="modal" id="gameOverModal">
    <div class="modal-content">
        <h2>Game Over!</h2>
        <p class="modal-score">Final Score: <span id="finalScore">0</span></p>
        <p class="modal-highscore">High Score: <span id="highScore">0</span></p>
        <div class="modal-buttons">
            <button class="btn-primary" onclick="restartGame()">Play Again</button>
            <button class="btn-secondary" onclick="returnToMenu()">Menu</button>
        </div>
    </div>
</div>
```

```css
.modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    z-index: 2000;
    justify-content: center;
    align-items: center;
}

.modal.show {
    display: flex;
    animation: fadeIn 0.3s ease;
}

.modal-content {
    background: white;
    border-radius: 20px;
    padding: 30px;
    max-width: 400px;
    width: 90%;
    text-align: center;
    animation: slideUp 0.3s ease;
}

@keyframes slideUp {
    from { transform: translateY(50px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

.modal-buttons {
    display: flex;
    gap: 15px;
    margin-top: 20px;
    justify-content: center;
}
```

## Button Components

### Category Selector
```html
<div class="category-selector">
    <button class="category-btn active" data-category="easy">קל</button>
    <button class="category-btn" data-category="medium">בינוני</button>
    <button class="category-btn" data-category="hard">קשה</button>
</div>
```

```javascript
// Category Manager
class CategorySelector {
    constructor(containerSelector, onChange) {
        this.container = document.querySelector(containerSelector);
        this.onChange = onChange;
        this.current = null;
        this.init();
    }
    
    init() {
        this.container.addEventListener('click', (e) => {
            if (e.target.classList.contains('category-btn')) {
                this.select(e.target.dataset.category);
            }
        });
        
        // Set initial
        const active = this.container.querySelector('.active');
        if (active) {
            this.current = active.dataset.category;
        }
    }
    
    select(category) {
        if (this.current === category) return;
        
        // Update UI
        this.container.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });
        
        this.current = category;
        this.onChange(category);
    }
}
```

## Progress Indicators

### Progress Bar
```html
<div class="progress-bar">
    <div class="progress-fill" id="progress"></div>
    <div class="progress-text">Level 1 - 0%</div>
</div>
```

```css
.progress-bar {
    position: relative;
    width: 100%;
    height: 30px;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 15px;
    overflow: hidden;
    margin: 20px 0;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #2ecc71, #3498db);
    width: 0%;
    transition: width 0.3s ease;
    border-radius: 15px;
}

.progress-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-weight: bold;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}
```

### Loading Spinner
```html
<div class="loader">
    <div class="spinner"></div>
    <p>Loading...</p>
</div>
```

```css
.loader {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 3000;
}

.spinner {
    width: 50px;
    height: 50px;
    border: 5px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
```

## Achievement Notifications

```html
<div class="achievement" id="achievement">
    <div class="achievement-icon">🏆</div>
    <div class="achievement-text">
        <h4>Achievement Unlocked!</h4>
        <p>First Victory</p>
    </div>
</div>
```

```css
.achievement {
    position: fixed;
    top: -100px;
    right: 20px;
    background: linear-gradient(135deg, #f39c12 0%, #f1c40f 100%);
    color: white;
    padding: 20px;
    border-radius: 15px;
    display: flex;
    align-items: center;
    gap: 15px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    transition: top 0.5s ease;
    z-index: 2000;
}

.achievement.show {
    top: 20px;
}

.achievement-icon {
    font-size: 2em;
}
```

## Best Practices
1. Keep components modular and reusable
2. Use semantic HTML structure
3. Implement proper ARIA labels for accessibility
4. Use CSS custom properties for theming
5. Provide JavaScript APIs for dynamic updates
6. Ensure mobile responsiveness
7. Add loading states for async operations
8. Include animation options for feedback

## Used In
- All game files use various UI components
- Stats panels: All games
- Messages: All games for feedback
- Modals: Games with game over screens