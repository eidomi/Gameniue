# Game Bugfix Design: Hebrew-English Learning & Color Match

**Date:** 2026-03-11
**Games:** hebrew-english-learning-game.html, color-match-game.html
**Root Cause:** Automated scripts (particle effects, accessibility) introduced variable scoping and type mismatch bugs

## Hebrew-English Learning Game

### Bug: `button is not defined` (lines 1988, 1997)
- **Cause:** `button` was forEach loop variable, referenced outside its scope in particle effect code
- **Effect:** `safeExecute` catches the ReferenceError, preventing `loadNewQuestion()` from running. Game freezes after first answer.
- **Fix:** Replace `button` with `document.querySelector('.answer-options')` for particle positioning

### Affected Lines
- Line 1988: `var hEl = button || ...` → `var hEl = document.querySelector('.answer-options')`
- Line 1997: `var hEl2 = button || ...` → `var hEl2 = document.querySelector('.answer-options')`

## Color Match Game

### Bug 1: `updateTimer` not defined (line 1527)
- **Cause:** Function referenced but never declared
- **Fix:** Add `updateTimer()` function that updates timerFill width

### Bug 2: `correctAnswer` type mismatch (line 1506)
- **Cause:** Set as numeric index via `colorKeys.indexOf()`, but compared against string keys from HTML `selectColor('red')`
- **Effect:** `color === correctAnswer` always false; `colors[correctAnswer].name` crashes
- **Fix:** Store string key: `correctAnswer = randomKey`

### Bug 3: `event.target` implicit global (line 1581)
- **Cause:** Uses deprecated `window.event` instead of passed event parameter
- **Fix:** Add `e` parameter to `selectColor(color, e)`, update HTML onclick handlers

### Bug 4: Keyboard handler passes numeric index (line 1702)
- **Cause:** `selectColor(colorIndex)` passes number, but function expects string key
- **Fix:** `selectColor(colorKeys[colorIndex])`

## Verification
- Run all 160 tests
- Browser-test both games with 3 moves each via Playwright
