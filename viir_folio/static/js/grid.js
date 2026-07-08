/* ==========================================================================
   VIIR PORTFOLIO — Grid Canvas Animation
   Interactive grid background with continuous particles
   ========================================================================== */

const canvas = document.getElementById('gridCanvas');
if (canvas) {
    canvas.style.willChange = 'transform';
}
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Configuration object

let config = {
    gridSize: window.innerWidth < 768 ? 60 : 40,
    gridColor: '#334155',
    particleCount: window.innerWidth < 768 ? 30 : 60,
    particleSpeedMin: 0.5,
    particleSpeedMax: 5,
    particleColors: ['#ffffff', '#64748b', '#94a3b8'],
    trailLength: window.innerWidth < 768 ? 50 : 100,
    backgroundColor: '#0f172a'
};

// Dark mode configuration
const darkConfig = {
    gridColor: '#334155',
    particleColors: ['#ffffff', '#8b5cf6', '#a78bfa', '#64748b'],
    backgroundColor: '#0c0e22ed'
};

// Light mode configuration  
const lightConfig = {
    gridColor: '#94a3b8',
    particleColors: ['#8b5cf6', '#a78bfa', '#1e293b', '#334155'],
    backgroundColor: '#E6F4FF'
};

function updateConfig(isDarkMode) {
    const isLoginPage = document.body.classList.contains('login-page');
    const modeConfig = isDarkMode ? darkConfig : lightConfig;
    
    if (isLoginPage) {
        config.gridColor = isDarkMode ? '#1c1c1e' : '#b4c6e7';
        config.backgroundColor = isDarkMode ? '#000000' : '#E6F4FF';
    } else {
        config.gridColor = modeConfig.gridColor;
        config.backgroundColor = modeConfig.backgroundColor;
    }
    
    config.particleColors = modeConfig.particleColors;
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
        const isLoginPage = document.body.classList.contains('login-page');
        const radius = isLoginPage ? 1.5 : 0.4;
        for (let i = 0; i < this.trail.length; i++) {
            const point = this.trail[i];
            const alpha = (i / this.trail.length);
            ctx.fillStyle = this.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
            if (!this.color.includes('rgb')) {
                // Handle hex colors
                ctx.fillStyle = this.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            }
            ctx.beginPath();
            ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
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


let isCanvasVisible = true;
const observer = new IntersectionObserver((entries) => {
    isCanvasVisible = entries[0].isIntersecting;
}, { threshold: 0 });

const heroSection = document.querySelector('#home') || document.querySelector('.hero') || document.body;
if (heroSection !== document.body) {
    observer.observe(heroSection);
}

function animate() {
    if (!isCanvasVisible) {
        requestAnimationFrame(animate);
        return;
    }
    createGrid();
    
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const isLoginPage = document.body.classList.contains('login-page');
    
    if (!isLoginPage && !prefersReducedMotion) {
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
    }
    
    if (!prefersReducedMotion) {
        requestAnimationFrame(animate);
    }
}
    
// Handle window resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    particles.forEach(particle => particle.reset());
    
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        createGrid();
    }
});

// Initialize on load
(function() {
    const isDarkMode = localStorage.getItem('darkMode') !== 'false';
    updateConfig(isDarkMode);
    animate();
})();

// Export function to update grid when theme changes
window.updateGridTheme = function(isDarkMode) {
    updateConfig(isDarkMode);
    particles.forEach(particle => particle.reset());
    
    // Always draw once immediately to update background colors even if animation is paused
    createGrid();
    
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
        particles.forEach(particle => particle.draw());
    }
};