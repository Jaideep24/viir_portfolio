/* ==========================================================================
   VIIR PORTFOLIO — Grid Canvas Animation
   Interactive grid background with particles and ripple effects
   ========================================================================== */

const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Configuration object
let config = {
    gridSize: 40,
    gridColor: '#334155',
    particleCount: 50,
    particleSpeedMin: 0.5,
    particleSpeedMax: 5,
    particleColors: ['#ffffff', '#64748b', '#94a3b8'],
    trailLength: 100,
    backgroundColor: '#0f172a',
    rippleDuration: 2000,
    rippleMaxRadius: 200
};

// Dark mode configuration
const darkConfig = {
    gridColor: '#334155',
    particleColors: ['#ffffff', '#64748b', '#94a3b8'],
    backgroundColor: '#0c0e22ed'
};

// Light mode configuration
const lightConfig = {
    gridColor: '#cbd5e1',
    particleColors: ['#000000', '#475569', '#1e293b'],
    backgroundColor: '#E6F4FF'
};

// Grid tracking system
const occupiedLines = {
    horizontal: new Set(),
    vertical: new Set()
};

// For random hacking characters
const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;':,./<>?";

function updateConfig(isDarkMode) {
    const modeConfig = isDarkMode ? darkConfig : lightConfig;
    config.gridColor = modeConfig.gridColor;
    config.particleColors = modeConfig.particleColors;
    config.backgroundColor = modeConfig.backgroundColor;
}

function createGrid() {
    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, config.gridColor);
    gradient.addColorStop(1, config.gridColor + '00');
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 0.5;
    
    for (let y = 0; y < canvas.height; y += config.gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    
    for (let x = 0; x < canvas.width; x += config.gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
}

class Particle {
    constructor() {
        this.color = config.particleColors[Math.floor(Math.random() * config.particleColors.length)];
        this.speed = Math.random() * (config.particleSpeedMax - config.particleSpeedMin) + config.particleSpeedMin;
        this.reset();
    }

    update() {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > config.trailLength) this.trail.shift();

        if (this.active) {
            if (this.direction === 'horizontal') {
                this.x += this.speed;
                if (this.x > canvas.width) {
                    this.active = false;
                    occupiedLines.horizontal.delete(this.y);
                }
            } else {
                this.y += this.speed;
                if (this.y > canvas.height) {
                    this.active = false;
                    occupiedLines.vertical.delete(this.x);
                }
            }
        } else {
            const allTrailPointsOffScreen = this.trail.every(point => 
                (this.direction === 'horizontal' && point.x > canvas.width) ||
                (this.direction === 'vertical' && point.y > canvas.height)
            );
            
            if (allTrailPointsOffScreen) {
                this.reset();
            }
        }
    }

    draw() {
        for (let i = 0; i < this.trail.length; i++) {
            const point = this.trail[i];
            const alpha = (i / this.trail.length);
            ctx.fillStyle = this.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
            if (!this.color.includes('rgb')) {
                // Handle hex colors
                ctx.fillStyle = this.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            }
            ctx.beginPath();
            ctx.arc(point.x, point.y, 0.4, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    findAvailableLine() {
        const maxAttempts = 100;
        let attempts = 0;

        while (attempts < maxAttempts) {
            if (Math.random() > 0.5) {
                const y = Math.round(Math.random() * canvas.height / config.gridSize) * config.gridSize;
                if (!occupiedLines.horizontal.has(y)) {
                    this.direction = 'horizontal';
                    this.x = 0;
                    this.y = y;
                    occupiedLines.horizontal.add(y);
                    return true;
                }
            } else {
                const x = Math.round(Math.random() * canvas.width / config.gridSize) * config.gridSize;
                if (!occupiedLines.vertical.has(x)) {
                    this.direction = 'vertical';
                    this.x = x;
                    this.y = 0;
                    occupiedLines.vertical.add(x);
                    return true;
                }
            }
            attempts++;
        }
        return false;
    }

    reset() {
        if (this.findAvailableLine()) {
            this.trail = [];
            this.active = true;
            this.speed = Math.random() * (config.particleSpeedMax - config.particleSpeedMin) + config.particleSpeedMin;
            this.color = config.particleColors[Math.floor(Math.random() * config.particleColors.length)];
        } else {
            this.active = false;
            this.trail = [];
        }
    }
}

const particles = Array(config.particleCount).fill().map(() => new Particle());

// Ripple effect handler
let ripples = [];
class Ripple {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.maxRadius = config.rippleMaxRadius;
        this.startTime = Date.now();
    }

    update() {
        const elapsed = Date.now() - this.startTime;
        this.radius = (elapsed / config.rippleDuration) * this.maxRadius;
    }

    draw() {
        const alpha = 1 - (this.radius / this.maxRadius);
        const isDarkMode = document.body.classList.contains('dark');
        const rippleColor = isDarkMode ? '255, 255, 255' : '0, 0, 0';
        
        ctx.strokeStyle = `rgba(${rippleColor}, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Draw random characters along the ripple
        if (Math.random() < 0.3) {
            ctx.fillStyle = `rgba(${rippleColor}, ${alpha})`;
            ctx.font = "16px monospace";
            const char = characters[Math.floor(Math.random() * characters.length)];
            ctx.fillText(char, this.x + (Math.random() - 0.5) * this.radius * 2, this.y + (Math.random() - 0.5) * this.radius * 2);
        }
    }

    isComplete() {
        return this.radius >= this.maxRadius;
    }
}

function animate() {
    createGrid();
    
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    ripples = ripples.filter(ripple => !ripple.isComplete());
    ripples.forEach(ripple => {
        ripple.update();
        ripple.draw();
    });
    
    requestAnimationFrame(animate);
}

// Handle window resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    occupiedLines.horizontal.clear();
    occupiedLines.vertical.clear();
    
    particles.forEach(particle => particle.reset());
});

// Add ripple on click
canvas.addEventListener('click', (event) => {
    const x = event.clientX;
    const y = event.clientY;
    ripples.push(new Ripple(x, y));
});

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    updateConfig(isDarkMode);
    animate();
});

// Export function to update grid when theme changes
window.updateGridTheme = function(isDarkMode) {
    updateConfig(isDarkMode);
    particles.forEach(particle => particle.reset());
};
