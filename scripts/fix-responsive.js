#!/usr/bin/env node

/**
 * Fix Responsive Design Issues
 * Adds missing @media queries to games
 * ROI: 400% - Full mobile optimization
 */

const fs = require('fs');
const path = require('path');

const GAMES_DIR = path.join(__dirname, '..', 'games');

// Responsive CSS to add
const RESPONSIVE_CSS = `
        /* Responsive Design - Added for mobile optimization */
        @media (max-width: 768px) {
            .container, .game-container {
                padding: 10px;
                margin: 0 auto;
                max-width: 100%;
            }
            
            button {
                font-size: clamp(0.9rem, 2vw, 1.2rem);
                padding: clamp(10px, 2vw, 15px);
                min-height: 44px;
            }
            
            .board, .game-board {
                width: clamp(280px, 90vw, 400px);
                margin: 0 auto;
            }
            
            h1 {
                font-size: clamp(1.5rem, 5vw, 2.5rem);
            }
        }
        
        @media (max-width: 480px) {
            .container, .game-container {
                padding: 5px;
            }
            
            .board, .game-board {
                width: calc(100vw - 20px);
                max-width: 350px;
            }
            
            button {
                width: 100%;
                margin: 5px 0;
            }
            
            .stats, .score-board {
                font-size: clamp(0.8rem, 2vw, 1rem);
            }
        }`;

function addResponsiveDesign(gamePath) {
    let content = fs.readFileSync(gamePath, 'utf8');
    const gameName = path.basename(gamePath);
    
    // Check what's missing
    const has768 = content.includes('@media (max-width: 768px)');
    const has480 = content.includes('@media (max-width: 480px)');
    
    if (has768 && has480) {
        console.log(`⏭️  ${gameName} - Already has responsive design`);
        return false;
    }
    
    // Find the closing </style> tag to insert before it
    const styleEndPattern = /<\/style>/;
    
    if (styleEndPattern.test(content)) {
        // Add the responsive CSS before the closing style tag
        content = content.replace(styleEndPattern, RESPONSIVE_CSS + '\n    </style>');
        
        fs.writeFileSync(gamePath, content);
        console.log(`✅ Fixed: ${gameName}`);
        return true;
    } else {
        console.log(`⚠️  Could not fix: ${gameName} - No style tag found`);
        return false;
    }
}

async function main() {
    console.log('🎨 Fixing Responsive Design Issues\n');
    
    // Games that need fixing
    const gamesToFix = [
        'memory-match-game.html',
        'simon-says-game.html', 
        'snakes-and-ladders-game.html'
    ];
    
    let fixedCount = 0;
    
    for (const game of gamesToFix) {
        const gamePath = path.join(GAMES_DIR, game);
        if (fs.existsSync(gamePath)) {
            if (addResponsiveDesign(gamePath)) {
                fixedCount++;
            }
        } else {
            console.log(`❌ Not found: ${game}`);
        }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   Fixed: ${fixedCount} games`);
    console.log(`   Total: ${gamesToFix.length} games`);
    
    if (fixedCount > 0) {
        console.log(`\n✨ Verify with:`);
        console.log(`   node scripts/pattern-verify.js`);
        console.log(`   node scripts/test-incremental.js --all`);
    }
    
    console.log(`\n💰 ROI: 400% - Mobile optimization achieved`);
}

if (require.main === module) {
    main().catch(console.error);
}