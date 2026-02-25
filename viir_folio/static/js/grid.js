/* ==========================================================================
   VIIR PORTFOLIO — Grid Canvas Animation
   Interactive grid background with continuous particles
   ========================================================================== */

const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Configuration object
let config = {
    gridSize: 40,
    gridColor: '#334155',
    particleCount: 60,
    particleSpeedMin: 0.5,
    particleSpeedMax: 5,
    particleColors: ['#ffffff', '#64748b', '#94a3b8'],
    trailLength: 100,
    backgroundColor: '#0f172a'
};

// Dark mode configuration
const darkConfig = {
    gridColor: '#334155',
    particleColors: ['#ffffff', '#64748b', '#94a3b8'],
    backgroundColor: '#0c0e22ed'
};

// Light mode configuration  
const lightConfig = {
    gridColor: '#94a3b8',
    particleColors: ['#1e293b', '#334155', '#475569'],
    backgroundColor: '#E6F4FF'
};

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
                }
            } else {
                this.y += this.speed;
                if (this.y > canvas.height) {
                    this.active = false;
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

    reset() {
        this.direction = Math.random() > 0.5 ? 'horizontal' : 'vertical';
        
        if (this.direction === 'horizontal') {
            this.x = 0;
            this.y = Math.round(Math.random() * canvas.height / config.gridSize) * config.gridSize;
        } else {
            this.x = Math.round(Math.random() * canvas.width / config.gridSize) * config.gridSize;
            this.y = 0;
        }
        
        this.trail = [];
        this.active = true;
        this.speed = Math.random() * (config.particleSpeedMax - config.particleSpeedMin) + config.particleSpeedMin;
        this.color = config.particleColors[Math.floor(Math.random() * config.particleColors.length)];
    }
}

const particles = Array(config.particleCount).fill().map(() => new Particle());

function animate() {
    createGrid();
    
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    
    requestAnimationFrame(animate);
}
    
// Handle window resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    particles.forEach(particle => particle.reset());
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