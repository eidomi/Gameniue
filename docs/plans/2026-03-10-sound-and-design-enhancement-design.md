# Sound & Visual Design Enhancement — Design Document

**Date:** 2026-03-10
**Status:** Approved
**Scope:** All 11 Hebrew educational games

## Summary

Three-layer enhancement to modernize sound effects and visual design across all games. Layered rollout: design system first, then audio, then animations.

## Context

- **Audience:** Both classroom and home use (adaptive context modes)
- **Sound style:** Modern & polished (crisp UI sounds, subtle reverb, warm timbres)
- **Visual style:** Full overhaul — unified design system, glassmorphism, micro-interactions
- **Background music:** Not included — focus on sound effects and UI sounds only
- **Rollout:** Layer by layer across all 11 games per phase
- **Constraints:** No external dependencies, everything inline, maintain 100% test pass rate

## Layer 1: Unified Design System (CSS Variables & Theming)

### Goal
Extract hardcoded styles into CSS custom properties and deploy a consistent theme across all 11 games.

### Design Tokens

```css
:root {
  /* Color palette */
  --color-primary: #667eea;
  --color-success: #2ecc71;
  --color-error: #e74c3c;
  --color-warning: #f9ca24;
  --color-surface: #ffffff;
  --color-text: #2c3e50;

  /* Shadows (3-tier depth system) */
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.1);
  --shadow-md: 0 8px 25px rgba(0,0,0,0.15);
  --shadow-lg: 0 25px 50px rgba(0,0,0,0.2);

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

  /* Context mode */
  --audio-mode: 'home';
}
```

### Per-Game Theme Overrides

Each game keeps its unique personality via a small override block:

```css
:root {
  --game-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --game-accent: #667eea;
}
```

### Glassmorphism Container

```css
.game-container {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}
```

### Key Changes
- Replace all hardcoded colors with CSS variables
- Standardize shadow depths across games
- Unify border-radius, spacing, and typography scales
- Add glassmorphism to game containers
- Maintain each game's unique gradient identity

## Layer 2: Enhanced Audio System v7.0

### Goal
Replace basic oscillator sounds with ADSR-enveloped, wavetable-driven, reverb-enhanced audio.

### Architecture

```
AudioManager v7.0
├── AudioContext (lazy-init, same as v6.0)
├── MasterGain → destination
│   ├── DryGain (direct signal)
│   └── ReverbGain → ConvolverNode (algorithmic impulse response)
├── Sound Engine
│   ├── ADSR Envelope (attack/decay/sustain/release per sound)
│   ├── Wavetable Bank (5 custom PeriodicWaves, inline)
│   │   ├── bell (correct answer)
│   │   ├── chime (click/UI)
│   │   ├── brass (win/level-up)
│   │   ├── warm-pad (ambient feedback)
│   │   └── soft-buzz (wrong answer)
│   └── BiquadFilter (lowpass for warmth, per-sound configurable)
├── Context Modes
│   ├── home: full reverb, normal volume (0.5)
│   └── classroom: no reverb, lower volume (0.25), shorter durations
└── Visual Fallback (same as v6.0, color-coded flashes)
```

### Sound Redesign

| Sound | Current (v6.0) | Enhanced (v7.0) |
|-------|----------------|-----------------|
| Correct | 3 raw sine notes ascending | Bell wavetable, soft attack (50ms), quick decay, lowpass at 2kHz, subtle reverb |
| Wrong | 2 harsh sawtooth notes | Soft-buzz wavetable, gentle 2-note descend, heavy lowpass (800Hz) |
| Click | Abrupt square wave blip | Chime wavetable, ultra-short (30ms), crisp but non-shrill, no reverb |
| Win | 4 raw sine fanfare | Brass wavetable, 4-note ascending with crescendo, full reverb tail |
| Level Up | 4 ascending notes | Chime wavetable, quick 3-note arpeggio, medium reverb |
| Game Over | 4 descending notes | Warm-pad wavetable, slow descend with long release (1s), lowpass sweep |

### Algorithmic Reverb (no external files)

```javascript
function createImpulseResponse(ctx, duration = 1.5, decay = 2.0) {
  const length = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }
  return buffer;
}
```

### Context Modes
- **Home:** Full reverb, normal volume (0.5), standard durations
- **Classroom:** No reverb, lower volume (0.25), durations shortened by 40%
- Toggle via settings icon, persisted to localStorage
- `prefers-reduced-motion` respected

### Backward Compatibility
Same API surface: `audioManager.playCorrectSound()` etc. No game logic changes needed.

## Layer 3: Enhanced Animations & Micro-Interactions

### Goal
Add particle effects, richer transitions, and reward animations.

### Particle Engine

Lightweight inline `ParticleSystem` class using canvas overlay:
- Types: confetti, sparkle, burst, float
- Auto-cleanup after animation completes

| Trigger | Effect | Duration |
|---------|--------|----------|
| Correct answer | Sparkle burst from element | 600ms |
| Wrong answer | Red ripple + gentle shake | 400ms |
| Win/Complete | Confetti rain (30-50 particles) | 2s |
| Level up | Golden sparkle spiral upward | 1.2s |
| Streak (3+) | Combo fire trail on score | 800ms |
| Button hover | Soft glow pulse + lift | continuous |
| Card flip | 3D Y-axis rotation | 400ms |

### Enhanced Transitions
- Spring physics: `cubic-bezier(0.34, 1.56, 0.64, 1)` for bouncy feel
- Staggered grid entrances: 50ms delay between items
- Score counter: number roll animation
- Progress bars: smooth fill with shimmer overlay
- Modals: scale + fade with backdrop blur

### Micro-Interactions
- Ripple effect on button clicks (soft Material Design style)
- Haptic pulse on feedback (scale 1.0 → 1.05 → 1.0, 200ms)
- Floating "+1" score indicators (drift up + fade)
- Stat box border-glow on value change
- Timer urgency: pulsing red glow when < 20%

### Context-Aware Behavior
- Classroom mode: reduced particle count (15 vs 50), shorter durations
- `prefers-reduced-motion`: disables particles, keeps functional transitions

## Implementation Sequence

| Phase | Layer | Scope | Games |
|-------|-------|-------|-------|
| 1 | Design System | CSS variables, glassmorphism, theme tokens | All 11 |
| 2 | Audio v7.0 | ADSR, wavetables, reverb, context modes | All 11 |
| 3 | Animations | Particle engine, micro-interactions, transitions | All 11 |

Each phase: implement → test (100% pass) → verify patterns → next phase.

## Research Sources
- Flutu Music: Balancing Audio in Educational Games (2024)
- GameAnalytics: 9 Sound Design Tips (2025)
- MDN: Web Audio API Advanced Techniques
- CodePen: Recreating 8-bit Music with Web Audio API
- Google Chrome Labs: Wavetable Repository
