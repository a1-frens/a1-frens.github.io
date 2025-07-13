// WinAmp Recreation JavaScript

class WinAmpPlayer {
    constructor() {
        this.isPlaying = false;
        this.currentTime = 23; // seconds
        this.totalTime = 226; // 3:46 in seconds
        this.currentTrack = 8;
        this.volume = 75;
        this.balance = 0;
        
        this.initializeComponents();
        this.setupEventListeners();
        this.startVisualizer();
        this.updateTimeDisplay();
    }
    
    initializeComponents() {
        // Get DOM elements
        this.playBtn = document.querySelector('.control-btn.play');
        this.pauseBtn = document.querySelector('.control-btn.pause');
        this.stopBtn = document.querySelector('.control-btn.stop');
        this.prevBtn = document.querySelector('.control-btn.prev');
        this.nextBtn = document.querySelector('.control-btn.next');
        this.timeDisplay = document.querySelector('.time-display');
        this.playlistTimeDisplay = document.querySelector('.playlist-time-display');
        this.volumeSlider = document.querySelector('.volume-slider .slider');
        this.balanceSlider = document.querySelector('.balance-slider .slider');
        this.visualizerCanvas = document.getElementById('visualizer');
        this.eqGraphCanvas = document.getElementById('eq-graph');
        
        // Initialize canvas contexts
        if (this.visualizerCanvas) {
            this.visualizerCtx = this.visualizerCanvas.getContext('2d');
        }
        if (this.eqGraphCanvas) {
            this.eqGraphCtx = this.eqGraphCanvas.getContext('2d');
        }
        
        // Set initial slider values
        if (this.volumeSlider) this.volumeSlider.value = this.volume;
        if (this.balanceSlider) this.balanceSlider.value = this.balance;
    }
    
    setupEventListeners() {
        // Play/Pause controls
        if (this.playBtn) {
            this.playBtn.addEventListener('click', () => this.play());
        }
        if (this.pauseBtn) {
            this.pauseBtn.addEventListener('click', () => this.pause());
        }
        if (this.stopBtn) {
            this.stopBtn.addEventListener('click', () => this.stop());
        }
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.previousTrack());
        }
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextTrack());
        }
        
        // Volume and balance sliders
        if (this.volumeSlider) {
            this.volumeSlider.addEventListener('input', (e) => {
                this.volume = e.target.value;
            });
        }
        if (this.balanceSlider) {
            this.balanceSlider.addEventListener('input', (e) => {
                this.balance = e.target.value;
            });
        }
        
        // Equalizer sliders
        const eqSliders = document.querySelectorAll('.eq-range');
        eqSliders.forEach((slider, index) => {
            slider.addEventListener('input', (e) => {
                this.updateEqualizer(index, e.target.value);
            });
        });
        
        // Playlist track selection
        const trackItems = document.querySelectorAll('.track-item');
        trackItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                this.selectTrack(index + 7); // Starting from track 7
            });
        });
        
        // Window controls
        const minimizeButtons = document.querySelectorAll('.minimize');
        const closeButtons = document.querySelectorAll('.close');
        
        minimizeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.minimizeWindow(e.target.closest('.main-player, .equalizer, .playlist'));
            });
        });
        
        closeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.closeWindow(e.target.closest('.main-player, .equalizer, .playlist'));
            });
        });
    }
    
    play() {
        this.isPlaying = true;
        this.playBtn.style.background = 'linear-gradient(to bottom, #c0c0c0, #a0a0a0)';
        this.playBtn.style.border = '1px inset #999';
        
        // Start time progression
        if (this.timeInterval) clearInterval(this.timeInterval);
        this.timeInterval = setInterval(() => {
            if (this.isPlaying && this.currentTime < this.totalTime) {
                this.currentTime++;
                this.updateTimeDisplay();
            }
        }, 1000);
    }
    
    pause() {
        this.isPlaying = false;
        this.playBtn.style.background = 'linear-gradient(to bottom, #e0e0e0, #c0c0c0)';
        this.playBtn.style.border = '1px outset #999';
        
        if (this.timeInterval) {
            clearInterval(this.timeInterval);
        }
    }
    
    stop() {
        this.isPlaying = false;
        this.currentTime = 0;
        this.updateTimeDisplay();
        
        this.playBtn.style.background = 'linear-gradient(to bottom, #e0e0e0, #c0c0c0)';
        this.playBtn.style.border = '1px outset #999';
        
        if (this.timeInterval) {
            clearInterval(this.timeInterval);
        }
    }
    
    previousTrack() {
        if (this.currentTrack > 1) {
            this.currentTrack--;
            this.updateTrackInfo();
        }
    }
    
    nextTrack() {
        this.currentTrack++;
        this.updateTrackInfo();
    }
    
    updateTimeDisplay() {
        const minutes = Math.floor(this.currentTime / 60);
        const seconds = this.currentTime % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (this.timeDisplay) {
            this.timeDisplay.textContent = timeString;
        }
        if (this.playlistTimeDisplay) {
            this.playlistTimeDisplay.textContent = timeString;
        }
    }
    
    updateTrackInfo() {
        // This would update track information based on currentTrack
        // For demo purposes, keeping it simple
    }
    
    selectTrack(trackNumber) {
        // Remove current selection
        const currentTrack = document.querySelector('.track-item.current');
        if (currentTrack) {
            currentTrack.classList.remove('current');
        }
        
        // Add selection to clicked track
        const trackItems = document.querySelectorAll('.track-item');
        const selectedIndex = trackNumber - 7; // Adjust for starting at track 7
        if (trackItems[selectedIndex]) {
            trackItems[selectedIndex].classList.add('current');
            this.currentTrack = trackNumber;
        }
    }
    
    updateEqualizer(band, value) {
        // Update equalizer visualization
        this.drawEqualizer();
    }
    
    startVisualizer() {
        if (!this.visualizerCtx) return;
        
        const drawVisualizer = () => {
            this.visualizerCtx.fillStyle = '#000';
            this.visualizerCtx.fillRect(0, 0, 152, 32);
            
            // Draw spectrum bars
            for (let i = 0; i < 20; i++) {
                const barHeight = Math.random() * 28 + 2;
                const barWidth = 6;
                const x = i * 7 + 2;
                const y = 32 - barHeight;
                
                // Create gradient from green to yellow to red
                const gradient = this.visualizerCtx.createLinearGradient(0, 32, 0, 0);
                gradient.addColorStop(0, '#00ff00');
                gradient.addColorStop(0.6, '#ffff00');
                gradient.addColorStop(1, '#ff0000');
                
                this.visualizerCtx.fillStyle = gradient;
                this.visualizerCtx.fillRect(x, y, barWidth, barHeight);
            }
            
            requestAnimationFrame(drawVisualizer);
        };
        
        drawVisualizer();
    }
    
    drawEqualizer() {
        if (!this.eqGraphCtx) return;
        
        this.eqGraphCtx.fillStyle = '#000';
        this.eqGraphCtx.fillRect(0, 0, 250, 60);
        
        // Draw EQ curve
        const eqSliders = document.querySelectorAll('.eq-range');
        this.eqGraphCtx.strokeStyle = '#ffa500';
        this.eqGraphCtx.lineWidth = 2;
        this.eqGraphCtx.beginPath();
        
        eqSliders.forEach((slider, index) => {
            const value = parseFloat(slider.value);
            const x = (index * 25) + 12;
            const y = 30 - (value * 1.5); // Convert dB to pixels
            
            if (index === 0) {
                this.eqGraphCtx.moveTo(x, y);
            } else {
                this.eqGraphCtx.lineTo(x, y);
            }
        });
        
        this.eqGraphCtx.stroke();
    }
    
    minimizeWindow(window) {
        if (window) {
            window.style.transform = 'scale(0.1)';
            window.style.opacity = '0.3';
            setTimeout(() => {
                window.style.transform = 'scale(1)';
                window.style.opacity = '1';
            }, 200);
        }
    }
    
    closeWindow(window) {
        if (window) {
            window.style.opacity = '0';
            window.style.transform = 'scale(0.8)';
        }
    }
}

// Initialize WinAmp when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WinAmpPlayer();
});

// Add some extra visual effects
document.addEventListener('DOMContentLoaded', () => {
    // Make buttons feel more responsive
    const buttons = document.querySelectorAll('button, .control-btn, .eq-btn, .playlist-btn, .small-btn');
    
    buttons.forEach(button => {
        button.addEventListener('mousedown', () => {
            button.style.transform = 'scale(0.95)';
        });
        
        button.addEventListener('mouseup', () => {
            button.style.transform = 'scale(1)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'scale(1)';
        });
    });
    
    // Add hover effects to track items
    const trackItems = document.querySelectorAll('.track-item');
    trackItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            if (!item.classList.contains('current')) {
                item.style.backgroundColor = '#004080';
            }
        });
        
        item.addEventListener('mouseleave', () => {
            if (!item.classList.contains('current')) {
                item.style.backgroundColor = 'transparent';
            }
        });
    });
});
