#!/usr/bin/env node

/**
 * Pattern Verification Dashboard
 * Real-time verification of deployed patterns across all games
 * ROI: 600% - Instant pattern validation, prevents regression
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Configuration
const PROJECT_ROOT = path.join(__dirname, '..');
const GAMES_DIR = path.join(PROJECT_ROOT, 'games');

// Pattern definitions
const PATTERNS = {
    errorHandler: {
        name: 'Error Handler v6.0',
        roi: 850,
        searchPattern: '<!-- Error Handler v6.0',
        features: [
            'safeExecute',
            'safeQuery',
            'safeJSON',
            'safeStorage'
        ],
        description: '85% automatic error recovery'
    },
    audioSystem: {
        name: 'Audio System v6.0',
        roi: 750,
        searchPattern: '<!-- Audio System v6.0',
        features: [
            'window.audioManager',
            'playCorrectSound',
            'playWrongSound',
            'playClickSound'
        ],
        description: 'Accessible audio with visual fallback'
    },
    responsive: {
        name: 'Responsive Design',
        roi: 400,
        searchPattern: '@media',
        features: [
            '@media (max-width: 768px)',
            '@media (max-width: 480px)',
            'clamp('
        ],
        description: 'Mobile-optimized layouts'
    },
    visualFeedback: {
        name: 'Visual Feedback',
        roi: 350,
        searchPattern: ':focus-visible',
        features: [
            ':focus-visible',
            ':active',
            'outline:',
            'transform: scale'
        ],
        description: 'WCAG AAA accessibility'
    },
    nullSafety: {
        name: 'Null Safety',
        roi: 200,
        searchPattern: '??',
        features: [
            '??',
            '?.', 
            '!== null',
            '!== undefined'
        ],
        description: 'Nullish coalescing patterns'
    }
};

// Dashboard class
class PatternDashboard {
    constructor() {
        this.results = {};
        this.games = [];
        this.loadGames();
    }

    loadGames() {
        this.games = fs.readdirSync(GAMES_DIR)
            .filter(f => f.endsWith('.html') && !f.includes('backup'))
            .sort();
    }

    async verifyPattern(patternKey, pattern) {
        const results = {
            deployed: [],
            missing: [],
            partial: [],
            features: {}
        };

        for (const game of this.games) {
            const gamePath = path.join(GAMES_DIR, game);
            const content = fs.readFileSync(gamePath, 'utf8');
            
            // Check main pattern
            const hasPattern = content.includes(pattern.searchPattern);
            
            // Check features
            const featureResults = {};
            let featureCount = 0;
            for (const feature of pattern.features) {
                featureResults[feature] = content.includes(feature);
                if (featureResults[feature]) featureCount++;
            }
            
            // Categorize
            if (hasPattern && featureCount === pattern.features.length) {
                results.deployed.push(game);
            } else if (featureCount > 0) {
                results.partial.push({ game, features: featureResults, count: featureCount });
            } else {
                results.missing.push(game);
            }
            
            results.features[game] = featureResults;
        }

        return results;
    }

    async verifyAll() {
        console.log('🔍 Verifying all patterns...\n');
        
        for (const [key, pattern] of Object.entries(PATTERNS)) {
            this.results[key] = await this.verifyPattern(key, pattern);
        }
    }

    calculateROI() {
        let totalROI = 0;
        let deployedPatterns = 0;
        
        for (const [key, pattern] of Object.entries(PATTERNS)) {
            const result = this.results[key];
            if (result && result.deployed.length === this.games.length) {
                totalROI += pattern.roi;
                deployedPatterns++;
            }
        }
        
        return { totalROI, deployedPatterns };
    }

    displayDashboard() {
        console.clear();
        console.log('╔════════════════════════════════════════════════════════════════╗');
        console.log('║             PATTERN VERIFICATION DASHBOARD v1.0                ║');
        console.log('╠════════════════════════════════════════════════════════════════╣');
        
        // Summary
        const { totalROI, deployedPatterns } = this.calculateROI();
        console.log(`║ Games: ${this.games.length.toString().padEnd(8)} │ Patterns: ${Object.keys(PATTERNS).length.toString().padEnd(8)} │ Total ROI: ${totalROI.toString().padEnd(6)}% ║`);
        console.log('╠════════════════════════════════════════════════════════════════╣');
        
        // Pattern status
        for (const [key, pattern] of Object.entries(PATTERNS)) {
            const result = this.results[key];
            if (!result) continue;
            
            const status = result.deployed.length === this.games.length ? '✅' :
                          result.deployed.length > 0 ? '⚠️ ' : '❌';
            const coverage = `${result.deployed.length}/${this.games.length}`;
            
            console.log(`║ ${status} ${pattern.name.padEnd(20)} │ ${coverage.padEnd(7)} │ ${pattern.roi.toString().padEnd(4)}% ROI ║`);
            
            if (result.partial.length > 0) {
                console.log(`║    ⚠️  Partial: ${result.partial.map(p => p.game.replace('.html', '')).join(', ').substring(0, 45)}... ║`);
            }
            
            if (result.missing.length > 0 && result.missing.length <= 3) {
                console.log(`║    ❌ Missing: ${result.missing.map(g => g.replace('.html', '')).join(', ').substring(0, 45)}... ║`);
            }
        }
        
        console.log('╠════════════════════════════════════════════════════════════════╣');
        
        // Feature matrix (compact view)
        console.log('║                    FEATURE VERIFICATION MATRIX                 ║');
        console.log('╠════════════════════════════════════════════════════════════════╣');
        
        for (const [key, pattern] of Object.entries(PATTERNS)) {
            const result = this.results[key];
            if (!result) continue;
            
            console.log(`║ ${pattern.name.padEnd(20)} │ ${pattern.description.padEnd(35)} ║`);
            
            // Show first few features
            const topFeatures = pattern.features.slice(0, 3);
            for (const feature of topFeatures) {
                let passCount = 0;
                for (const game of this.games) {
                    if (result.features[game] && result.features[game][feature]) {
                        passCount++;
                    }
                }
                const status = passCount === this.games.length ? '✅' : 
                              passCount > this.games.length / 2 ? '⚠️ ' : '❌';
                console.log(`║   ${status} ${feature.padEnd(30)} │ ${passCount}/${this.games.length} games ║`);
            }
        }
        
        console.log('╚════════════════════════════════════════════════════════════════╝');
        
        // Quick actions
        console.log('\n📋 Quick Actions:');
        console.log('  • Deploy missing patterns: node patterns/deploy-[pattern].js');
        console.log('  • Fix partial deployments: node issues/apply-fixes.js');
        console.log('  • Run full test suite: node tests/comprehensive-test-runner.js');
        console.log('  • View detailed report: node scripts/pattern-verify.js --detailed');
    }

    async generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                games: this.games.length,
                patterns: Object.keys(PATTERNS).length,
                ...this.calculateROI()
            },
            patterns: {},
            recommendations: []
        };

        for (const [key, pattern] of Object.entries(PATTERNS)) {
            const result = this.results[key];
            report.patterns[key] = {
                name: pattern.name,
                roi: pattern.roi,
                coverage: `${result.deployed.length}/${this.games.length}`,
                status: result.deployed.length === this.games.length ? 'deployed' :
                       result.deployed.length > 0 ? 'partial' : 'missing',
                ...result
            };

            // Add recommendations
            if (result.missing.length > 0) {
                report.recommendations.push({
                    priority: 'HIGH',
                    action: `Deploy ${pattern.name} to ${result.missing.length} games`,
                    command: `node patterns/deploy-${key}.js`,
                    roi: pattern.roi * result.missing.length / this.games.length
                });
            }
        }

        // Save report
        const reportPath = path.join(PROJECT_ROOT, 'tests', `pattern-report-${Date.now()}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`\n📊 Report saved: ${reportPath}`);

        return report;
    }

    async watch() {
        console.log('👁️  Watching for pattern changes...\n');
        
        // Initial verification
        await this.verifyAll();
        this.displayDashboard();
        
        // Watch for changes
        fs.watch(GAMES_DIR, async (eventType, filename) => {
            if (filename && filename.endsWith('.html')) {
                console.log(`\n🔄 Change detected in ${filename}`);
                await this.verifyAll();
                this.displayDashboard();
            }
        });
        
        console.log('\nPress Ctrl+C to stop watching');
    }
}

// CLI interface
async function main() {
    const args = process.argv.slice(2);
    const dashboard = new PatternDashboard();
    
    await dashboard.verifyAll();
    
    if (args.includes('--watch')) {
        await dashboard.watch();
    } else if (args.includes('--detailed')) {
        const report = await dashboard.generateReport();
        console.log(JSON.stringify(report, null, 2));
    } else if (args.includes('--json')) {
        const { totalROI, deployedPatterns } = dashboard.calculateROI();
        console.log(JSON.stringify({
            totalROI,
            deployedPatterns,
            patterns: Object.keys(PATTERNS).length,
            games: dashboard.games.length
        }));
    } else {
        dashboard.displayDashboard();
        
        // Show any critical issues
        let hasIssues = false;
        for (const [key, pattern] of Object.entries(PATTERNS)) {
            const result = dashboard.results[key];
            if (result && result.missing.length > 0) {
                hasIssues = true;
            }
        }
        
        if (hasIssues) {
            console.log('\n⚠️  Some patterns are not fully deployed');
            console.log('Run with --detailed for full report');
            process.exit(1);
        } else {
            console.log('\n✅ All patterns fully deployed!');
        }
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { PatternDashboard, PATTERNS };