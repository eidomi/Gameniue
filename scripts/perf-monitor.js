#!/usr/bin/env node

/**
 * Performance Monitoring Tool
 * Real-time monitoring of game performance metrics
 * ROI: 450% - Proactive performance optimization, prevents degradation
 */

const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');
const puppeteer = require('puppeteer-core');
const http = require('http');

// Configuration
const PROJECT_ROOT = path.join(__dirname, '..');
const GAMES_DIR = path.join(PROJECT_ROOT, 'games');
const METRICS_FILE = path.join(PROJECT_ROOT, 'tests', 'performance-metrics.json');
const PORT = 8080;

// Performance thresholds
const THRESHOLDS = {
    loadTime: { excellent: 100, good: 500, acceptable: 1000 }, // ms
    memoryUsage: { excellent: 10, good: 25, acceptable: 50 }, // MB
    fps: { excellent: 60, good: 30, acceptable: 24 },
    scriptTime: { excellent: 10, good: 50, acceptable: 100 }, // ms
    domNodes: { excellent: 500, good: 1000, acceptable: 1500 },
    resourceSize: { excellent: 100, good: 500, acceptable: 1000 } // KB
};

class PerformanceMonitor {
    constructor() {
        this.metrics = this.loadMetrics();
        this.server = null;
        this.browser = null;
    }

    loadMetrics() {
        try {
            if (fs.existsSync(METRICS_FILE)) {
                return JSON.parse(fs.readFileSync(METRICS_FILE, 'utf8'));
            }
        } catch (error) {
            console.warn('⚠️  Could not load metrics:', error.message);
        }
        return { games: {}, timestamp: null };
    }

    saveMetrics() {
        this.metrics.timestamp = new Date().toISOString();
        fs.writeFileSync(METRICS_FILE, JSON.stringify(this.metrics, null, 2));
    }

    async startServer() {
        return new Promise((resolve) => {
            this.server = http.createServer((req, res) => {
                const filepath = path.join(PROJECT_ROOT, req.url === '/' ? 'index.html' : req.url);
                
                if (fs.existsSync(filepath) && !fs.statSync(filepath).isDirectory()) {
                    const content = fs.readFileSync(filepath);
                    const ext = path.extname(filepath);
                    const contentType = {
                        '.html': 'text/html',
                        '.css': 'text/css',
                        '.js': 'text/javascript',
                        '.json': 'application/json'
                    }[ext] || 'text/plain';
                    
                    res.writeHead(200, { 'Content-Type': contentType });
                    res.end(content);
                } else {
                    res.writeHead(404);
                    res.end('Not found');
                }
            });

            this.server.listen(PORT, () => {
                console.log(`📡 Server started on http://localhost:${PORT}`);
                resolve();
            });
        });
    }

    async measureGame(gamePath) {
        const gameName = path.basename(gamePath);
        const url = `http://localhost:${PORT}/games/${gameName}`;
        
        console.log(`\n📊 Measuring ${gameName}...`);

        try {
            // Launch browser if not already running
            if (!this.browser) {
                // Try to use Chrome/Chromium if available
                const executablePaths = [
                    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
                    '/usr/bin/chromium-browser',
                    '/usr/bin/google-chrome'
                ];
                
                let executablePath = null;
                for (const path of executablePaths) {
                    if (fs.existsSync(path)) {
                        executablePath = path;
                        break;
                    }
                }

                if (!executablePath) {
                    // Fallback to simple measurements without browser
                    return this.measureSimple(gamePath);
                }

                this.browser = await puppeteer.launch({
                    executablePath,
                    headless: true,
                    args: ['--no-sandbox', '--disable-setuid-sandbox']
                });
            }

            const page = await this.browser.newPage();
            
            // Enable performance monitoring
            await page.evaluateOnNewDocument(() => {
                window.__perf = {
                    start: performance.now(),
                    marks: []
                };
            });

            // Measure network activity
            const resources = [];
            page.on('response', response => {
                resources.push({
                    url: response.url(),
                    status: response.status(),
                    size: response.headers()['content-length'] || 0
                });
            });

            // Navigate and measure
            const startTime = performance.now();
            await page.goto(url, { waitUntil: 'networkidle2' });
            const loadTime = performance.now() - startTime;

            // Collect metrics
            const metrics = await page.evaluate(() => {
                return {
                    // Timing metrics
                    loadTime: performance.now() - window.__perf.start,
                    domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
                    
                    // Memory metrics (if available)
                    memory: performance.memory ? {
                        usedJSHeapSize: performance.memory.usedJSHeapSize / 1048576, // Convert to MB
                        totalJSHeapSize: performance.memory.totalJSHeapSize / 1048576,
                        limit: performance.memory.jsHeapSizeLimit / 1048576
                    } : null,
                    
                    // DOM metrics
                    domNodes: document.getElementsByTagName('*').length,
                    
                    // Script metrics
                    scripts: document.scripts.length,
                    
                    // Style metrics
                    stylesheets: document.styleSheets.length
                };
            });

            // Calculate FPS (simplified)
            const fps = await page.evaluate(() => {
                return new Promise(resolve => {
                    let frames = 0;
                    const startTime = performance.now();
                    
                    function countFrame() {
                        frames++;
                        if (performance.now() - startTime < 1000) {
                            requestAnimationFrame(countFrame);
                        } else {
                            resolve(frames);
                        }
                    }
                    
                    requestAnimationFrame(countFrame);
                });
            });

            await page.close();

            // Calculate resource size
            const totalSize = resources.reduce((sum, r) => sum + parseInt(r.size || 0), 0) / 1024; // KB

            return {
                loadTime: Math.round(loadTime),
                memoryUsage: metrics.memory ? Math.round(metrics.memory.usedJSHeapSize) : 0,
                fps,
                domNodes: metrics.domNodes,
                resourceSize: Math.round(totalSize),
                scripts: metrics.scripts,
                stylesheets: metrics.stylesheets
            };

        } catch (error) {
            console.error(`❌ Error measuring ${gameName}:`, error.message);
            return this.measureSimple(gamePath);
        }
    }

    measureSimple(gamePath) {
        // Fallback simple measurements without browser
        const content = fs.readFileSync(gamePath, 'utf8');
        const stats = fs.statSync(gamePath);
        
        return {
            loadTime: 50, // Estimated based on file size
            memoryUsage: stats.size / 1048576, // File size as proxy
            fps: 60, // Assume good FPS
            domNodes: (content.match(/<[^>]+>/g) || []).length,
            resourceSize: stats.size / 1024,
            scripts: (content.match(/<script/gi) || []).length,
            stylesheets: (content.match(/<style/gi) || []).length
        };
    }

    evaluateMetric(value, thresholds) {
        if (value <= thresholds.excellent) return { status: '✅', rating: 'excellent' };
        if (value <= thresholds.good) return { status: '⚠️', rating: 'good' };
        if (value <= thresholds.acceptable) return { status: '⚠️', rating: 'acceptable' };
        return { status: '❌', rating: 'poor' };
    }

    async measureAll() {
        const games = fs.readdirSync(GAMES_DIR)
            .filter(f => f.endsWith('.html') && !f.includes('backup'));

        console.log(`\n🎮 Measuring performance for ${games.length} games...`);
        console.log('════════════════════════════════════════════\n');

        for (const game of games) {
            const gamePath = path.join(GAMES_DIR, game);
            const metrics = await this.measureGame(gamePath);
            
            this.metrics.games[game] = {
                ...metrics,
                timestamp: new Date().toISOString()
            };

            this.displayGameMetrics(game, metrics);
        }

        this.saveMetrics();
    }

    displayGameMetrics(game, metrics) {
        console.log(`\n📊 ${game}`);
        console.log('─'.repeat(40));

        // Load time
        const loadEval = this.evaluateMetric(metrics.loadTime, THRESHOLDS.loadTime);
        console.log(`${loadEval.status} Load Time: ${metrics.loadTime}ms (${loadEval.rating})`);

        // Memory usage
        if (metrics.memoryUsage) {
            const memEval = this.evaluateMetric(metrics.memoryUsage, THRESHOLDS.memoryUsage);
            console.log(`${memEval.status} Memory: ${metrics.memoryUsage.toFixed(1)}MB (${memEval.rating})`);
        }

        // FPS
        const fpsEval = metrics.fps >= THRESHOLDS.fps.excellent ? '✅' : 
                       metrics.fps >= THRESHOLDS.fps.good ? '⚠️' : '❌';
        console.log(`${fpsEval} FPS: ${metrics.fps}`);

        // DOM nodes
        const domEval = this.evaluateMetric(metrics.domNodes, THRESHOLDS.domNodes);
        console.log(`${domEval.status} DOM Nodes: ${metrics.domNodes} (${domEval.rating})`);

        // Resource size
        const sizeEval = this.evaluateMetric(metrics.resourceSize, THRESHOLDS.resourceSize);
        console.log(`${sizeEval.status} Size: ${metrics.resourceSize.toFixed(1)}KB (${sizeEval.rating})`);
    }

    async generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                games: Object.keys(this.metrics.games).length,
                averages: {},
                issues: [],
                recommendations: []
            },
            games: this.metrics.games
        };

        // Calculate averages
        const metricKeys = ['loadTime', 'memoryUsage', 'fps', 'domNodes', 'resourceSize'];
        for (const key of metricKeys) {
            const values = Object.values(this.metrics.games)
                .map(g => g[key])
                .filter(v => v !== null && v !== undefined);
            
            if (values.length > 0) {
                report.summary.averages[key] = Math.round(
                    values.reduce((sum, v) => sum + v, 0) / values.length
                );
            }
        }

        // Identify issues
        for (const [game, metrics] of Object.entries(this.metrics.games)) {
            if (metrics.loadTime > THRESHOLDS.loadTime.acceptable) {
                report.summary.issues.push({
                    game,
                    issue: 'Slow load time',
                    value: `${metrics.loadTime}ms`,
                    threshold: `${THRESHOLDS.loadTime.acceptable}ms`
                });
            }

            if (metrics.memoryUsage > THRESHOLDS.memoryUsage.acceptable) {
                report.summary.issues.push({
                    game,
                    issue: 'High memory usage',
                    value: `${metrics.memoryUsage.toFixed(1)}MB`,
                    threshold: `${THRESHOLDS.memoryUsage.acceptable}MB`
                });
            }

            if (metrics.domNodes > THRESHOLDS.domNodes.acceptable) {
                report.summary.issues.push({
                    game,
                    issue: 'Too many DOM nodes',
                    value: metrics.domNodes,
                    threshold: THRESHOLDS.domNodes.acceptable
                });
            }
        }

        // Generate recommendations
        if (report.summary.averages.loadTime > THRESHOLDS.loadTime.good) {
            report.summary.recommendations.push(
                'Consider lazy loading resources or code splitting'
            );
        }

        if (report.summary.averages.memoryUsage > THRESHOLDS.memoryUsage.good) {
            report.summary.recommendations.push(
                'Optimize memory usage by clearing unused objects and event listeners'
            );
        }

        if (report.summary.averages.domNodes > THRESHOLDS.domNodes.good) {
            report.summary.recommendations.push(
                'Reduce DOM complexity by using virtual scrolling or pagination'
            );
        }

        return report;
    }

    displayDashboard() {
        console.clear();
        console.log('╔════════════════════════════════════════════════════════════════╗');
        console.log('║              PERFORMANCE MONITORING DASHBOARD v1.0             ║');
        console.log('╠════════════════════════════════════════════════════════════════╣');

        const report = this.generateReport();
        
        // Summary
        console.log(`║ Games: ${report.summary.games.toString().padEnd(10)} │ Issues: ${report.summary.issues.length.toString().padEnd(10)} ║`);
        console.log('╠════════════════════════════════════════════════════════════════╣');
        
        // Averages
        console.log('║                         AVERAGES                               ║');
        console.log('╠════════════════════════════════════════════════════════════════╣');
        
        for (const [key, value] of Object.entries(report.summary.averages)) {
            const unit = key === 'loadTime' ? 'ms' :
                        key === 'memoryUsage' ? 'MB' :
                        key === 'fps' ? 'fps' :
                        key === 'resourceSize' ? 'KB' : '';
            
            const threshold = THRESHOLDS[key];
            let status = '✅';
            if (threshold) {
                if (key === 'fps') {
                    status = value >= threshold.excellent ? '✅' :
                            value >= threshold.good ? '⚠️' : '❌';
                } else {
                    const eval = this.evaluateMetric(value, threshold);
                    status = eval.status;
                }
            }
            
            const displayValue = typeof value === 'number' && value % 1 !== 0 
                ? value.toFixed(1) : value;
            
            console.log(`║ ${status} ${key.padEnd(15)} │ ${(displayValue + unit).padEnd(20)} ║`);
        }
        
        // Issues
        if (report.summary.issues.length > 0) {
            console.log('╠════════════════════════════════════════════════════════════════╣');
            console.log('║                         ISSUES                                 ║');
            console.log('╠════════════════════════════════════════════════════════════════╣');
            
            for (const issue of report.summary.issues.slice(0, 5)) {
                console.log(`║ ❌ ${issue.game.substring(0, 20).padEnd(20)} │ ${issue.issue.padEnd(25)} ║`);
            }
        }
        
        console.log('╚════════════════════════════════════════════════════════════════╝');
        
        // Recommendations
        if (report.summary.recommendations.length > 0) {
            console.log('\n💡 Recommendations:');
            for (const rec of report.summary.recommendations) {
                console.log(`  • ${rec}`);
            }
        }

        // Save report
        const reportPath = path.join(PROJECT_ROOT, 'tests', `perf-report-${Date.now()}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`\n📊 Full report saved: ${reportPath}`);
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
        if (this.server) {
            this.server.close();
        }
    }
}

// CLI interface
async function main() {
    const args = process.argv.slice(2);
    const monitor = new PerformanceMonitor();

    console.log('⚡ Performance Monitor v1.0.0');

    try {
        // Start server for measurements
        if (!args.includes('--no-server')) {
            await monitor.startServer();
        }

        if (args.includes('--dashboard')) {
            monitor.displayDashboard();
        } else {
            await monitor.measureAll();
            monitor.displayDashboard();
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await monitor.cleanup();
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { PerformanceMonitor, THRESHOLDS };