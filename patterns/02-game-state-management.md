# Game State Management Pattern

## Overview
Centralized state management for game variables and progression tracking.

## Implementation

```javascript
// Game State Object
const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameOver',
    WIN: 'win'
};

// State Variables
let gameData = {
    // Core state
    currentState: GameState.MENU,
    isActive: false,
    isPaused: false,
    
    // Player data
    score: 0,
    level: 1,
    lives: 3,
    streak: 0,
    highScore: 0,
    
    // Game specific
    currentRound: 0,
    difficulty: 'normal',
    timeLeft: 0,
    
    // Settings
    soundEnabled: true,
    hints: 3
};

// State Management Functions
function initGameState() {
    gameData = {
        currentState: GameState.MENU,
        isActive: false,
        score: 0,
        level: 1,
        lives: 3,
        // ... reset all values
    };
    loadHighScore();
    updateDisplay();
}

function setState(newState) {
    const oldState = gameData.currentState;
    gameData.currentState = newState;
    onStateChange(oldState, newState);
}

function onStateChange(oldState, newState) {
    switch(newState) {
        case GameState.PLAYING:
            startGameLoop();
            break;
        case GameState.PAUSED:
            pauseGameLoop();
            break;
        case GameState.GAME_OVER:
            endGame();
            break;
    }
}

// Score Management
function updateScore(points) {
    gameData.score += points;
    if (gameData.score > gameData.highScore) {
        gameData.highScore = gameData.score;
        saveHighScore();
    }
    updateDisplay();
}

// Level Progression
function checkLevelProgression() {
    const pointsNeeded = gameData.level * 100;
    if (gameData.score >= pointsNeeded) {
        levelUp();
    }
}

function levelUp() {
    gameData.level++;
    showMessage(`Level ${gameData.level}!`);
    increaseDifficulty();
}
```

## LocalStorage Integration

```javascript
// Save/Load Functions
function saveGameState() {
    const saveData = {
        score: gameData.score,
        level: gameData.level,
        highScore: gameData.highScore,
        // ... other persistent data
    };
    localStorage.setItem('gameState', JSON.stringify(saveData));
}

function loadGameState() {
    const saved = localStorage.getItem('gameState');
    if (saved) {
        const data = JSON.parse(saved);
        Object.assign(gameData, data);
    }
}

function saveHighScore() {
    localStorage.setItem('highScore', gameData.highScore);
}

function loadHighScore() {
    gameData.highScore = parseInt(localStorage.getItem('highScore') || '0');
}
```

## Display Updates

```javascript
function updateDisplay() {
    // Update all UI elements
    document.getElementById('score').textContent = gameData.score;
    document.getElementById('level').textContent = gameData.level;
    document.getElementById('lives').textContent = '❤️'.repeat(gameData.lives);
    document.getElementById('highScore').textContent = gameData.highScore;
}

// Reactive Updates
function watchValue(property, callback) {
    let value = gameData[property];
    Object.defineProperty(gameData, property, {
        get() { return value; },
        set(newValue) {
            const oldValue = value;
            value = newValue;
            callback(newValue, oldValue);
        }
    });
}

// Usage
watchValue('score', (newScore, oldScore) => {
    document.getElementById('score').textContent = newScore;
    if (newScore > oldScore) {
        animateScore();
    }
});
```

## Best Practices
1. Keep state in a single object
2. Use constants for state names
3. Always validate state transitions
4. Save critical data to localStorage
5. Separate display logic from state logic
6. Use getter/setter for reactive updates

## Used In
- All game files
- Essential for: puzzle-slider-game.html, snakes-and-ladders-game.html