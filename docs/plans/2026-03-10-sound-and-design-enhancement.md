# Sound & Visual Design Enhancement — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Modernize all 10 games with a unified CSS design system, enhanced Audio System v7.0 (ADSR envelopes, wavetables, algorithmic reverb), and rich micro-interactions/particle effects.

**Architecture:** Three-layer rollout. Layer 1 deploys CSS custom properties and glassmorphism across all games. Layer 2 replaces Audio System v6.0 with v7.0 (same API surface, richer sound engine). Layer 3 adds a lightweight inline particle system and micro-interactions. Each layer is independently testable and deployable.

**Tech Stack:** Vanilla HTML/CSS/JS, Web Audio API (AudioContext, OscillatorNode, GainNode, BiquadFilterNode, ConvolverNode, PeriodicWave), CSS custom properties, Canvas API for particles.

**Design Doc:** `docs/plans/2026-03-10-sound-and-design-enhancement-design.md`

---

## Game Files (10 total)

All in `/Users/yehudapro/Gameniue/games/`:
1. `color-match-game.html`
2. `hebrew-english-learning-game.html`
3. `math-quiz-game.html`
4. `memory-match-game.html`
5. `puzzle-slider-game.html`
6. `quick-draw-game.html`
7. `simon-says-game.html`
8. `snakes-and-ladders-game.html`
9. `tic-tac-toe-game.html`
10. `word-scramble-game.html`

## Test Infrastructure

- **Test runner:** `node scripts/test-incremental.js --all`
- **Pattern verify:** `node scripts/pattern-verify.js`
- **Audio check (tests/comprehensive-test-runner.js:205-217):** Looks for `'Audio System v6.0'` OR `'Audio Manager v6.0'` string and `'AudioManager'` class name
- **Pattern check (scripts/pattern-verify.js:33-36):** Looks for `'<!-- Audio System v6.0'` comment and `'window.audioManager'`
- **CRITICAL:** When upgrading to v7.0, tests and pattern-verify must be updated to accept BOTH v6.0 and v7.0 strings, or updated to v7.0

---

# LAYER 1: Unified Design System

## Task 1: Update test infrastructure to accept design system

**Files:**
- Modify: `tests/comprehensive-test-runner.js`

**Step 1: Add CSS variable detection test**

Add a new test function after the existing `checkAudioSystem` function (~line 217):

```javascript
function checkDesignSystem(gameContent) {
    const hasCSSVariables = gameContent.includes('--color-primary');
    const hasGlassmorphism = gameContent.includes('backdrop-filter');
    const hasGameGradient = gameContent.includes('--game-gradient');

    return {
        status: hasCSSVariables && hasGlassmorphism ? 'pass' : hasCSSVariables ? 'warning' : 'fail',
        score: (hasCSSVariables ? 50 : 0) + (hasGlassmorphism ? 50 : 0),
        message: `CSS Variables=${hasCSSVariables}, Glassmorphism=${hasGlassmorphism}, Game Theme=${hasGameGradient}`
    };
}
```

**Step 2: Wire the new test into the test runner**

Find the section where tests are registered (inside `runTests()`, after the sound tests are invoked) and add:

```javascript
// Design System Tests
gameResults.categories['Design System'] = {
    'CSS Variables': checkDesignSystem(gameContent)
};
```

**Step 3: Run tests to verify they fail for current games**

Run: `node scripts/test-incremental.js --clear-cache --all`
Expected: Design System tests should fail/warn (no CSS variables yet)

**Step 4: Commit**

```bash
git add tests/comprehensive-test-runner.js
git commit -m "test: add design system CSS variable detection tests"
```

---

## Task 2: Deploy CSS design tokens to math-quiz-game (pilot)

**Files:**
- Modify: `games/math-quiz-game.html` (CSS block, lines 7-802)

**Step 1: Add CSS custom properties block at the top of the `<style>` tag**

Insert immediately after line 7 (`<style>`), before any other CSS rules:

```css
/* === Design System v1.0 === */
:root {
    /* Color palette */
    --color-primary: #667eea;
    --color-primary-dark: #764ba2;
    --color-success: #2ecc71;
    --color-success-dark: #27ae60;
    --color-error: #e74c3c;
    --color-error-dark: #c0392b;
    --color-warning: #f9ca24;
    --color-warning-dark: #fdcb6e;
    --color-info: #3498db;
    --color-surface: #ffffff;
    --color-text: #2c3e50;
    --color-text-light: #7f8c8d;

    /* Game-specific theme */
    --game-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --game-accent: #667eea;

    /* Shadows (3-tier depth) */
    --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.1);
    --shadow-md: 0 8px 25px rgba(0, 0, 0, 0.15);
    --shadow-lg: 0 25px 50px rgba(0, 0, 0, 0.2);

    /* Radius progression */
    --radius-sm: 12px;
    --radius-md: 20px;
    --radius-lg: 30px;
    --radius-pill: 50px;

    /* Spacing scale */
    --space-xs: 4px;
    --space-sm: 8px;
    --space-md: 16px;
    --space-lg: 24px;
    --space-xl: 32px;

    /* Typography */
    --font-family: 'Arial', system-ui, sans-serif;
    --font-size-sm: 0.875rem;
    --font-size-md: 1rem;
    --font-size-lg: 1.25rem;
    --font-size-xl: 2rem;

    /* Transitions */
    --transition-fast: 0.15s ease;
    --transition-normal: 0.3s ease;
    --transition-slow: 0.5s ease;
}
```

**Step 2: Replace hardcoded values with CSS variables in the body and game-container rules**

Replace body background:
```css
/* Old */ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
/* New */ background: var(--game-gradient);
```

Replace game-container:
```css
/* Old */
.game-container {
    background: white;
    border-radius: 30px;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
    /* ... */
}
/* New */
.game-container {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    /* ... keep other existing properties */
}
```

Replace button colors, shadow, border-radius, and transition values throughout the CSS block using the variables. Key replacements:
- `border-radius: 50px` → `border-radius: var(--radius-pill)`
- `border-radius: 30px` → `border-radius: var(--radius-lg)`
- `border-radius: 20px` → `border-radius: var(--radius-md)`
- `transition: all 0.3s ease` → `transition: all var(--transition-normal)`
- `box-shadow: 0 5px 15px rgba(0,0,0,0.2)` → `box-shadow: var(--shadow-md)`
- `color: #2c3e50` → `color: var(--color-text)`
- `font-family: 'Arial', sans-serif` → `font-family: var(--font-family)`

**Step 3: Run tests**

Run: `rm .test-cache.json && node scripts/test-incremental.js --clear-cache --all`
Expected: All existing tests pass. Design System test passes for math-quiz-game.

**Step 4: Visually verify in browser**

Run: `npx http-server . -p 8000` and open `http://localhost:8000/games/math-quiz-game.html`
Verify: Glassmorphism container, same layout, smooth transitions.

**Step 5: Commit**

```bash
git add games/math-quiz-game.html
git commit -m "feat: deploy CSS design system v1.0 to math-quiz-game (pilot)"
```

---

## Task 3: Deploy CSS design system to remaining 9 games

**Files:**
- Modify: All other 9 game HTML files

**Step 1: For each game, add the `:root` design tokens block (same as Task 2 Step 1) but with game-specific gradient overrides:**

| Game | `--game-gradient` | `--game-accent` |
|------|-------------------|-----------------|
| color-match-game | `linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%)` | `#ff6b6b` |
| hebrew-english-learning-game | `linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)` | `#a8edea` |
| memory-match-game | `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` | `#667eea` |
| puzzle-slider-game | `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` | `#667eea` |
| quick-draw-game | `linear-gradient(135deg, #f093fb 0%, #f5576c 100%)` | `#f093fb` |
| simon-says-game | `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` | `#667eea` |
| snakes-and-ladders-game | `linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)` | `#1e3c72` |
| tic-tac-toe-game | `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` | `#667eea` |
| word-scramble-game | `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` | `#667eea` |

**Step 2: Apply glassmorphism to `.game-container` in each game (same pattern as Task 2 Step 2)**

**Step 3: Replace hardcoded border-radius, shadows, transitions, text colors, and font-family with CSS variables in each game (same mapping as Task 2 Step 2)**

**Step 4: Run tests**

Run: `rm .test-cache.json && node scripts/test-incremental.js --clear-cache --all`
Expected: 100% pass. All Design System tests pass.

**Step 5: Run pattern verify**

Run: `node scripts/pattern-verify.js`
Expected: All patterns detected, no regressions.

**Step 6: Commit**

```bash
git add games/*.html
git commit -m "feat: deploy CSS design system v1.0 to all 10 games"
```

---

## Task 4: Update pattern-verify for design system

**Files:**
- Modify: `scripts/pattern-verify.js`

**Step 1: Add design system pattern to the PATTERNS object (~line 20)**

After the existing patterns, add:

```javascript
designSystem: {
    name: 'Design System v1.0',
    roi: 500,
    searchPattern: '/* === Design System v1.0 === */',
    features: [
        '--color-primary',
        '--game-gradient',
        'backdrop-filter',
        '--radius-lg',
        '--shadow-lg'
    ],
    description: 'Unified CSS variables and glassmorphism'
},
```

**Step 2: Run pattern verify**

Run: `node scripts/pattern-verify.js`
Expected: Design System v1.0 shows 10/10 coverage.

**Step 3: Commit**

```bash
git add scripts/pattern-verify.js
git commit -m "feat: add design system v1.0 pattern to pattern-verify dashboard"
```

---

# LAYER 2: Audio System v7.0

## Task 5: Update test infrastructure to accept Audio v7.0

**Files:**
- Modify: `tests/comprehensive-test-runner.js` (~lines 205-217)
- Modify: `tests/run-tests.js` (~line 52)
- Modify: `scripts/pattern-verify.js` (~lines 33-36)

**Step 1: Update `checkAudioSystem` in `tests/comprehensive-test-runner.js`**

```javascript
function checkAudioSystem(gameContent) {
    const hasAudioManager = gameContent.includes('AudioManager') || gameContent.includes('audioManager');
    const hasAudioV7 = gameContent.includes('Audio System v7.0') || gameContent.includes('Audio Manager v7.0');
    const hasAudioV6 = gameContent.includes('Audio System v6.0') || gameContent.includes('Audio Manager v6.0');
    const hasAudio = hasAudioV7 || hasAudioV6;
    const hasErrorHandler = gameContent.includes('Error Handler v6.0');

    return {
        status: hasAudio ? 'pass' : hasAudioManager ? 'warning' : 'fail',
        score: hasAudioV7 ? 100 : hasAudioV6 ? 90 : hasAudioManager ? 50 : 0,
        message: `Audio v7.0=${hasAudioV7}, Audio v6.0=${hasAudioV6}, Error Handler=${hasErrorHandler}`,
        hasAudioV6: hasAudio,
        hasErrorHandler
    };
}
```

**Step 2: Update `tests/run-tests.js` (~line 52)**

```javascript
// Old
if (content.includes('Audio System v6.0') || content.includes('AudioManager')) {
    results.push({ test: 'Audio System', status: 'passed', message: 'Audio System v6.0 installed' });
// New
if (content.includes('Audio System v7.0') || content.includes('Audio System v6.0') || content.includes('AudioManager')) {
    results.push({ test: 'Audio System', status: 'passed', message: 'Audio System installed' });
```

**Step 3: Update `scripts/pattern-verify.js` audioSystem pattern (~line 33)**

```javascript
audioSystem: {
    name: 'Audio System',
    roi: 750,
    searchPattern: '<!-- Audio System v',
    features: [
        'window.audioManager',
        'playCorrectSound',
        'playWrongSound',
        'flashScreen'
    ],
    description: 'Accessible audio with visual fallback'
},
```

**Step 4: Run tests to verify everything still passes**

Run: `rm .test-cache.json && node scripts/test-incremental.js --clear-cache --all`
Expected: 100% pass (v6.0 still detected).

**Step 5: Commit**

```bash
git add tests/comprehensive-test-runner.js tests/run-tests.js scripts/pattern-verify.js
git commit -m "test: update audio system checks to accept both v6.0 and v7.0"
```

---

## Task 6: Create Audio System v7.0 (pilot on math-quiz-game)

**Files:**
- Modify: `games/math-quiz-game.html` (replace Audio System v6.0 script block, ~lines 810-819)

**Step 1: Replace the `<!-- Audio System v6.0 -->` comment and its `<script>` block with the new v7.0 system**

Replace the entire block from `<!-- Audio System v6.0 -->` through its closing `</script>` with:

```html
<!-- Audio System v7.0 -->
<script>
(function() {
    'use strict';

    // === Wavetable Bank (inline PeriodicWave definitions) ===
    const WAVETABLES = {
        bell: {
            real: [0, 0, 0.4, 0, 0.2, 0, 0.1, 0, 0.05],
            imag: [0, 1, 0, 0.3, 0, 0.1, 0, 0.05, 0]
        },
        chime: {
            real: [0, 0, 0.5, 0, 0.25, 0, 0.125],
            imag: [0, 1, 0, 0.5, 0, 0.25, 0]
        },
        brass: {
            real: [0, 0.5, 0.5, 0.35, 0.25, 0.2, 0.15, 0.1, 0.08],
            imag: [0, 0, 0, 0, 0, 0, 0, 0, 0]
        },
        warmPad: {
            real: [0, 1, 0.5, 0.25, 0.125, 0.0625],
            imag: [0, 0, 0.3, 0.15, 0.075, 0.0375]
        },
        softBuzz: {
            real: [0, 0.3, 0.3, 0.2, 0.15, 0.1, 0.08, 0.05],
            imag: [0, 0.3, 0.2, 0.15, 0.1, 0.08, 0.05, 0.03]
        }
    };

    // === ADSR Envelope Configuration ===
    const ENVELOPES = {
        bell:     { attack: 0.005, decay: 0.3,  sustain: 0.2,  release: 0.4  },
        chime:    { attack: 0.002, decay: 0.1,  sustain: 0.0,  release: 0.08 },
        brass:    { attack: 0.05,  decay: 0.2,  sustain: 0.6,  release: 0.3  },
        warmPad:  { attack: 0.1,   decay: 0.3,  sustain: 0.5,  release: 1.0  },
        softBuzz: { attack: 0.01,  decay: 0.15, sustain: 0.1,  release: 0.2  }
    };

    // === Context Mode Profiles ===
    const MODES = {
        home:      { volume: 0.5, reverbMix: 0.3, durationScale: 1.0 },
        classroom: { volume: 0.25, reverbMix: 0.0, durationScale: 0.6 }
    };

    class AudioManager {
        constructor() {
            if (AudioManager.instance) return AudioManager.instance;
            AudioManager.instance = this;

            this.context = null;
            this.isInitialized = false;
            this.isMuted = false;
            this.globalVolume = 0.5;
            this.activeNodes = new Set();
            this.isSupported = !!(window.AudioContext || window.webkitAudioContext);
            this.enableVisualFeedback = true;

            // v7.0 additions
            this.waves = {};
            this.masterGain = null;
            this.dryGain = null;
            this.reverbGain = null;
            this.convolver = null;
            this.mode = 'home';

            this.loadPreferences();
        }

        async initialize() {
            if (this.isInitialized || !this.isSupported) return;
            try {
                const AC = window.AudioContext || window.webkitAudioContext;
                this.context = new AC();
                if (this.context.state === 'suspended') {
                    await this.context.resume();
                }

                // Master gain chain
                this.masterGain = this.context.createGain();
                this.masterGain.gain.value = this.globalVolume;
                this.masterGain.connect(this.context.destination);

                // Dry path
                this.dryGain = this.context.createGain();
                this.dryGain.gain.value = 0.7;
                this.dryGain.connect(this.masterGain);

                // Reverb path
                this.reverbGain = this.context.createGain();
                this.reverbGain.gain.value = MODES[this.mode].reverbMix;
                this.convolver = this.context.createConvolver();
                this.convolver.buffer = this.createImpulseResponse(1.5, 2.0);
                this.reverbGain.connect(this.convolver);
                this.convolver.connect(this.masterGain);

                // Build wavetables
                for (const [name, table] of Object.entries(WAVETABLES)) {
                    this.waves[name] = this.context.createPeriodicWave(
                        new Float32Array(table.real),
                        new Float32Array(table.imag)
                    );
                }

                this.applyMode(this.mode);
                this.isInitialized = true;
            } catch (e) {
                console.warn('AudioManager v7.0: init failed', e);
                this.isSupported = false;
            }
        }

        createImpulseResponse(duration, decay) {
            const length = this.context.sampleRate * duration;
            const buffer = this.context.createBuffer(2, length, this.context.sampleRate);
            for (let ch = 0; ch < 2; ch++) {
                const data = buffer.getChannelData(ch);
                for (let i = 0; i < length; i++) {
                    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
                }
            }
            return buffer;
        }

        applyMode(mode) {
            this.mode = mode;
            const profile = MODES[mode] ?? MODES.home;
            this.globalVolume = profile.volume;
            if (this.masterGain) this.masterGain.gain.value = profile.volume;
            if (this.reverbGain) this.reverbGain.gain.value = profile.reverbMix;
            this.savePreferences();
        }

        getDurationScale() {
            return MODES[this.mode]?.durationScale ?? 1.0;
        }

        // === Core Sound Engine ===
        playNote(frequency, duration, waveName, envelope, filterFreq, useReverb, volume) {
            if (!this.isInitialized || this.isMuted || !this.isSupported) {
                if (this.enableVisualFeedback) this.provideVisualFeedback('action');
                return;
            }

            const ctx = this.context;
            const now = ctx.currentTime;
            const env = envelope ?? ENVELOPES.bell;
            const ds = this.getDurationScale();
            const dur = duration * ds;
            const vol = volume ?? 1.0;

            // Oscillator with wavetable
            const osc = ctx.createOscillator();
            if (waveName && this.waves[waveName]) {
                osc.setPeriodicWave(this.waves[waveName]);
            } else {
                osc.type = 'sine';
            }
            osc.frequency.value = frequency;

            // ADSR gain envelope
            const gainNode = ctx.createGain();
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(vol, now + env.attack * ds);
            gainNode.gain.linearRampToValueAtTime(vol * env.sustain, now + (env.attack + env.decay) * ds);
            gainNode.gain.setValueAtTime(vol * env.sustain, now + dur - env.release * ds);
            gainNode.gain.linearRampToValueAtTime(0, now + dur);

            // Optional lowpass filter
            let output = gainNode;
            if (filterFreq) {
                const filter = ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.value = filterFreq;
                filter.Q.value = 1;
                gainNode.connect(filter);
                output = filter;
            } else {
                output = gainNode;
            }

            // Route to dry + reverb
            osc.connect(gainNode);
            if (filterFreq) {
                const filter = ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.value = filterFreq;
                filter.Q.value = 1;
                output.connect(filter);
                filter.connect(this.dryGain);
                if (useReverb) filter.connect(this.reverbGain);
            } else {
                output.connect(this.dryGain);
                if (useReverb) output.connect(this.reverbGain);
            }

            osc.start(now);
            osc.stop(now + dur + 0.05);

            this.activeNodes.add(osc);
            osc.onended = () => this.activeNodes.delete(osc);
        }

        playSequence(notes, tempo, waveName, envelope, filterFreq, useReverb) {
            const beatDuration = 60 / tempo;
            const ds = this.getDurationScale();
            notes.forEach((note, i) => {
                const freq = note.freq ?? note;
                const dur = (note.dur ?? beatDuration) * ds;
                const vol = note.vol ?? 1.0;
                setTimeout(() => {
                    this.playNote(freq, dur, waveName, envelope, filterFreq, useReverb, vol);
                }, i * beatDuration * ds * 1000);
            });
        }

        // === Sound Effect Methods (backward-compatible API) ===

        playCorrectSound() {
            if (!this.isInitialized || this.isMuted) {
                if (this.enableVisualFeedback) this.provideVisualFeedback('success');
                return;
            }
            this.playSequence(
                [{ freq: 523.25, dur: 0.12 }, { freq: 659.25, dur: 0.12 }, { freq: 783.99, dur: 0.2 }],
                480, 'bell', ENVELOPES.bell, 2000, true
            );
            if (this.enableVisualFeedback) this.provideVisualFeedback('success');
        }

        playWrongSound() {
            if (!this.isInitialized || this.isMuted) {
                if (this.enableVisualFeedback) this.provideVisualFeedback('error');
                return;
            }
            this.playSequence(
                [{ freq: 200, dur: 0.15, vol: 0.3 }, { freq: 150, dur: 0.15, vol: 0.2 }],
                300, 'softBuzz', ENVELOPES.softBuzz, 800, false
            );
            if (this.enableVisualFeedback) this.provideVisualFeedback('error');
        }

        playClickSound() {
            if (!this.isInitialized || this.isMuted) return;
            this.playNote(800, 0.03, 'chime', ENVELOPES.chime, null, false, 0.2);
        }

        playWinSound() {
            if (!this.isInitialized || this.isMuted) {
                if (this.enableVisualFeedback) this.provideVisualFeedback('success');
                return;
            }
            this.playSequence(
                [{ freq: 523.25, dur: 0.25 }, { freq: 659.25, dur: 0.25 }, { freq: 783.99, dur: 0.25 }, { freq: 1046.5, dur: 0.5 }],
                240, 'brass', ENVELOPES.brass, null, true
            );
            if (this.enableVisualFeedback) this.provideVisualFeedback('success');
        }

        playLevelUpSound() {
            if (!this.isInitialized || this.isMuted) {
                if (this.enableVisualFeedback) this.provideVisualFeedback('action');
                return;
            }
            this.playSequence(
                [{ freq: 440, dur: 0.15 }, { freq: 554.37, dur: 0.15 }, { freq: 659.25, dur: 0.15 }, { freq: 880, dur: 0.3 }],
                360, 'chime', ENVELOPES.chime, null, true
            );
            if (this.enableVisualFeedback) this.provideVisualFeedback('action');
        }

        playGameOverSound() {
            if (!this.isInitialized || this.isMuted) {
                if (this.enableVisualFeedback) this.provideVisualFeedback('warning');
                return;
            }
            this.playSequence(
                [{ freq: 440, dur: 0.4 }, { freq: 415.3, dur: 0.4 }, { freq: 392, dur: 0.4 }, { freq: 349.23, dur: 0.8 }],
                120, 'warmPad', ENVELOPES.warmPad, 600, true
            );
            if (this.enableVisualFeedback) this.provideVisualFeedback('warning');
        }

        // === Visual Feedback (unchanged from v6.0) ===

        flashScreen(type) {
            this.provideVisualFeedback(type);
        }

        provideVisualFeedback(type) {
            if (typeof document === 'undefined') return;
            const existing = document.getElementById('audio-visual-feedback');
            if (existing) existing.remove();

            const overlay = document.createElement('div');
            overlay.id = 'audio-visual-feedback';
            overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;opacity:0;';
            overlay.style.background = this.getFeedbackColor(type);
            overlay.style.animation = 'audioFlash 0.3s ease-out';
            document.body.appendChild(overlay);
            overlay.addEventListener('animationend', () => overlay.remove());

            if (!document.getElementById('audio-flash-style')) {
                const style = document.createElement('style');
                style.id = 'audio-flash-style';
                style.textContent = '@keyframes audioFlash{0%{opacity:0}50%{opacity:0.3}100%{opacity:0}}';
                document.head.appendChild(style);
            }
        }

        getFeedbackColor(type) {
            const colors = {
                success: 'radial-gradient(circle,rgba(46,204,113,.4) 0%,transparent 70%)',
                error: 'radial-gradient(circle,rgba(231,76,60,.4) 0%,transparent 70%)',
                action: 'radial-gradient(circle,rgba(52,152,219,.4) 0%,transparent 70%)',
                warning: 'radial-gradient(circle,rgba(241,196,15,.4) 0%,transparent 70%)'
            };
            return colors[type] ?? colors.action;
        }

        // === Preferences ===

        savePreferences() {
            try {
                localStorage.setItem('audioPreferences', JSON.stringify({
                    volume: this.globalVolume,
                    muted: this.isMuted,
                    visualFeedback: this.enableVisualFeedback,
                    mode: this.mode
                }));
            } catch (e) { /* localStorage unavailable */ }
        }

        loadPreferences() {
            try {
                const saved = JSON.parse(localStorage.getItem('audioPreferences') ?? '{}');
                this.globalVolume = saved.volume ?? 0.5;
                this.isMuted = saved.muted ?? false;
                this.enableVisualFeedback = saved.visualFeedback ?? true;
                this.mode = saved.mode ?? 'home';
            } catch (e) { /* localStorage unavailable */ }
        }

        setVolume(v) {
            this.globalVolume = Math.max(0, Math.min(1, v));
            if (this.masterGain) this.masterGain.gain.value = this.globalVolume;
            this.savePreferences();
        }

        setMuted(m) {
            this.isMuted = !!m;
            this.savePreferences();
        }

        setVisualFeedback(v) {
            this.enableVisualFeedback = !!v;
            this.savePreferences();
        }

        setMode(mode) {
            if (MODES[mode]) this.applyMode(mode);
        }

        destroy() {
            this.activeNodes.forEach(n => { try { n.stop(); } catch(e) {} });
            this.activeNodes.clear();
            if (this.context) {
                try { this.context.close(); } catch(e) {}
            }
        }
    }

    // === Global Initialization ===
    window.audioManager = new AudioManager();

    const initAudioOnInteraction = async () => {
        await window.audioManager.initialize();
        ['click', 'touchstart', 'keydown'].forEach(evt =>
            document.removeEventListener(evt, initAudioOnInteraction)
        );
    };
    ['click', 'touchstart', 'keydown'].forEach(evt =>
        document.addEventListener(evt, initAudioOnInteraction, { once: false })
    );

    window.addEventListener('beforeunload', () => {
        if (window.audioManager) window.audioManager.destroy();
    });
})();
</script>
```

**Step 2: Run tests**

Run: `rm .test-cache.json && node scripts/test-incremental.js --clear-cache --all`
Expected: 100% pass. Audio System detected for math-quiz-game.

**Step 3: Run pattern verify**

Run: `node scripts/pattern-verify.js`
Expected: Audio System detected (searches for `<!-- Audio System v` prefix now).

**Step 4: Visually verify audio in browser**

Open `http://localhost:8000/games/math-quiz-game.html`, play the game, verify:
- Correct sound: warm bell chime (not robotic sine)
- Wrong sound: soft buzz (not harsh sawtooth)
- Click: crisp, short chime
- Win: brass fanfare with reverb tail

**Step 5: Commit**

```bash
git add games/math-quiz-game.html
git commit -m "feat: deploy Audio System v7.0 to math-quiz-game (pilot)"
```

---

## Task 7: Deploy Audio System v7.0 to remaining 9 games

**Files:**
- Modify: All other 9 game HTML files

**Step 1: In each game, replace the `<!-- Audio System v6.0 -->` comment and its entire `<script>...</script>` block with the exact same v7.0 code from Task 6 Step 1**

The v7.0 code is identical across all games — same audio engine, same wavetables, same sounds.

**Step 2: Run tests**

Run: `rm .test-cache.json && node scripts/test-incremental.js --clear-cache --all`
Expected: 100% pass across all 10 games.

**Step 3: Run pattern verify**

Run: `node scripts/pattern-verify.js`
Expected: Audio System 10/10 coverage.

**Step 4: Commit**

```bash
git add games/*.html
git commit -m "feat: deploy Audio System v7.0 to all 10 games"
```

---

## Task 8: Add context mode toggle UI

**Files:**
- Modify: All 10 game HTML files (add settings icon near existing back button)

**Step 1: Add a settings button in the HTML body (near the back button)**

Add after the back button element in each game:

```html
<button class="settings-toggle" onclick="toggleContextMode()" title="Toggle classroom/home mode">
    <span class="settings-icon" id="modeIcon">🏠</span>
</button>
```

**Step 2: Add CSS for the settings button (in the `:root` / design system section)**

```css
.settings-toggle {
    position: fixed;
    top: var(--space-md);
    left: var(--space-md);
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: none;
    background: var(--game-gradient);
    color: white;
    font-size: 1.2rem;
    cursor: pointer;
    box-shadow: var(--shadow-sm);
    transition: transform var(--transition-fast);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
}
.settings-toggle:hover {
    transform: scale(1.1);
}
```

**Step 3: Add the toggle function in the game script section**

```javascript
function toggleContextMode() {
    if (!window.audioManager) return;
    const newMode = window.audioManager.mode === 'home' ? 'classroom' : 'home';
    window.audioManager.setMode(newMode);
    const icon = document.getElementById('modeIcon');
    if (icon) icon.textContent = newMode === 'home' ? '🏠' : '🏫';
}
// Initialize icon on load
window.addEventListener('DOMContentLoaded', () => {
    const icon = document.getElementById('modeIcon');
    if (icon && window.audioManager) {
        icon.textContent = window.audioManager.mode === 'home' ? '🏠' : '🏫';
    }
});
```

**Step 4: Run tests**

Run: `rm .test-cache.json && node scripts/test-incremental.js --clear-cache --all`
Expected: 100% pass.

**Step 5: Commit**

```bash
git add games/*.html
git commit -m "feat: add classroom/home context mode toggle to all games"
```

---

# LAYER 3: Enhanced Animations & Micro-Interactions

## Task 9: Add particle system to math-quiz-game (pilot)

**Files:**
- Modify: `games/math-quiz-game.html`

**Step 1: Add the ParticleSystem class in a new `<script>` block after the Audio System v7.0 block**

```html
<!-- Particle System v1.0 -->
<script>
(function() {
    'use strict';

    class ParticleSystem {
        constructor() {
            if (ParticleSystem.instance) return ParticleSystem.instance;
            ParticleSystem.instance = this;
            this.canvas = null;
            this.ctx = null;
            this.particles = [];
            this.animationId = null;
            this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        }

        ensureCanvas() {
            if (this.canvas) return;
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'particle-canvas';
            this.canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9998;';
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            document.body.appendChild(this.canvas);
            this.ctx = this.canvas.getContext('2d');

            window.addEventListener('resize', () => {
                if (this.canvas) {
                    this.canvas.width = window.innerWidth;
                    this.canvas.height = window.innerHeight;
                }
            });
        }

        getParticleCount(base) {
            if (this.reducedMotion) return 0;
            const mode = window.audioManager?.mode ?? 'home';
            return mode === 'classroom' ? Math.floor(base * 0.3) : base;
        }

        sparkle(x, y, color, count) {
            if (this.reducedMotion) return;
            this.ensureCanvas();
            const n = this.getParticleCount(count ?? 12);
            for (let i = 0; i < n; i++) {
                const angle = (Math.PI * 2 * i) / n + (Math.random() * 0.3);
                const speed = 2 + Math.random() * 3;
                this.particles.push({
                    x, y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 1,
                    decay: 0.02 + Math.random() * 0.02,
                    size: 3 + Math.random() * 4,
                    color: color ?? '#f9ca24',
                    type: 'sparkle'
                });
            }
            this.startLoop();
        }

        confetti(count) {
            if (this.reducedMotion) return;
            this.ensureCanvas();
            const n = this.getParticleCount(count ?? 40);
            const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd', '#01a3a4', '#2ecc71'];
            for (let i = 0; i < n; i++) {
                this.particles.push({
                    x: Math.random() * this.canvas.width,
                    y: -10,
                    vx: (Math.random() - 0.5) * 4,
                    vy: 2 + Math.random() * 3,
                    life: 1,
                    decay: 0.005 + Math.random() * 0.005,
                    size: 6 + Math.random() * 6,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    rotation: Math.random() * 360,
                    rotationSpeed: (Math.random() - 0.5) * 10,
                    type: 'confetti'
                });
            }
            this.startLoop();
        }

        burst(x, y, color) {
            if (this.reducedMotion) return;
            this.ensureCanvas();
            const n = this.getParticleCount(8);
            for (let i = 0; i < n; i++) {
                const angle = (Math.PI * 2 * i) / n;
                this.particles.push({
                    x, y,
                    vx: Math.cos(angle) * 5,
                    vy: Math.sin(angle) * 5,
                    life: 1,
                    decay: 0.03,
                    size: 5,
                    color: color ?? '#e74c3c',
                    type: 'burst'
                });
            }
            this.startLoop();
        }

        startLoop() {
            if (this.animationId) return;
            const loop = () => {
                if (this.particles.length === 0) {
                    this.animationId = null;
                    if (this.ctx) this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                    return;
                }
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.particles = this.particles.filter(p => {
                    p.x += p.vx;
                    p.y += p.vy;
                    p.life -= p.decay;
                    if (p.type === 'confetti') {
                        p.vy += 0.1; // gravity
                        p.rotation += p.rotationSpeed;
                    }
                    if (p.life <= 0) return false;

                    this.ctx.save();
                    this.ctx.globalAlpha = p.life;
                    this.ctx.fillStyle = p.color;

                    if (p.type === 'confetti') {
                        this.ctx.translate(p.x, p.y);
                        this.ctx.rotate((p.rotation * Math.PI) / 180);
                        this.ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
                    } else if (p.type === 'sparkle') {
                        this.ctx.beginPath();
                        this.ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
                        this.ctx.fill();
                    } else {
                        this.ctx.beginPath();
                        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                        this.ctx.fill();
                    }
                    this.ctx.restore();
                    return true;
                });
                this.animationId = requestAnimationFrame(loop);
            };
            this.animationId = requestAnimationFrame(loop);
        }
    }

    window.particleSystem = new ParticleSystem();
})();
</script>
```

**Step 2: Run tests**

Run: `rm .test-cache.json && node scripts/test-incremental.js --clear-cache --all`
Expected: 100% pass.

**Step 3: Commit**

```bash
git add games/math-quiz-game.html
git commit -m "feat: add particle system v1.0 to math-quiz-game (pilot)"
```

---

## Task 10: Integrate particles with game events (math-quiz-game)

**Files:**
- Modify: `games/math-quiz-game.html` (game logic script section)

**Step 1: Add particle calls alongside existing audio calls**

Find the places where `audioManager.playCorrectSound()` and `audioManager.playWinSound()` etc. are called, and add particle triggers:

After correct answer audio:
```javascript
if (window.particleSystem) {
    const btn = document.querySelector('.answer-btn.correct') ?? event?.target;
    if (btn) {
        const rect = btn.getBoundingClientRect();
        window.particleSystem.sparkle(rect.left + rect.width / 2, rect.top + rect.height / 2, '#2ecc71', 15);
    }
}
```

After win audio:
```javascript
if (window.particleSystem) window.particleSystem.confetti(40);
```

After wrong answer audio:
```javascript
if (window.particleSystem) {
    const btn = event?.target;
    if (btn) {
        const rect = btn.getBoundingClientRect();
        window.particleSystem.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, '#e74c3c');
    }
}
```

**Step 2: Run tests**

Run: `rm .test-cache.json && node scripts/test-incremental.js --clear-cache --all`
Expected: 100% pass.

**Step 3: Verify visually in browser**

Play the game. Correct answers should sparkle green. Wins should rain confetti. Wrong answers should burst red.

**Step 4: Commit**

```bash
git add games/math-quiz-game.html
git commit -m "feat: integrate particle effects with game events in math-quiz-game"
```

---

## Task 11: Add micro-interaction CSS to design system

**Files:**
- Modify: All 10 game HTML files (add to CSS design system section)

**Step 1: Add micro-interaction styles after the `:root` variables in each game**

```css
/* === Micro-Interactions === */

/* Spring-physics button bounce */
.answer-btn, .mode-btn, .control-btn, button {
    transition: transform var(--transition-fast) cubic-bezier(0.34, 1.56, 0.64, 1),
                box-shadow var(--transition-fast);
}

/* Ripple effect */
.ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.4);
    transform: scale(0);
    animation: rippleEffect 0.6s ease-out;
    pointer-events: none;
}
@keyframes rippleEffect {
    to { transform: scale(4); opacity: 0; }
}

/* Floating score indicator */
.float-score {
    position: fixed;
    font-weight: bold;
    font-size: var(--font-size-lg);
    color: var(--color-success);
    pointer-events: none;
    z-index: 9997;
    animation: floatUp 1s ease-out forwards;
}
@keyframes floatUp {
    0% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-60px); }
}

/* Stat box glow on change */
@keyframes statGlow {
    0% { box-shadow: var(--shadow-sm); }
    50% { box-shadow: 0 0 15px rgba(102, 126, 234, 0.5); }
    100% { box-shadow: var(--shadow-sm); }
}

/* Timer urgency pulse */
@keyframes timerUrgency {
    0%, 100% { box-shadow: none; }
    50% { box-shadow: 0 0 20px rgba(231, 76, 60, 0.5); }
}

/* Score roll animation */
@keyframes scoreRoll {
    0% { transform: translateY(-100%); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
}

/* Stagger entrance for grid items */
@keyframes staggerIn {
    from { opacity: 0; transform: translateY(20px) scale(0.95); }
    to { opacity: 1; transform: translateY(0) scale(1); }
}
```

**Step 2: Add ripple effect JavaScript**

Add to each game's script section (or as a separate inline `<script>` block after the particle system):

```javascript
// Ripple effect on buttons
document.addEventListener('click', function(e) {
    const btn = e.target.closest('button');
    if (!btn) return;
    btn.style.position = btn.style.position || 'relative';
    btn.style.overflow = 'hidden';
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
});

// Floating score indicator
function showFloatingScore(text, x, y, color) {
    const el = document.createElement('div');
    el.className = 'float-score';
    el.textContent = text;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    if (color) el.style.color = color;
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
}
window.showFloatingScore = showFloatingScore;
```

**Step 3: Run tests**

Run: `rm .test-cache.json && node scripts/test-incremental.js --clear-cache --all`
Expected: 100% pass.

**Step 4: Commit**

```bash
git add games/*.html
git commit -m "feat: add micro-interaction CSS and ripple effects to all games"
```

---

## Task 12: Deploy particle system to remaining 9 games

**Files:**
- Modify: All other 9 game HTML files

**Step 1: Add the `<!-- Particle System v1.0 -->` script block (from Task 9) to each game, after the Audio System v7.0 block**

**Step 2: Integrate particle calls with game events in each game (same pattern as Task 10)**

Each game has its own event handlers — find the correct/wrong/win handlers and add:
- `particleSystem.sparkle()` on correct
- `particleSystem.burst()` on wrong
- `particleSystem.confetti()` on win/complete

**Step 3: Run tests**

Run: `rm .test-cache.json && node scripts/test-incremental.js --clear-cache --all`
Expected: 100% pass.

**Step 4: Run pattern verify**

Run: `node scripts/pattern-verify.js`
Expected: All patterns detected, no regressions.

**Step 5: Commit**

```bash
git add games/*.html
git commit -m "feat: deploy particle system and micro-interactions to all 10 games"
```

---

## Task 13: Update pattern-verify for all new patterns

**Files:**
- Modify: `scripts/pattern-verify.js`

**Step 1: Add particle system and micro-interaction patterns**

```javascript
particleSystem: {
    name: 'Particle System v1.0',
    roi: 400,
    searchPattern: '<!-- Particle System v1.0',
    features: [
        'window.particleSystem',
        'ParticleSystem',
        'confetti',
        'sparkle'
    ],
    description: 'Canvas particle effects for feedback'
},
microInteractions: {
    name: 'Micro-Interactions',
    roi: 350,
    searchPattern: '/* === Micro-Interactions === */',
    features: [
        'rippleEffect',
        'floatUp',
        'statGlow',
        'staggerIn'
    ],
    description: 'Ripples, floating scores, stat glow'
},
```

**Step 2: Run pattern verify**

Run: `node scripts/pattern-verify.js`
Expected: All new patterns show 10/10 coverage.

**Step 3: Commit**

```bash
git add scripts/pattern-verify.js
git commit -m "feat: add particle system and micro-interaction patterns to verify dashboard"
```

---

## Task 14: Final validation

**Step 1: Clear cache and run full test suite**

Run: `rm .test-cache.json && node scripts/test-incremental.js --clear-cache --all`
Expected: 100% pass (160+ tests).

**Step 2: Run pattern verify**

Run: `node scripts/pattern-verify.js`
Expected: All patterns at 10/10 coverage including new ones.

**Step 3: Visual spot-check 3 games in browser**

Open math-quiz-game, memory-match-game, and tic-tac-toe-game. Verify:
- Glassmorphism containers
- CSS variables applied (inspect elements)
- Correct sound = warm bell chime
- Wrong sound = soft buzz
- Win = brass fanfare with confetti
- Ripple on button clicks
- Context mode toggle works (🏠 ↔ 🏫)

**Step 4: Commit CLAUDE.md update**

Update CLAUDE.md to reflect new patterns:

```markdown
| Audio System v7.0 | 750% | ADSR + wavetables + reverb |
| Design System v1.0 | 500% | CSS variables + glassmorphism |
| Particle System v1.0 | 400% | Canvas feedback effects |
| Micro-Interactions | 350% | Ripples, floats, glow |
```

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md with v7.0 audio, design system, and particle patterns"
```

---

## Summary

| Task | Layer | Description | Commit |
|------|-------|-------------|--------|
| 1 | L1 | Add design system tests | `test: add design system CSS variable detection tests` |
| 2 | L1 | Pilot CSS tokens on math-quiz | `feat: deploy CSS design system v1.0 to math-quiz-game (pilot)` |
| 3 | L1 | Deploy CSS to all 10 games | `feat: deploy CSS design system v1.0 to all 10 games` |
| 4 | L1 | Update pattern-verify | `feat: add design system v1.0 pattern to pattern-verify dashboard` |
| 5 | L2 | Update tests for Audio v7.0 | `test: update audio system checks to accept both v6.0 and v7.0` |
| 6 | L2 | Pilot Audio v7.0 on math-quiz | `feat: deploy Audio System v7.0 to math-quiz-game (pilot)` |
| 7 | L2 | Deploy Audio v7.0 to all games | `feat: deploy Audio System v7.0 to all 10 games` |
| 8 | L2 | Add context mode toggle | `feat: add classroom/home context mode toggle to all games` |
| 9 | L3 | Pilot particle system | `feat: add particle system v1.0 to math-quiz-game (pilot)` |
| 10 | L3 | Integrate particles with events | `feat: integrate particle effects with game events in math-quiz-game` |
| 11 | L3 | Deploy micro-interaction CSS | `feat: add micro-interaction CSS and ripple effects to all games` |
| 12 | L3 | Deploy particles to all games | `feat: deploy particle system and micro-interactions to all 10 games` |
| 13 | L3 | Update pattern-verify | `feat: add particle system and micro-interaction patterns to verify dashboard` |
| 14 | All | Final validation | `docs: update CLAUDE.md with v7.0 audio, design system, and particle patterns` |

**Total commits:** 14
**Estimated tasks:** 14 (bite-sized, independently deployable)
