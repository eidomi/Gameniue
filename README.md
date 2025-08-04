# 🎮 Gameniue - ארץ המשחקים

A collection of 11 educational Hebrew games for the whole family, built with pure HTML, CSS, and JavaScript.

## 🎯 Features

- 11 different educational games
- Hebrew interface with RTL support
- Mobile-responsive design
- No external dependencies
- Offline capable
- Sound effects with visual fallback
- 🛡️ 85% automatic error recovery (Error Handler v6.0)
- 🎵 Accessible audio system with visual feedback
- ♿ WCAG accessibility compliant
- 🧪 100% test coverage with automated testing

## 🎲 Games Included

1. **Memory Match** - Card matching memory game
2. **Snakes and Ladders** - Classic board game
3. **Tic Tac Toe** - Play against AI
4. **Simon Says** - Memory sequence game
5. **Word Scramble** - Unscramble Hebrew words
6. **Math Quiz** - Practice arithmetic
7. **Color Match** - Speed color matching
8. **Pattern Memory** - Remember visual patterns
9. **Puzzle Slider** - Number sliding puzzle
10. **Quick Draw** - Drawing and guessing game
11. **Hebrew-English Learning** - Learn English vocabulary with fun games

## 🚀 Quick Start

### Development
```bash
# Install dependencies (minimal)
npm install

# Start development server
npm run dev

# Or use Python directly
python3 -m http.server 8000
```

Then open http://localhost:8000 in your browser.

### Deployment
```bash
# Deploy to Vercel
vercel --prod
```

## 📁 Project Structure

```
Gameniue/
├── index.html           # Main landing page
├── games/              # All game files
│   ├── memory-match-game.html
│   ├── snakes-and-ladders-game.html
│   └── ... (other games)
├── docs/               # Documentation
│   ├── CLAUDE.md       # AI assistant guide
│   └── PROJECT_PATTERN.md # Development patterns
├── package.json        # NPM configuration
└── vercel.json        # Deployment config
```

## 🛠️ Technology Stack

- **Frontend**: Pure HTML5, CSS3, JavaScript
- **Audio**: Web Audio API
- **Storage**: LocalStorage for game progress
- **Hosting**: Vercel (static hosting)
- **No Build Process**: Direct file serving

## 📱 Mobile Optimization

All games are fully responsive and optimized for mobile devices:
- Touch-friendly controls
- Responsive layouts
- Viewport optimization
- Debounced touch events

## 🧪 Testing

Comprehensive test suite with 100% pass rate:

```bash
# Run automated tests
node tests/run-tests.js

# Open interactive test suite
open tests/all-games-test-suite.html
```

**Test Coverage**: All 9 games tested across 8 categories with 72 tests passing.

## 🤝 Contributing

Feel free to contribute new games or improvements! Follow the patterns in `docs/PROJECT_PATTERN.md`.

## 📄 License

MIT License - Feel free to use for educational purposes.

## 👨‍👩‍👧‍👦 Created For

Made with ❤️ for my family - All games are free and suitable for all ages.

---

**Live Demo**: [https://gameniue.vercel.app](https://gameniue.vercel.app)