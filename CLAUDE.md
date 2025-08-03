# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Hebrew educational games collection (Gameniue - "ארץ המשחקים") consisting of 10 standalone HTML5 games. The project uses pure HTML/CSS/JavaScript without any framework dependencies, making it simple to maintain and deploy.

## Development Commands

```bash
# Start development server
npm run dev
# or directly with Python (port 8000)
python -m http.server 8000

# Build (no build process needed for static HTML)
npm run build
```

## Architecture

### Structure
- **Single-file architecture**: Each game is a complete, self-contained HTML file with embedded CSS and JavaScript
- **No build process**: Direct HTML/CSS/JS files served statically
- **Language**: Primary interface in Hebrew (RTL layout), with some games having English versions

### Game Files
- `index.html` - Main landing page with game selection grid
- Individual game files:
  - `memory-match-game.html` / `memory-match-game-he.html` - Memory card matching game
  - `snakes-and-ladders-game.html` / `snakes-and-ladders-game-he.html` - Classic board game
  - `tic-tac-toe-game.html` - Tic-tac-toe with AI opponent
  - `simon-says-game.html` - Memory sequence game
  - `word-scramble-game.html` - Word puzzle game
  - `math-quiz-game.html` - Math practice game
  - `color-match-game.html` - Color matching speed game
  - `pattern-memory-game.html` - Pattern memorization game
  - `puzzle-slider-game.html` - Number sliding puzzle
  - `quick-draw-game.html` - Drawing and guessing game

### Common Patterns
- **Styling**: Gradient backgrounds, modern card-based UI, animations
- **Game state**: Managed with JavaScript variables, no external state management
- **Sound effects**: HTML5 Audio API for game sounds
- **Responsive design**: CSS Grid and Flexbox for mobile compatibility
- **RTL support**: Right-to-left layout for Hebrew text

## Key Considerations

### When modifying games:
- Preserve Hebrew language and RTL layout where present
- Maintain self-contained architecture (no external dependencies)
- Keep educational and family-friendly content
- Test on both desktop and mobile viewports
- Ensure animations and transitions are smooth

### Navigation
- Games link back to index through navigation or URL changes
- Each game is independent and doesn't share state with others