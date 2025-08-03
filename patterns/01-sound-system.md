# Sound System Pattern

## Overview
Procedural sound generation using Web Audio API for game audio feedback without external files.

## Implementation

```javascript
// Initialize Audio Context
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Base Sound Function
function playSound(frequency, duration = 0.2, type = 'sine') {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

// Common Sound Effects
function playClickSound() {
    playSound(600, 0.1);
}

function playCorrectSound() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((note, i) => {
        setTimeout(() => playSound(note, 0.2), i * 100);
    });
}

function playWrongSound() {
    playSound(200, 0.5, 'sawtooth');
}

function playLevelUpSound() {
    const notes = [523, 587, 659, 784, 880, 1047];
    notes.forEach((note, i) => {
        setTimeout(() => playSound(note, 0.15), i * 50);
    });
}

function playGameOverSound() {
    for (let i = 0; i < 3; i++) {
        setTimeout(() => playSound(400 - i * 100, 0.3, 'triangle'), i * 200);
    }
}
```

## Usage Examples

### Button Click
```javascript
button.addEventListener('click', () => {
    playClickSound();
    // Button action
});
```

### Game Events
```javascript
if (answer === correct) {
    playCorrectSound();
} else {
    playWrongSound();
}
```

## Variations

### Sequential Notes
```javascript
function playMelody(notes, interval = 100) {
    notes.forEach((note, i) => {
        setTimeout(() => playSound(note, 0.2), i * interval);
    });
}
```

### Sound with Variation
```javascript
function playRandomClick() {
    const baseFreq = 500;
    const variation = Math.random() * 200;
    playSound(baseFreq + variation, 0.1);
}
```

## Best Practices
1. Initialize AudioContext once globally
2. Keep durations short (< 0.5s) for UI feedback
3. Use different waveform types for variety
4. Add slight delays between sequential sounds
5. Consider user volume preferences

## Used In
- All game files
- Particularly: simon-says-game.html, pattern-memory-game.html