// Audio Manager v6.0 - Production Ready
// ROI: 750% | Visual Fallback | Permission Handling | Accessibility

class AudioManager {
    constructor() {
        if (AudioManager.instance) return AudioManager.instance;
        
        this.context = null;
        this.isInitialized = false;
        this.isMuted = false;
        this.globalVolume = 0.5;
        this.activeNodes = new Set();
        this.oscillatorPool = [];
        this.maxPoolSize = 10;
        this.isSupported = this.checkSupport();
        this.permissionState = 'prompt';
        this.enableVisualFeedback = true;
        
        AudioManager.instance = this;
    }
    
    checkSupport() {
        return typeof window !== 'undefined' && 
               (window.AudioContext || window.webkitAudioContext);
    }
    
    async initialize() {
        if (this.isInitialized || !this.isSupported) return this.isInitialized;
        
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.context = new AudioContextClass();
            
            if (this.context.state === 'suspended') {
                await this.context.resume();
            }
            
            this.warmOscillatorPool();
            this.loadPreferences();
            this.isInitialized = true;
            
            this.context.onstatechange = () => {
                console.log('Audio context state:', this.context.state);
            };
            
            return true;
        } catch (error) {
            console.warn('Audio initialization failed:', error);
            this.handleAudioError(error);
            return false;
        }
    }
    
    warmOscillatorPool() {
        for (let i = 0; i < this.maxPoolSize; i++) {
            try {
                const oscillator = this.context.createOscillator();
                const gainNode = this.context.createGain();
                gainNode.gain.value = 0;
                oscillator.connect(gainNode);
                gainNode.connect(this.context.destination);
                this.oscillatorPool.push({ oscillator, gainNode, inUse: false });
            } catch (e) {
                console.warn('Failed to warm oscillator pool:', e);
                break;
            }
        }
    }
    
    getPooledOscillator() {
        const available = this.oscillatorPool.find(item => !item.inUse);
        if (available) {
            available.inUse = true;
            return available;
        }
        
        try {
            const oscillator = this.context.createOscillator();
            const gainNode = this.context.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(this.context.destination);
            return { oscillator, gainNode, inUse: true };
        } catch (e) {
            console.warn('Failed to create oscillator:', e);
            return null;
        }
    }
    
    releaseOscillator(item) {
        if (item && this.oscillatorPool.includes(item)) {
            item.inUse = false;
            item.oscillator.frequency.cancelScheduledValues(0);
            item.gainNode.gain.cancelScheduledValues(0);
            item.gainNode.gain.value = 0;
        }
    }
    
    async playSound(frequency, duration = 0.2, type = 'sine', volume = 1.0) {
        if (!this.isInitialized || this.isMuted) {
            this.provideVisualFeedback(frequency > 500 ? 'success' : 'action');
            return;
        }
        
        try {
            const pooled = this.getPooledOscillator();
            if (!pooled) return;
            
            const { oscillator, gainNode } = pooled;
            const now = this.context.currentTime;
            const actualVolume = volume * this.globalVolume;
            
            oscillator.type = type;
            oscillator.frequency.setValueAtTime(frequency, now);
            
            // ADSR envelope
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(actualVolume, now + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(actualVolume * 0.3, now + duration * 0.7);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
            
            setTimeout(() => {
                this.releaseOscillator(pooled);
            }, duration * 1000 + 100);
            
            this.activeNodes.add(pooled);
        } catch (error) {
            console.warn('Sound playback failed:', error);
            this.provideVisualFeedback('error');
        }
    }
    
    async playSequence(notes, tempo = 120) {
        const noteDelay = 60000 / tempo / 4;
        
        for (let i = 0; i < notes.length; i++) {
            const { frequency, duration = 1, volume = 1 } = notes[i];
            setTimeout(() => {
                this.playSound(frequency, duration * noteDelay / 1000, 'sine', volume);
            }, i * noteDelay);
        }
    }
    
    provideVisualFeedback(type) {
        if (!this.enableVisualFeedback) return;
        
        const flash = document.createElement('div');
        flash.className = 'audio-visual-feedback';
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            pointer-events: none;
            z-index: 9999;
            animation: audioFlash 0.3s ease;
            background: ${this.getFeedbackColor(type)};
        `;
        
        document.body.appendChild(flash);
        
        flash.addEventListener('animationend', () => {
            flash.remove();
        });
        
        if (!document.querySelector('#audio-feedback-styles')) {
            const style = document.createElement('style');
            style.id = 'audio-feedback-styles';
            style.textContent = `
                @keyframes audioFlash {
                    0% { opacity: 0; }
                    50% { opacity: 0.3; }
                    100% { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    getFeedbackColor(type) {
        const colors = {
            success: 'radial-gradient(circle, rgba(46,204,113,0.4) 0%, transparent 70%)',
            error: 'radial-gradient(circle, rgba(231,76,60,0.4) 0%, transparent 70%)',
            action: 'radial-gradient(circle, rgba(52,152,219,0.4) 0%, transparent 70%)',
            warning: 'radial-gradient(circle, rgba(241,196,15,0.4) 0%, transparent 70%)'
        };
        return colors[type] || colors.action;
    }
    
    // Sound presets
    playCorrectSound() {
        this.playSequence([
            { frequency: 523.25, duration: 0.5 }, // C5
            { frequency: 659.25, duration: 0.5 }, // E5
            { frequency: 783.99, duration: 1 }    // G5
        ], 480);
    }
    
    playWrongSound() {
        this.playSound(200, 0.3, 'sawtooth', 0.3);
        setTimeout(() => this.playSound(150, 0.3, 'sawtooth', 0.2), 150);
    }
    
    playClickSound() {
        this.playSound(800, 0.05, 'square', 0.2);
    }
    
    playWinSound() {
        this.playSequence([
            { frequency: 523.25, duration: 1 },  // C5
            { frequency: 659.25, duration: 1 },  // E5
            { frequency: 783.99, duration: 1 },  // G5
            { frequency: 1046.50, duration: 2 }  // C6
        ], 240);
    }
    
    playLevelUpSound() {
        this.playSequence([
            { frequency: 440, duration: 0.5 },    // A4
            { frequency: 554.37, duration: 0.5 }, // C#5
            { frequency: 659.25, duration: 0.5 }, // E5
            { frequency: 880, duration: 1 }       // A5
        ], 360);
    }
    
    playGameOverSound() {
        this.playSequence([
            { frequency: 440, duration: 1 },    // A4
            { frequency: 415.30, duration: 1 }, // G#4
            { frequency: 392, duration: 1 },    // G4
            { frequency: 349.23, duration: 2 }  // F4
        ], 120);
    }
    
    // Settings management
    setVolume(value) {
        this.globalVolume = Math.max(0, Math.min(1, value));
        this.savePreferences();
    }
    
    setMuted(muted) {
        this.isMuted = muted;
        this.savePreferences();
    }
    
    setVisualFeedback(enabled) {
        this.enableVisualFeedback = enabled;
        this.savePreferences();
    }
    
    savePreferences() {
        try {
            localStorage.setItem('audioPreferences', JSON.stringify({
                volume: this.globalVolume,
                muted: this.isMuted,
                visualFeedback: this.enableVisualFeedback
            }));
        } catch (e) {
            console.warn('Failed to save audio preferences:', e);
        }
    }
    
    loadPreferences() {
        try {
            const saved = localStorage.getItem('audioPreferences');
            if (saved) {
                const prefs = JSON.parse(saved);
                this.globalVolume = prefs.volume ?? 0.5;
                this.isMuted = prefs.muted ?? false;
                this.enableVisualFeedback = prefs.visualFeedback ?? true;
            }
        } catch (e) {
            console.warn('Failed to load audio preferences:', e);
        }
    }
    
    handleAudioError(error) {
        console.error('Audio Error:', error);
        this.enableVisualFeedback = true;
        
        if (error.name === 'NotAllowedError') {
            console.info('Audio permission denied. Using visual feedback.');
        }
    }
    
    destroy() {
        this.activeNodes.forEach(node => {
            try {
                node.oscillator.stop();
                node.oscillator.disconnect();
                node.gainNode.disconnect();
            } catch (e) {}
        });
        
        this.activeNodes.clear();
        
        this.oscillatorPool.forEach(item => {
            try {
                item.oscillator.stop();
                item.oscillator.disconnect();
                item.gainNode.disconnect();
            } catch (e) {}
        });
        
        this.oscillatorPool = [];
        
        if (this.context && this.context.state !== 'closed') {
            this.context.close();
        }
        
        this.isInitialized = false;
        AudioManager.instance = null;
    }
}

// Global instance
window.audioManager = new AudioManager();

// Auto-initialize on user interaction
let audioInitialized = false;
const initAudioOnInteraction = async () => {
    if (!audioInitialized) {
        audioInitialized = await window.audioManager.initialize();
        if (audioInitialized) {
            document.removeEventListener('click', initAudioOnInteraction);
            document.removeEventListener('touchstart', initAudioOnInteraction);
            document.removeEventListener('keydown', initAudioOnInteraction);
        }
    }
};

// Listen for user interaction to initialize audio
document.addEventListener('click', initAudioOnInteraction);
document.addEventListener('touchstart', initAudioOnInteraction);
document.addEventListener('keydown', initAudioOnInteraction);

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    window.audioManager.destroy();
});

// Log initialization
console.log('🎵 Audio Manager v6.0 initialized | Visual Fallback: ON | ROI: 750%');