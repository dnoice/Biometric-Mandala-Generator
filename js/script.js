/**
 * Biometric Mandala Generator
 * Advanced version with enhanced UX, accessibility, and mobile-first design
 */

class BiometricMandalaGenerator {
    constructor() {
        // Core canvas and rendering
        this.canvas = null;
        this.project = null;
        this.mandalaGroup = null;
        this.animationGroup = null;
        this.chart = null;
        
        // Animation and performance
        this.isAnimating = true;
        this.animationFrame = null;
        this.fps = 60;
        this.frameCount = 0;
        this.lastTime = 0;
        this.performanceMonitor = {
            frameTimestamps: [],
            averageFPS: 60
        };
        
        // State tracking
        this.patternCount = 0;
        this.complexityScore = 0;
        this.sessionStartTime = Date.now();
        this.generationQueue = [];
        this.isGenerating = false;
        
        // Touch and interaction
        this.touchState = {
            isTouch: false,
            lastTap: 0,
            pinchDistance: 0,
            isZooming: false
        };
        
        // Audio context for ambient sounds
        this.audioContext = null;
        this.ambientSounds = {
            enabled: false,
            oscillator: null,
            gainNode: null
        };
        
        // Biometric data with enhanced ranges
        this.biometrics = {
            heartRate: 72,
            sleepHours: 8.0,
            steps: 8000,
            mood: 7,
            stress: 3,
            energy: 6
        };
        
        // Enhanced color palettes with emotional mapping
        this.colorPalettes = {
            1: { 
                name: 'Deep Melancholy',
                colors: ['#8B0000', '#4B0000', '#2F1B14'],
                emotion: 'distressed'
            },
            2: { 
                name: 'Gentle Sadness',
                colors: ['#CD5C5C', '#8B4513', '#A0522D'],
                emotion: 'sad'
            },
            3: { 
                name: 'Restless Energy',
                colors: ['#FF6347', '#FF4500', '#DA70D6'],
                emotion: 'restless'
            },
            4: { 
                name: 'Seeking Balance',
                colors: ['#FFD700', '#FF8C00', '#FFA500'],
                emotion: 'searching'
            },
            5: { 
                name: 'Neutral Harmony',
                colors: ['#F0E68C', '#BDB76B', '#9ACD32'],
                emotion: 'neutral'
            },
            6: { 
                name: 'Gentle Optimism',
                colors: ['#98FB98', '#90EE90', '#00FA9A'],
                emotion: 'hopeful'
            },
            7: { 
                name: 'Vibrant Joy',
                colors: ['#00CED1', '#20B2AA', '#48D1CC'],
                emotion: 'happy'
            },
            8: { 
                name: 'Radiant Bliss',
                colors: ['#87CEEB', '#87CEFA', '#00BFFF'],
                emotion: 'joyful'
            },
            9: { 
                name: 'Ethereal Ecstasy',
                colors: ['#9370DB', '#8A2BE2', '#9932CC'],
                emotion: 'ecstatic'
            },
            10: { 
                name: 'Divine Unity',
                colors: ['#E6E6FA', '#DDA0DD', '#DA70D6'],
                emotion: 'transcendent'
            }
        };
        
        // Pattern templates based on complexity and stress
        this.patternTemplates = {
            calm: ['circle', 'lotus', 'spiral'],
            moderate: ['triangle', 'diamond', 'star'],
            intense: ['spike', 'fractal', 'lightning']
        };
        
        // Preset configurations
        this.presets = {
            morning: {
                heartRate: 65,
                sleepHours: 7.5,
                steps: 2000,
                mood: 6,
                stress: 2,
                energy: 7
            },
            evening: {
                heartRate: 70,
                sleepHours: 8.0,
                steps: 8500,
                mood: 7,
                stress: 4,
                energy: 5
            },
            workout: {
                heartRate: 140,
                sleepHours: 8.0,
                steps: 12000,
                mood: 8,
                stress: 3,
                energy: 9
            },
            meditation: {
                heartRate: 55,
                sleepHours: 9.0,
                steps: 3000,
                mood: 9,
                stress: 1,
                energy: 6
            }
        };
        
        this.init();
    }
    
    async init() {
        this.detectCapabilities();
        this.setupCanvas();
        this.setupControls();
        this.setupChart();
        this.setupParticleBackground();
        this.setupAccessibility();
        this.setupPerformanceMonitoring();
        this.setupTouchInteractions();
        this.startSessionTracking();
        
        // Initial generation with smooth intro
        await this.generateMandalaWithIntro();
        this.startAnimation();
        this.updateAllDisplays();
        
        // Setup periodic updates
        this.setupPeriodicUpdates();
        
        // Announce app ready to screen readers
        this.announce('Biometric Mandala Generator loaded and ready');
    }
    
    detectCapabilities() {
        // Detect device capabilities
        this.capabilities = {
            touch: 'ontouchstart' in window,
            devicePixelRatio: window.devicePixelRatio || 1,
            reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
            webAudio: !!(window.AudioContext || window.webkitAudioContext),
            webGL: !!document.createElement('canvas').getContext('webgl'),
            performance: !!window.performance
        };
        
        // Adjust settings based on capabilities
        if (this.capabilities.reducedMotion) {
            document.body.classList.add('reduced-motion');
        }
        
        if (this.capabilities.touch) {
            document.body.classList.add('touch-device');
        }
    }
    
    setupCanvas() {
        this.canvas = document.getElementById('mandalaCanvas');
        paper.setup(this.canvas);
        this.project = paper.project;
        
        // Create organized layer groups
        this.backgroundLayer = new paper.Group();
        this.mandalaGroup = new paper.Group();
        this.animationGroup = new paper.Group();
        this.effectsLayer = new paper.Group();
        
        // Handle responsive canvas
        this.handleCanvasResize();
        window.addEventListener('resize', () => this.debounce(this.handleCanvasResize.bind(this), 250));
        
        // Handle visibility changes for performance
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    }
    
    handleCanvasResize() {
        const container = document.querySelector('.mandala-container');
        const rect = container.getBoundingClientRect();
        
        // Account for high DPI displays
        const dpr = this.capabilities.devicePixelRatio;
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        if (paper.view) {
            paper.view.viewSize.width = rect.width;
            paper.view.viewSize.height = rect.height;
            
            // Regenerate mandala for new dimensions
            if (this.mandalaGroup && this.mandalaGroup.children.length > 0) {
                this.queueGeneration();
            }
        }
    }
    
    setupControls() {
        // Mobile menu toggle
        const menuToggle = document.getElementById('mobileMenuToggle');
        const controlPanel = document.getElementById('controlPanel');
        const closePanel = document.getElementById('closePanelBtn');
        
        menuToggle?.addEventListener('click', () => {
            controlPanel.classList.toggle('active');
            this.announce(controlPanel.classList.contains('active') ? 'Control panel opened' : 'Control panel closed');
        });
        
        closePanel?.addEventListener('click', () => {
            controlPanel.classList.remove('active');
            this.announce('Control panel closed');
        });
        
        // Biometric controls with enhanced feedback
        this.setupBiometricControl('heartRate', 'BPM', (value) => {
            this.biometrics.heartRate = parseInt(value);
            this.updateHeartRateEffects();
        });
        
        this.setupBiometricControl('sleepHours', 'Hours', (value) => {
            this.biometrics.sleepHours = parseFloat(value);
            this.updateComplexityEffects();
        });
        
        this.setupBiometricControl('steps', 'Steps', (value) => {
            this.biometrics.steps = parseInt(value);
            this.updateSizeEffects();
        });
        
        this.setupBiometricControl('mood', '/ 10', (value) => {
            this.biometrics.mood = parseInt(value);
            this.updateMoodEffects();
        });
        
        this.setupBiometricControl('stress', '/ 10', (value) => {
            this.biometrics.stress = parseInt(value);
            this.updateStressEffects();
        });
        
        this.setupBiometricControl('energy', '/ 10', (value) => {
            this.biometrics.energy = parseInt(value);
            this.updateEnergyEffects();
        });
        
        // Action buttons with enhanced feedback
        this.setupActionButton('regenerateBtn', this.regenerateMandala.bind(this), 'Regenerate mandala');
        this.setupActionButton('pauseBtn', this.toggleAnimation.bind(this), 'Toggle animation');
        this.setupActionButton('exportBtn', this.exportMandala.bind(this), 'Export mandala as image');
        this.setupActionButton('shareBtn', this.shareMandala.bind(this), 'Share mandala');
        this.setupActionButton('randomDataBtn', this.generateRandomData.bind(this), 'Generate random biometric data');
        this.setupActionButton('fullscreenBtn', this.toggleFullscreen.bind(this), 'Toggle fullscreen mode');
        
        // Quick action presets
        this.setupActionButton('quickStart', this.showQuickStartTutorial.bind(this), 'Show quick start tutorial');
        this.setupActionButton('presetMorning', () => this.applyPreset('morning'), 'Apply morning preset');
        this.setupActionButton('presetEvening', () => this.applyPreset('evening'), 'Apply evening preset');
        
        // Ambient sound toggle
        this.setupActionButton('ambientToggle', this.toggleAmbientSounds.bind(this), 'Toggle ambient sounds');
    }
    
    setupBiometricControl(id, unit, callback) {
        const slider = document.getElementById(id);
        const valueDisplay = document.getElementById(`${id}Value`);
        const inputGroup = slider?.closest('.input-group');
        
        if (!slider || !valueDisplay) return;
        
        // Enhanced input handling with debouncing
        const debouncedCallback = this.debounce(callback, 100);
        const debouncedUpdate = this.debounce(this.updateMandala.bind(this), 150);
        
        slider.addEventListener('input', (e) => {
            const value = e.target.value;
            
            // Update display immediately for responsiveness
            if (id === 'steps') {
                valueDisplay.textContent = parseInt(value).toLocaleString();
            } else if (id === 'sleepHours') {
                valueDisplay.textContent = parseFloat(value).toFixed(1);
            } else {
                valueDisplay.textContent = value;
            }
            
            // Update biometric data and effects
            debouncedCallback(value);
            debouncedUpdate();
            
            // Visual feedback
            this.addVisualFeedback(inputGroup);
            
            // Accessibility announcement
            this.announce(`${this.camelCaseToSpaced(id)} set to ${value} ${unit}`);
        });
        
        // Enhanced accessibility
        slider.setAttribute('aria-describedby', `${id}Effect`);
        
        // Touch-friendly adjustments
        if (this.capabilities.touch) {
            slider.addEventListener('touchstart', () => {
                inputGroup?.classList.add('active');
            });
            
            slider.addEventListener('touchend', () => {
                setTimeout(() => inputGroup?.classList.remove('active'), 150);
            });
        }
    }
    
    setupActionButton(id, callback, description) {
        const button = document.getElementById(id);
        if (!button) return;
        
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            
            // Prevent double-clicks
            if (button.disabled) return;
            button.disabled = true;
            
            // Visual feedback
            button.classList.add('active');
            this.addRippleEffect(button, e);
            
            try {
                await callback();
                this.announce(`${description} completed`);
            } catch (error) {
                console.error(`Error executing ${id}:`, error);
                this.showToast(`Error: ${error.message}`, 'error');
            } finally {
                // Re-enable button
                setTimeout(() => {
                    button.disabled = false;
                    button.classList.remove('active');
                }, 300);
            }
        });
        
        // Enhanced accessibility
        button.setAttribute('aria-label', description);
        
        // Keyboard navigation
        button.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                button.click();
            }
        });
    }
    
    setupChart() {
        const ctx = document.getElementById('dataChart')?.getContext('2d');
        if (!ctx) return;
        
        this.chart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Heart Rate', 'Sleep Quality', 'Activity', 'Mood', 'Energy', 'Calmness'],
                datasets: [{
                    label: 'Current Biometrics',
                    data: this.getBiometricChartData(),
                    backgroundColor: 'rgba(78, 205, 196, 0.15)',
                    borderColor: 'rgba(78, 205, 196, 0.8)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(255, 107, 107, 0.9)',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: 'rgba(78, 205, 196, 0.5)',
                        borderWidth: 1
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                            lineWidth: 1
                        },
                        angleLines: {
                            color: 'rgba(255, 255, 255, 0.15)',
                            lineWidth: 1
                        },
                        ticks: {
                            display: false,
                            maxTicksLimit: 5
                        },
                        pointLabels: {
                            color: 'rgba(255, 255, 255, 0.8)',
                            font: {
                                size: 11,
                                weight: '500'
                            },
                            padding: 10
                        }
                    }
                },
                animation: {
                    duration: this.capabilities.reducedMotion ? 0 : 800,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }
    
    getBiometricChartData() {
        return [
            Math.min(100, (this.biometrics.heartRate / 200) * 100), // Heart Rate (normalized)
            Math.min(100, (this.biometrics.sleepHours / 12) * 100), // Sleep Quality
            Math.min(100, (this.biometrics.steps / 20000) * 100),   // Activity Level
            this.biometrics.mood * 10,                              // Mood
            this.biometrics.energy * 10,                            // Energy
            (11 - this.biometrics.stress) * 10                      // Calmness (inverted stress)
        ];
    }
    
    setupParticleBackground() {
        const particleContainer = document.getElementById('particleBackground');
        if (!particleContainer) return;
        
        // Clear existing particles
        particleContainer.innerHTML = '';
        
        // Adjust particle count based on device performance
        const particleCount = this.capabilities.webGL ? 60 : 30;
        
        for (let i = 0; i < particleCount; i++) {
            this.createParticle(particleContainer, i);
        }
    }
    
    createParticle(container, index) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Randomized properties
        const size = Math.random() * 3 + 1;
        const speed = Math.random() * 20 + 15;
        const delay = Math.random() * 15;
        const opacity = Math.random() * 0.6 + 0.2;
        
        particle.style.left = Math.random() * 100 + '%';
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.animationDuration = speed + 's';
        particle.style.animationDelay = delay + 's';
        particle.style.opacity = opacity;
        
        // Color based on current mood
        const currentPalette = this.colorPalettes[this.biometrics.mood];
        const color = currentPalette.colors[index % currentPalette.colors.length];
        particle.style.background = color;
        
        container.appendChild(particle);
    }
    
    setupAccessibility() {
        // Setup screen reader announcements
        this.announcementElement = document.getElementById('announcements');
        
        // Add skip links for keyboard navigation
        this.addSkipLinks();
        
        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Add ARIA labels and descriptions
        this.enhanceAccessibility();
    }
    
    addSkipLinks() {
        const skipLinks = document.createElement('div');
        skipLinks.className = 'skip-links sr-only';
        skipLinks.innerHTML = `
            <a href="#controlPanel" class="skip-link">Skip to controls</a>
            <a href="#mandalaCanvas" class="skip-link">Skip to mandala</a>
        `;
        document.body.insertBefore(skipLinks, document.body.firstChild);
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only process shortcuts when not in input fields
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;
            
            switch (e.key.toLowerCase()) {
                case 'r':
                    e.preventDefault();
                    this.regenerateMandala();
                    break;
                case ' ':
                    e.preventDefault();
                    this.toggleAnimation();
                    break;
                case 'f':
                    e.preventDefault();
                    this.toggleFullscreen();
                    break;
                case 'd':
                    e.preventDefault();
                    this.generateRandomData();
                    break;
                case 'e':
                    e.preventDefault();
                    this.exportMandala();
                    break;
                case 'm':
                    e.preventDefault();
                    document.getElementById('controlPanel')?.classList.toggle('active');
                    break;
            }
        });
    }
    
    enhanceAccessibility() {
        // Add role and aria-label to main canvas
        if (this.canvas) {
            this.canvas.setAttribute('role', 'img');
            this.canvas.setAttribute('aria-label', 'Interactive biometric mandala visualization');
        }
        
        // Add live region for dynamic updates
        const mandalaContainer = document.querySelector('.mandala-container');
        if (mandalaContainer) {
            mandalaContainer.setAttribute('aria-live', 'polite');
            mandalaContainer.setAttribute('aria-atomic', 'false');
        }
    }
    
    setupPerformanceMonitoring() {
        if (!this.capabilities.performance) return;
        
        // Monitor frame rates
        this.performanceObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach(entry => {
                if (entry.entryType === 'measure') {
                    this.updatePerformanceMetrics(entry);
                }
            });
        });
        
        try {
            this.performanceObserver.observe({ entryTypes: ['measure', 'navigation'] });
        } catch (e) {
            console.warn('Performance observer not supported');
        }
    }
    
    setupTouchInteractions() {
        if (!this.capabilities.touch) return;
        
        const mandalaContainer = document.querySelector('.mandala-container');
        if (!mandalaContainer) return;
        
        let touchStartDistance = 0;
        let touchStartScale = 1;
        
        mandalaContainer.addEventListener('touchstart', (e) => {
            this.touchState.isTouch = true;
            
            if (e.touches.length === 2) {
                // Pinch start
                touchStartDistance = this.getTouchDistance(e.touches[0], e.touches[1]);
                this.touchState.isZooming = true;
            } else if (e.touches.length === 1) {
                // Single touch - check for double tap
                const now = Date.now();
                if (now - this.touchState.lastTap < 300) {
                    // Double tap detected
                    this.handleDoubleTap(e.touches[0]);
                }
                this.touchState.lastTap = now;
            }
        });
        
        mandalaContainer.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2 && this.touchState.isZooming) {
                e.preventDefault();
                const currentDistance = this.getTouchDistance(e.touches[0], e.touches[1]);
                const scale = currentDistance / touchStartDistance;
                this.handlePinchZoom(scale);
            }
        });
        
        mandalaContainer.addEventListener('touchend', () => {
            this.touchState.isZooming = false;
            setTimeout(() => {
                this.touchState.isTouch = false;
            }, 100);
        });
    }
    
    getTouchDistance(touch1, touch2) {
        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    handleDoubleTap(touch) {
        // Focus on mandala center with smooth animation
        this.focusOnMandala();
        this.announce('Mandala focused and centered');
    }
    
    handlePinchZoom(scale) {
        // Implement zoom functionality
        if (this.mandalaGroup) {
            const newScale = Math.max(0.5, Math.min(2.0, scale));
            this.mandalaGroup.scaling = newScale;
            paper.view.draw();
        }
    }
    
    startSessionTracking() {
        this.sessionStartTime = Date.now();
        
        // Update session time every second
        setInterval(() => {
            const elapsed = Date.now() - this.sessionStartTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            const display = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            const sessionTimeElement = document.getElementById('sessionTime');
            if (sessionTimeElement) {
                sessionTimeElement.textContent = display;
            }
        }, 1000);
    }
    
    async generateMandalaWithIntro() {
        this.showLoading();
        
        try {
            // Simulate generation steps for better UX
            await this.animateLoadingProgress();
            await this.generateMandala();
            
            // Smooth reveal animation
            anime({
                targets: this.canvas,
                opacity: [0, 1],
                scale: [0.8, 1],
                duration: this.capabilities.reducedMotion ? 100 : 1000,
                easing: 'easeOutBack',
                complete: () => {
                    this.hideLoading();
                    this.showToast('Your unique mandala has been generated!', 'success');
                }
            });
            
        } catch (error) {
            console.error('Error generating mandala:', error);
            this.hideLoading();
            this.showToast('Error generating mandala. Please try again.', 'error');
        }
    }
    
    async animateLoadingProgress() {
        const loadingBar = document.getElementById('loadingBar');
        if (!loadingBar) return;
        
        return new Promise(resolve => {
            anime({
                targets: loadingBar,
                width: ['0%', '100%'],
                duration: this.capabilities.reducedMotion ? 100 : 1500,
                easing: 'easeInOutQuart',
                complete: resolve
            });
        });
    }
    
    async generateMandala() {
        // Clear existing mandala with fade out
        if (this.mandalaGroup.children.length > 0) {
            await this.clearMandalaWithAnimation();
        }
        
        // Calculate mandala parameters
        const center = paper.view.center;
        const maxRadius = Math.min(paper.view.size.width, paper.view.size.height) * 0.35;
        
        // Dynamic sizing based on steps
        const activityLevel = Math.max(0.4, Math.min(1.2, this.biometrics.steps / 15000));
        const baseRadius = maxRadius * activityLevel;
        
        // Get current mood palette
        const palette = this.colorPalettes[this.biometrics.mood];
        
        // Calculate complexity based on sleep quality
        const complexity = Math.max(3, Math.min(12, Math.floor(this.biometrics.sleepHours * 1.5) + 2));
        this.complexityScore = complexity;
        
        // Determine pattern style based on stress
        const stressLevel = this.biometrics.stress;
        let patternStyle;
        if (stressLevel <= 3) patternStyle = 'calm';
        else if (stressLevel <= 6) patternStyle = 'moderate';
        else patternStyle = 'intense';
        
        // Generate mandala layers
        for (let layer = 0; layer < complexity; layer++) {
            await this.createAdvancedMandalaLayer(center, baseRadius, layer, complexity, palette, patternStyle);
            
            // Yield control to prevent blocking
            if (layer % 3 === 0) {
                await this.nextFrame();
            }
        }
        
        // Create central focal point
        this.createEnhancedCentralElement(center, palette, baseRadius);
        
        // Add energy-based effects
        this.addEnergyEffects(center, baseRadius, palette);
        
        // Update counters
        this.patternCount++;
        
        // Trigger initial animation
        this.animateMandalaBirth();
    }
    
    async createAdvancedMandalaLayer(center, baseRadius, layer, totalLayers, palette, patternStyle) {
        const layerRadius = baseRadius * (1 - (layer / totalLayers) * 0.6);
        const colorIndex = layer % palette.colors.length;
        const color = palette.colors[colorIndex];
        
        // Dynamic element count based on biometrics
        const heartRateInfluence = Math.max(6, Math.floor(this.biometrics.heartRate / 12));
        const elementsCount = heartRateInfluence + layer;
        
        // Create layer group
        const layerGroup = new paper.Group();
        
        // Generate elements based on pattern style
        for (let i = 0; i < elementsCount; i++) {
            const angle = (360 / elementsCount * i) * Math.PI / 180;
            const x = center.x + Math.cos(angle) * layerRadius;
            const y = center.y + Math.sin(angle) * layerRadius;
            
            let element;
            switch (patternStyle) {
                case 'calm':
                    element = this.createCalmElement(x, y, layerRadius, color, angle, layer);
                    break;
                case 'moderate':
                    element = this.createModerateElement(x, y, layerRadius, color, angle, layer);
                    break;
                case 'intense':
                    element = this.createIntenseElement(x, y, layerRadius, color, angle, layer);
                    break;
            }
            
            if (element) {
                layerGroup.addChild(element);
                this.animationGroup.addChild(element);
                
                // Add micro-animation delay for organic feel
                element.opacity = 0;
                anime({
                    targets: element,
                    opacity: [0, 0.8],
                    scale: [0, 1],
                    duration: this.capabilities.reducedMotion ? 50 : 300,
                    delay: i * 20,
                    easing: 'easeOutBack'
                });
            }
        }
        
        this.mandalaGroup.addChild(layerGroup);
    }
    
    createCalmElement(x, y, radius, color, angle, layer) {
        const energyMultiplier = this.biometrics.energy / 10;
        const size = (radius * 0.03 + layer * 0.005) * energyMultiplier;
        
        // Create soft, organic shapes
        const element = new paper.Path.Circle(new paper.Point(x, y), size);
        element.fillColor = color;
        element.strokeColor = new paper.Color(color).lighten(0.3);
        element.strokeWidth = 1;
        element.opacity = 0.7 + (layer * 0.02);
        
        // Add subtle gradient
        const gradient = new paper.Gradient([
            new paper.Color(color).lighten(0.2),
            new paper.Color(color).darken(0.1)
        ]);
        element.fillColor = new paper.Color(gradient, element.bounds.topLeft, element.bounds.bottomRight);
        
        return element;
    }
    
    createModerateElement(x, y, radius, color, angle, layer) {
        const energyMultiplier = this.biometrics.energy / 10;
        const size = (radius * 0.04 + layer * 0.008) * energyMultiplier;
        
        // Create geometric shapes with more definition
        const sides = 4 + Math.floor(layer / 2);
        const element = new paper.Path.RegularPolygon(new paper.Point(x, y), sides, size);
        element.fillColor = color;
        element.strokeColor = '#ffffff';
        element.strokeWidth = 1.5;
        element.opacity = 0.6 + (layer * 0.03);
        element.rotate(angle * 180 / Math.PI + layer * 15);
        
        return element;
    }
    
    createIntenseElement(x, y, radius, color, angle, layer) {
        const energyMultiplier = this.biometrics.energy / 10;
        const size = (radius * 0.05 + layer * 0.01) * energyMultiplier;
        
        // Create complex, dynamic shapes
        const spikes = 6 + layer;
        const element = new paper.Path.Star(new paper.Point(x, y), spikes, size * 0.4, size);
        element.fillColor = color;
        element.strokeColor = new paper.Color(color).lighten(0.5);
        element.strokeWidth = 2;
        element.opacity = 0.5 + (layer * 0.04);
        element.rotate(angle * 180 / Math.PI + layer * 30);
        
        // Add dynamic scaling based on stress
        const stressScale = 1 + (this.biometrics.stress / 20);
        element.scale(stressScale);
        
        return element;
    }
    
    createEnhancedCentralElement(center, palette, baseRadius) {
        const centralSize = 15 + (this.biometrics.mood * 2) + (this.biometrics.energy);
        
        // Create multi-layered central element
        const centralGroup = new paper.Group();
        
        // Outer ring
        const outerRing = new paper.Path.Circle(center, centralSize * 1.5);
        outerRing.strokeColor = palette.colors[0];
        outerRing.strokeWidth = 3;
        outerRing.opacity = 0.6;
        centralGroup.addChild(outerRing);
        
        // Main center
        const centralElement = new paper.Path.Circle(center, centralSize);
        const gradient = new paper.Gradient(palette.colors.map(color => new paper.Color(color)));
        centralElement.fillColor = new paper.Color(gradient, center.subtract([centralSize, 0]), center.add([centralSize, 0]));
        centralElement.strokeColor = '#ffffff';
        centralElement.strokeWidth = 2;
        centralGroup.addChild(centralElement);
        
        // Inner core
        const innerCore = new paper.Path.Circle(center, centralSize * 0.4);
        innerCore.fillColor = new paper.Color(palette.colors[palette.colors.length - 1]).lighten(0.3);
        innerCore.opacity = 0.8;
        centralGroup.addChild(innerCore);
        
        this.mandalaGroup.addChild(centralGroup);
        this.animationGroup.addChild(centralGroup);
    }
    
    addEnergyEffects(center, radius, palette) {
        if (this.biometrics.energy < 6) return;
        
        // Add energy aura for high energy levels
        const auraRadius = radius * 1.2;
        const aura = new paper.Path.Circle(center, auraRadius);
        aura.strokeColor = new paper.Color(palette.colors[0]).lighten(0.4);
        aura.strokeWidth = 2;
        aura.opacity = 0.3;
        aura.dashArray = [5, 5];
        
        this.effectsLayer.addChild(aura);
        this.animationGroup.addChild(aura);
        
        // Pulsing animation for high energy
        if (!this.capabilities.reducedMotion) {
            anime({
                targets: aura,
                opacity: [0.3, 0.7, 0.3],
                scale: [1, 1.05, 1],
                duration: 2000,
                easing: 'easeInOutSine',
                loop: true
            });
        }
    }
    
    animateMandalaBirth() {
        if (this.capabilities.reducedMotion) return;
        
        // Animate each layer with staggered timing
        this.mandalaGroup.children.forEach((layer, index) => {
            if (layer.children) {
                layer.children.forEach((element, elementIndex) => {
                    anime({
                        targets: element,
                        scale: [0, 1],
                        opacity: [0, element.opacity || 0.8],
                        rotate: [0, 360],
                        duration: 1500,
                        delay: (index * 100) + (elementIndex * 20),
                        easing: 'easeOutElastic(1, .8)'
                    });
                });
            }
        });
    }
    
    async clearMandalaWithAnimation() {
        if (this.capabilities.reducedMotion) {
            this.mandalaGroup.removeChildren();
            this.animationGroup.removeChildren();
            this.effectsLayer.removeChildren();
            return;
        }
        
        return new Promise(resolve => {
            anime({
                targets: this.mandalaGroup.children,
                scale: 0,
                opacity: 0,
                rotate: 180,
                duration: 500,
                delay: anime.stagger(50),
                easing: 'easeInBack',
                complete: () => {
                    this.mandalaGroup.removeChildren();
                    this.animationGroup.removeChildren();
                    this.effectsLayer.removeChildren();
                    resolve();
                }
            });
        });
    }
    
    startAnimation() {
        if (!this.isAnimating) return;
        
        const animate = (currentTime) => {
            if (!this.isAnimating) return;
            
            // Performance monitoring
            this.updateFrameRate(currentTime);
            
            // Dynamic rotation based on heart rate and energy
            const baseRotationSpeed = (this.biometrics.heartRate / 2000) * (this.biometrics.energy / 10);
            const breathingRate = 1000 + (this.biometrics.stress * 100);
            
            // Animate mandala elements
            if (this.animationGroup && this.animationGroup.children) {
                this.animationGroup.children.forEach((child, index) => {
                    if (child.rotate) {
                        const direction = index % 2 === 0 ? 1 : -1;
                        const layerSpeed = baseRotationSpeed * (1 + index * 0.1);
                        child.rotate(layerSpeed * direction);
                    }
                });
            }
            
            // Breathing effect based on stress (inverted)
            const breathingIntensity = 1 + (0.01 * (11 - this.biometrics.stress));
            const breathingPhase = Math.sin(currentTime / breathingRate) * 0.02;
            
            if (this.mandalaGroup) {
                this.mandalaGroup.scaling = breathingIntensity + breathingPhase;
            }
            
            // Energy pulse effects
            if (this.biometrics.energy > 7 && this.effectsLayer) {
                const energyPulse = Math.sin(currentTime / 500) * 0.1 + 1;
                this.effectsLayer.scaling = energyPulse;
            }
            
            // Redraw canvas
            paper.view.draw();
            
            this.animationFrame = requestAnimationFrame(animate);
        };
        
        this.animationFrame = requestAnimationFrame(animate);
    }
    
    updateFrameRate(currentTime) {
        this.frameCount++;
        
        if (currentTime - this.lastTime >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
            this.frameCount = 0;
            this.lastTime = currentTime;
            
            // Update FPS display
            const fpsElement = document.getElementById('fps');
            if (fpsElement) {
                fpsElement.textContent = this.fps;
            }
            
            // Performance warnings
            if (this.fps < 30) {
                console.warn('Low frame rate detected:', this.fps);
            }
        }
    }
    
    updateMandala() {
        if (this.isGenerating) {
            this.queueGeneration();
            return;
        }
        
        this.updateAllDisplays();
        this.updateParticleColors();
        
        // Smooth color transitions for existing elements
        this.updateMandalaColors();
    }
    
    updateMandalaColors() {
        const palette = this.colorPalettes[this.biometrics.mood];
        
        if (!this.mandalaGroup || !this.mandalaGroup.children) return;
        
        this.mandalaGroup.children.forEach((layer, layerIndex) => {
            if (layer.children) {
                const colorIndex = layerIndex % palette.colors.length;
                const targetColor = palette.colors[colorIndex];
                
                layer.children.forEach(element => {
                    if (element.fillColor && !this.capabilities.reducedMotion) {
                        // Smooth color transition
                        anime({
                            targets: element.fillColor,
                            hue: new paper.Color(targetColor).hue,
                            saturation: new paper.Color(targetColor).saturation,
                            lightness: new paper.Color(targetColor).lightness,
                            duration: 1000,
                            easing: 'easeInOutQuart'
                        });
                    } else if (element.fillColor) {
                        // Immediate color change for reduced motion
                        element.fillColor = targetColor;
                    }
                });
            }
        });
    }
    
    updateParticleColors() {
        const particles = document.querySelectorAll('.particle');
        const palette = this.colorPalettes[this.biometrics.mood];
        
        particles.forEach((particle, index) => {
            const color = palette.colors[index % palette.colors.length];
            particle.style.background = color;
        });
    }
    
    queueGeneration() {
        if (this.generationQueue.length === 0) {
            this.generationQueue.push(() => this.generateMandala());
            setTimeout(() => this.processGenerationQueue(), 500);
        }
    }
    
    async processGenerationQueue() {
        if (this.generationQueue.length === 0 || this.isGenerating) return;
        
        this.isGenerating = true;
        const generator = this.generationQueue.shift();
        
        try {
            await generator();
        } catch (error) {
            console.error('Error processing generation queue:', error);
        } finally {
            this.isGenerating = false;
            
            if (this.generationQueue.length > 0) {
                setTimeout(() => this.processGenerationQueue(), 100);
            }
        }
    }
    
    updateAllDisplays() {
        this.updateChart();
        this.updateWellnessScore();
        this.updatePatternType();
        this.updateStatistics();
        this.updateBiometricEffects();
    }
    
    updateChart() {
        if (!this.chart) return;
        
        this.chart.data.datasets[0].data = this.getBiometricChartData();
        this.chart.update(this.capabilities.reducedMotion ? 'none' : 'default');
    }
    
    updateWellnessScore() {
        const score = this.calculateWellnessScore();
        const scoreElement = document.getElementById('wellnessScore');
        const progressElement = document.getElementById('wellnessProgress');
        
        if (scoreElement) {
            anime({
                targets: { value: parseInt(scoreElement.textContent) || 0 },
                value: score,
                duration: this.capabilities.reducedMotion ? 0 : 1000,
                easing: 'easeInOutQuart',
                update: function(anim) {
                    scoreElement.textContent = Math.round(anim.animatables[0].target.value);
                }
            });
        }
        
        if (progressElement) {
            progressElement.style.width = score + '%';
        }
    }
    
    calculateWellnessScore() {
        // Advanced wellness calculation with weighted factors
        const weights = {
            heartRate: 0.15,
            sleep: 0.25,
            steps: 0.15,
            mood: 0.25,
            energy: 0.10,
            stress: 0.10
        };
        
        const scores = {
            heartRate: Math.max(0, 100 - Math.abs(this.biometrics.heartRate - 70) * 1.5),
            sleep: Math.min(100, (this.biometrics.sleepHours / 9) * 100),
            steps: Math.min(100, (this.biometrics.steps / 10000) * 100),
            mood: this.biometrics.mood * 10,
            energy: this.biometrics.energy * 10,
            stress: (11 - this.biometrics.stress) * 10
        };
        
        let weightedScore = 0;
        for (const [metric, weight] of Object.entries(weights)) {
            weightedScore += scores[metric] * weight;
        }
        
        return Math.round(Math.max(0, Math.min(100, weightedScore)));
    }
    
    updatePatternType() {
        const score = this.calculateWellnessScore();
        const palette = this.colorPalettes[this.biometrics.mood];
        
        const patternTypeElement = document.getElementById('patternType');
        const patternSubtitleElement = document.getElementById('patternSubtitle');
        
        if (patternTypeElement) {
            patternTypeElement.textContent = palette.name;
        }
        
        if (patternSubtitleElement) {
            const subtitles = [
                'Seeking Inner Peace', 'Finding Balance', 'Gentle Flow',
                'Harmonious Energy', 'Vibrant Wellness', 'Radiant Joy',
                'Blissful Harmony', 'Transcendent State', 'Divine Unity', 'Perfect Resonance'
            ];
            const subtitleIndex = Math.min(9, Math.floor(score / 10));
            patternSubtitleElement.textContent = subtitles[subtitleIndex];
        }
    }
    
    updateStatistics() {
        const elements = {
            patternCount: this.patternCount,
            complexityScore: this.complexityScore
        };
        
        for (const [id, value] of Object.entries(elements)) {
            const element = document.getElementById(id);
            if (element && element.textContent !== value.toString()) {
                element.textContent = value;
            }
        }
    }
    
    updateBiometricEffects() {
        this.updateMoodIndicator();
        this.updateStressIndicators();
        this.updateEnergyBar();
    }
    
    updateMoodIndicator() {
        const indicator = document.getElementById('moodIndicator');
        const palette = this.colorPalettes[this.biometrics.mood];
        
        if (indicator) {
            const gradient = `linear-gradient(90deg, ${palette.colors.join(', ')})`;
            indicator.style.background = gradient;
        }
        
        // Update mood emojis
        document.querySelectorAll('.mood-emoji').forEach(emoji => {
            emoji.classList.remove('active');
            const moodValue = parseInt(emoji.dataset.mood);
            if (Math.abs(moodValue - this.biometrics.mood) <= 2) {
                emoji.classList.add('active');
            }
        });
    }
    
    updateStressIndicators() {
        document.querySelectorAll('.stress-level').forEach(indicator => {
            indicator.classList.remove('active');
        });
        
        const stressLevels = ['calm', 'moderate', 'high'];
        let activeLevel;
        if (this.biometrics.stress <= 3) activeLevel = 'calm';
        else if (this.biometrics.stress <= 6) activeLevel = 'moderate';
        else activeLevel = 'high';
        
        document.querySelector(`.stress-level.${activeLevel}`)?.classList.add('active');
    }
    
    updateEnergyBar() {
        const energyBar = document.getElementById('energyBar');
        if (energyBar) {
            const percentage = (this.biometrics.energy / 10) * 100;
            energyBar.style.setProperty('--energy-width', percentage + '%');
        }
    }
    
    // Individual effect update methods
    updateHeartRateEffects() {
        // Heart rate affects rotation speed in real-time
        // This is handled in the animation loop
    }
    
    updateComplexityEffects() {
        // Sleep affects complexity - regenerate if significantly different
        const newComplexity = Math.max(3, Math.min(12, Math.floor(this.biometrics.sleepHours * 1.5) + 2));
        if (Math.abs(newComplexity - this.complexityScore) > 2) {
            this.queueGeneration();
        }
    }
    
    updateSizeEffects() {
        // Steps affect size - update scaling
        const activityLevel = Math.max(0.4, Math.min(1.2, this.biometrics.steps / 15000));
        if (this.mandalaGroup && Math.abs(this.mandalaGroup.scaling.x - activityLevel) > 0.1) {
            anime({
                targets: this.mandalaGroup,
                scaling: activityLevel,
                duration: this.capabilities.reducedMotion ? 0 : 1000,
                easing: 'easeInOutQuart'
            });
        }
    }
    
    updateMoodEffects() {
        // Mood affects colors - handled in updateMandalaColors
        this.updateMandalaColors();
        this.updateParticleColors();
    }
    
    updateStressEffects() {
        // Stress affects breathing intensity and pattern type
        // Handled in animation loop and pattern generation
    }
    
    updateEnergyEffects() {
        // Energy affects animation speed and element sizes
        // Handled in animation loop
    }
    
    // Action methods
    async regenerateMandala() {
        this.showLoading();
        await this.generateMandala();
        this.hideLoading();
        this.showToast('Mandala regenerated successfully!', 'success');
    }
    
    toggleAnimation() {
        this.isAnimating = !this.isAnimating;
        const button = document.getElementById('pauseBtn');
        const icon = button?.querySelector('i');
        
        if (this.isAnimating) {
            if (button) button.innerHTML = '<i class="fas fa-pause"></i><span>Pause</span>';
            this.startAnimation();
            this.announce('Animation resumed');
        } else {
            if (button) button.innerHTML = '<i class="fas fa-play"></i><span>Resume</span>';
            if (this.animationFrame) {
                cancelAnimationFrame(this.animationFrame);
            }
            this.announce('Animation paused');
        }
    }
    
    async exportMandala() {
        try {
            // Ensure canvas is up to date
            paper.view.draw();
            
            // Create download
            const dataURL = this.canvas.toDataURL('image/png', 1.0);
            const link = document.createElement('a');
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            link.download = `biometric-mandala-${timestamp}.png`;
            link.href = dataURL;
            link.click();
            
            this.showToast('Mandala exported successfully!', 'success');
        } catch (error) {
            console.error('Export failed:', error);
            this.showToast('Export failed. Please try again.', 'error');
        }
    }
    
    async shareMandala() {
        if (navigator.share) {
            try {
                // Convert canvas to blob for sharing
                this.canvas.toBlob(async (blob) => {
                    const file = new File([blob], 'biometric-mandala.png', { type: 'image/png' });
                    await navigator.share({
                        title: 'My Biometric Mandala',
                        text: 'Check out my personalized mandala created from my wellness data!',
                        files: [file]
                    });
                });
            } catch (error) {
                console.error('Sharing failed:', error);
                this.fallbackShare();
            }
        } else {
            this.fallbackShare();
        }
    }
    
    fallbackShare() {
        // Fallback sharing method
        const url = window.location.href;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url);
            this.showToast('Link copied to clipboard!', 'success');
        } else {
            this.showToast('Sharing not supported on this device', 'warning');
        }
    }
    
    generateRandomData() {
        // Generate realistic random biometric data
        const newBiometrics = {
            heartRate: Math.floor(Math.random() * 120) + 50,
            sleepHours: Math.round((Math.random() * 6 + 4) * 2) / 2,
            steps: Math.floor(Math.random() * 18000) + 2000,
            mood: Math.floor(Math.random() * 10) + 1,
            stress: Math.floor(Math.random() * 10) + 1,
            energy: Math.floor(Math.random() * 10) + 1
        };
        
        // Animate slider changes
        this.animateToNewValues(newBiometrics);
        
        this.showToast('Random biometric data generated!', 'info');
    }
    
    animateToNewValues(newBiometrics) {
        const duration = this.capabilities.reducedMotion ? 0 : 1500;
        
        for (const [key, value] of Object.entries(newBiometrics)) {
            const slider = document.getElementById(key);
            const valueDisplay = document.getElementById(`${key}Value`);
            
            if (slider && valueDisplay) {
                anime({
                    targets: { value: parseFloat(slider.value) },
                    value: value,
                    duration: duration,
                    easing: 'easeInOutQuart',
                    update: (anim) => {
                        const currentValue = anim.animatables[0].target.value;
                        slider.value = currentValue;
                        
                        if (key === 'steps') {
                            valueDisplay.textContent = Math.round(currentValue).toLocaleString();
                        } else if (key === 'sleepHours') {
                            valueDisplay.textContent = currentValue.toFixed(1);
                        } else {
                            valueDisplay.textContent = Math.round(currentValue);
                        }
                        
                        // Update biometric value
                        this.biometrics[key] = currentValue;
                        
                        // Trigger updates
                        this.updateMandala();
                    }
                });
            }
        }
        
        // Final regeneration after animation
        setTimeout(() => {
            this.regenerateMandala();
        }, duration + 100);
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error('Error attempting to enable fullscreen:', err);
                this.showToast('Fullscreen not supported', 'warning');
            });
        } else {
            document.exitFullscreen();
        }
    }
    
    showQuickStartTutorial() {
        const steps = [
            'Welcome to your Biometric Mandala Generator!',
            'Adjust your heart rate to see the mandala rotate faster or slower',
            'Change your sleep hours to increase pattern complexity',
            'Modify your mood to see beautiful color transitions',
            'Your mandala is a unique reflection of your current state'
        ];
        
        this.showTutorialToasts(steps);
    }
    
    showTutorialToasts(steps, index = 0) {
        if (index >= steps.length) return;
        
        this.showToast(steps[index], 'info', 4000);
        
        setTimeout(() => {
            this.showTutorialToasts(steps, index + 1);
        }, 4500);
    }
    
    applyPreset(presetName) {
        const preset = this.presets[presetName];
        if (!preset) return;
        
        this.animateToNewValues(preset);
        this.showToast(`${this.capitalize(presetName)} preset applied!`, 'success');
    }
    
    toggleAmbientSounds() {
        if (!this.capabilities.webAudio) {
            this.showToast('Audio not supported on this device', 'warning');
            return;
        }
        
        this.ambientSounds.enabled = !this.ambientSounds.enabled;
        const button = document.getElementById('ambientToggle');
        
        if (this.ambientSounds.enabled) {
            this.startAmbientSounds();
            button?.classList.add('active');
            this.announce('Ambient sounds enabled');
        } else {
            this.stopAmbientSounds();
            button?.classList.remove('active');
            this.announce('Ambient sounds disabled');
        }
    }
    
    startAmbientSounds() {
        // Placeholder for ambient sound implementation
        // In a real implementation, you would load and play audio files
        console.log('Ambient sounds would start here');
    }
    
    stopAmbientSounds() {
        // Placeholder for ambient sound stopping
        console.log('Ambient sounds would stop here');
    }
    
    setupPeriodicUpdates() {
        // Update displays every second
        setInterval(() => {
            this.updateStatistics();
        }, 1000);
        
        // Update wellness score every 5 seconds
        setInterval(() => {
            this.updateWellnessScore();
        }, 5000);
        
        // Cleanup old performance data
        setInterval(() => {
            this.cleanupPerformanceData();
        }, 30000);
    }
    
    cleanupPerformanceData() {
        const maxEntries = 100;
        if (this.performanceMonitor.frameTimestamps.length > maxEntries) {
            this.performanceMonitor.frameTimestamps = this.performanceMonitor.frameTimestamps.slice(-maxEntries);
        }
    }
    
    handleVisibilityChange() {
        if (document.hidden) {
            // Pause animation when tab is hidden for performance
            if (this.isAnimating) {
                this.wasAnimatingBeforeHide = true;
                this.isAnimating = false;
                if (this.animationFrame) {
                    cancelAnimationFrame(this.animationFrame);
                }
            }
        } else {
            // Resume animation when tab becomes visible
            if (this.wasAnimatingBeforeHide) {
                this.isAnimating = true;
                this.startAnimation();
                this.wasAnimatingBeforeHide = false;
            }
        }
    }
    
    focusOnMandala() {
        if (!this.mandalaGroup) return;
        
        // Center and focus the mandala
        const center = paper.view.center;
        this.mandalaGroup.position = center;
        
        if (!this.capabilities.reducedMotion) {
            anime({
                targets: this.mandalaGroup,
                scaling: [this.mandalaGroup.scaling.x, 1],
                duration: 1000,
                easing: 'easeInOutBack'
            });
        }
    }
    
    showLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.classList.add('active');
        }
    }
    
    hideLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.classList.remove('active');
        }
    }
    
    showToast(message, type = 'info', duration = 3000) {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${this.getToastIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        
        toastContainer.appendChild(toast);
        
        // Show toast
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Hide and remove toast
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toastContainer.removeChild(toast), 300);
        }, duration);
    }
    
    getToastIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
    
    announce(message) {
        if (this.announcementElement) {
            this.announcementElement.textContent = message;
        }
    }
    
    addVisualFeedback(element) {
        if (!element) return;
        
        element.classList.add('pulse');
        setTimeout(() => element.classList.remove('pulse'), 300);
    }
    
    addRippleEffect(button, event) {
        if (this.capabilities.reducedMotion) return;
        
        const rect = button.getBoundingClientRect();
        const ripple = document.createElement('span');
        const size = Math.max(rect.width, rect.height);
        const x = (event.clientX || rect.width / 2) - rect.left - size / 2;
        const y = (event.clientY || rect.height / 2) - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            pointer-events: none;
            transform: scale(0);
            animation: ripple 600ms ease-out;
        `;
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        setTimeout(() => button.removeChild(ripple), 600);
    }
    
    // Utility methods
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    nextFrame() {
        return new Promise(resolve => requestAnimationFrame(resolve));
    }
    
    camelCaseToSpaced(str) {
        return str.replace(/([A-Z])/g, ' $1').toLowerCase().trim();
    }
    
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

// Add ripple effect CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.mandalaApp = new BiometricMandalaGenerator();
});

// Handle page unload for cleanup
window.addEventListener('beforeunload', () => {
    if (window.mandalaApp && window.mandalaApp.animationFrame) {
        cancelAnimationFrame(window.mandalaApp.animationFrame);
    }
});
