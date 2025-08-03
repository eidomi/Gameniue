# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Hebrew educational games collection (Gameniue - "ארץ המשחקים") consisting of 10 standalone HTML5 games. The project uses pure HTML/CSS/JavaScript without any framework dependencies, making it simple to maintain and deploy.

## Development Commands

```bash
# Start development server (Python 3)
npm run dev
# or directly with Python
python3 -m http.server 8000

# Build (no build process needed for static HTML)
npm run build

# Deploy to Vercel
vercel --prod
```

## Architecture

### Structure
- **Single-file architecture**: Each game is a complete, self-contained HTML file with embedded CSS and JavaScript
- **No build process**: Direct HTML/CSS/JS files served statically
- **Language**: Primary interface in Hebrew (RTL layout), with some games having English versions
- **Project Pattern**: See `PROJECT_PATTERN.md` for detailed patterns and templates

### File Structure
```
Gameniue/
├── index.html                      # Main landing page
├── games/                          # Game files directory
│   ├── memory-match-game.html     # Memory card matching
│   ├── memory-match-game-he.html  # Hebrew version
│   ├── snakes-and-ladders-game.html # Board game (mobile-optimized)
│   ├── snakes-and-ladders-game-he.html # Hebrew version
│   ├── tic-tac-toe-game.html      # Tic-tac-toe with AI
│   ├── simon-says-game.html       # Memory sequence game
│   ├── word-scramble-game.html    # Word puzzle game
│   ├── math-quiz-game.html        # Math practice
│   ├── color-match-game.html      # Color matching
│   ├── pattern-memory-game.html   # Pattern memorization
│   ├── puzzle-slider-game.html    # Number sliding puzzle
│   └── quick-draw-game.html       # Drawing game
├── docs/                           # Documentation
│   ├── CLAUDE.md                  # This file
│   └── PROJECT_PATTERN.md         # Development patterns
├── package.json                    # NPM configuration
├── vercel.json                     # Deployment configuration
└── README.md                       # Project overview
```

### Common Patterns
- **Styling**: Gradient backgrounds, modern card-based UI, animations
- **Game state**: Managed with JavaScript variables, no external state management
- **Sound effects**: Web Audio API for procedural sound generation
- **Responsive design**: CSS Grid and Flexbox for mobile compatibility
- **RTL support**: Right-to-left layout for Hebrew text
- **Touch handling**: Debounced touch events to prevent double-firing

## Mobile Optimization

### Critical Mobile Fixes Applied
```css
/* Responsive board sizing */
.board {
    width: calc(100vw - 30px);
    max-width: 400px;
    aspect-ratio: 1;
}

/* Dynamic font sizing */
font-size: clamp(0.5em, 2vw, 1.2em);

/* Touch-friendly buttons */
.button {
    min-height: 44px;
    padding: 12px 24px;
}
```

### Touch Event Pattern
```javascript
let lastTouchTime = 0;
function handleTouch(event) {
    if (event && event.type === 'touchstart') {
        const currentTime = new Date().getTime();
        if (currentTime - lastTouchTime < 300) return;
        lastTouchTime = currentTime;
        event.preventDefault();
    }
}
```

## Deployment

### Vercel Configuration
The project includes `vercel.json` for optimal static hosting:
- No build step required
- Security headers configured
- Proper routing for single-page navigation

### Deployment Steps
1. Login to Vercel: `vercel login`
2. Deploy to production: `vercel --prod`
3. Project will be available at: `https://gameniue.vercel.app`

## Common Issues and Solutions

### Issue: Game board not fitting on mobile
**Solution**: Use viewport-relative units with max constraints and aspect-ratio

### Issue: Double-firing of touch/click events
**Solution**: Implement debouncing with timestamp checking

### Issue: Text/elements too small on mobile
**Solution**: Use `clamp()` function for responsive sizing

### Issue: Hebrew text alignment problems
**Solution**: Ensure `dir="rtl"` on HTML element and appropriate CSS

## Key Considerations

### When modifying games:
- Preserve Hebrew language and RTL layout where present
- Maintain self-contained architecture (no external dependencies)
- Keep educational and family-friendly content
- Test on both desktop and mobile viewports (use Chrome DevTools)
- Ensure animations and transitions are smooth
- Check touch interactions on actual devices when possible

### When adding new games:
1. Copy the template from `PROJECT_PATTERN.md`
2. Maintain consistent styling with existing games
3. Implement sound using Web Audio API pattern
4. Add proper mobile viewport meta tags
5. Update `index.html` with new game card
6. Test thoroughly on mobile devices

### Performance Guidelines
- Minimize DOM manipulations
- Use CSS animations over JavaScript when possible
- Implement `requestAnimationFrame` for game loops
- Keep file sizes minimal (no external assets)

### Navigation
- Games link back to index through navigation buttons
- Each game is independent and doesn't share state with others
- Use `window.location.href` for navigation between games

## Testing Checklist

Before deploying changes:
- [ ] Test on mobile viewport (320px, 375px, 768px)
- [ ] Verify touch interactions work correctly
- [ ] Check Hebrew text displays properly (RTL)
- [ ] Ensure sounds play on user interaction
- [ ] Verify game state persists in localStorage
- [ ] Test on both iOS and Android if possible
- [ ] Check page loads quickly (< 2 seconds)
- [ ] Verify no console errors

## Resources

- **Pattern Documentation**: See `PROJECT_PATTERN.md` for reusable templates
- **Local Testing**: Use `npm run dev` to test locally
- **Mobile Testing**: Chrome DevTools Device Mode
- **Deployment**: Vercel Dashboard for monitoring