/**
 * 3D Interactive Neural Core & Particle Orb Engine
 * Viir Phuria Portfolio — Eye-Catching Hero Centerpiece
 * High-performance Canvas 3D particle sphere with neural constellation, momentum physics & dynamic cyber arcs
 */

(function () {
    "use strict";

    let canvas, ctx;
    let width = 600, height = 500;
    let particles = [];
    let badgeElements = [];
    
    // Dynamic sphere geometry
    let sphereRadius = 175;
    let maxLineDist = 58;
    const PARTICLE_COUNT = window.innerWidth < 768 ? 240 : 360;
    
    // Rotation & Momentum Physics State
    let rotationX = 0.22;
    let rotationY = 0;
    let velX = 0;
    let velY = 0.0035;
    let targetTiltX = 0;
    let targetTiltY = 0;
    let currentTiltX = 0;
    let currentTiltY = 0;
    
    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let isHovered = false;
    let isMouseDown = false;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let lastMoveTime = 0;
    let pulseWave = 0;
    let activeBadgeIndex = -1;

    // Brand Palette
    const DARK_COLORS = [
        '#8c6fff', // Brand Purple
        '#a48fff', // Light Purple
        '#7c5bff', // Deep Violet
        '#38bdf8', // Electric Cyan
        '#2dd4bf', // Neon Teal
        '#ff6f6f'  // Brand Red accent
    ];

    const LIGHT_COLORS = [
        '#6d44f5', // Deep Purple
        '#8c6fff', // Brand Purple
        '#0284c7', // Cyan Blue
        '#0d9488', // Deep Teal
        '#e11d48'  // Deep Crimson
    ];

    class Particle3D {
        constructor() {
            // Uniform point distribution on sphere using Fibonacci sphere algorithm
            this.phi = Math.acos(1 - 2 * Math.random());
            this.theta = Math.random() * Math.PI * 2;
            
            this.x = 0;
            this.y = 0;
            this.z = 0;
            this.projX = 0;
            this.projY = 0;
            this.scale = 1;
            
            // Subtle individual breath/wobble
            this.wobbleSpeed = 0.02 + Math.random() * 0.035;
            this.wobblePhase = Math.random() * Math.PI * 2;
            this.wobbleAmp = 3 + Math.random() * 7;
            
            // Visual attributes
            this.colorIndex = Math.floor(Math.random() * DARK_COLORS.length);
            this.size = 1.3 + Math.random() * 2.1;
            this.alpha = 0.35 + Math.random() * 0.65;
            this.pulseOffset = 0;
        }

        update(time, radiusMultiplier, currentR) {
            // Add individual radial breathing + shockwave pulse
            const r = (currentR + Math.sin(time * this.wobbleSpeed + this.wobblePhase) * this.wobbleAmp + this.pulseOffset) * radiusMultiplier;
            
            // Spherical to 3D Cartesian
            let x0 = r * Math.sin(this.phi) * Math.cos(this.theta);
            let y0 = r * Math.cos(this.phi);
            let z0 = r * Math.sin(this.phi) * Math.sin(this.theta);

            // Combined rotation (continuous spin + mouse tilt)
            const rotX = rotationX + currentTiltX;
            const rotY = rotationY + currentTiltY;

            // Rotate around X axis
            let cosX = Math.cos(rotX);
            let sinX = Math.sin(rotX);
            let y1 = y0 * cosX - z0 * sinX;
            let z1 = y0 * sinX + z0 * cosX;

            // Rotate around Y axis
            let cosY = Math.cos(rotY);
            let sinY = Math.sin(rotY);
            let x2 = x0 * cosY + z1 * sinY;
            let z2 = -x0 * sinY + z1 * cosY;

            this.x = x2;
            this.y = y1;
            this.z = z2;

            // Perspective projection (camera at z = 540)
            const fov = 540;
            const dist = fov / (fov + z2);
            this.scale = dist;
            this.projX = width / 2 + x2 * dist;
            this.projY = height / 2 + y1 * dist;

            // Decay pulse offset if triggered
            if (this.pulseOffset > 0) {
                this.pulseOffset *= 0.92;
                if (this.pulseOffset < 0.2) this.pulseOffset = 0;
            }
        }
    }

    function init() {
        canvas = document.getElementById("neuralCoreCanvas");
        if (!canvas) return;

        ctx = canvas.getContext("2d");
        resize();

        // Generate Fibonacci sphere particles
        particles = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const p = new Particle3D();
            const k = i + 0.5;
            p.phi = Math.acos(1 - (2 * k) / PARTICLE_COUNT);
            p.theta = Math.PI * (1 + Math.sqrt(5)) * k;
            particles.push(p);
        }

        // Cache floating badges
        badgeElements = Array.from(document.querySelectorAll(".hologram-cyber-badge"));
        setupBadgeInteractions();
        setupEventListeners();

        requestAnimationFrame(render);
    }

    function resize() {
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        width = canvas.width = rect.width || canvas.parentElement.offsetWidth || 560;
        height = canvas.height = rect.height || 480;

        // Auto-scale sphere radius to always sit comfortably with margin for orbiting badges
        sphereRadius = Math.min(width, height) * (window.innerWidth < 768 ? 0.36 : 0.33);
        maxLineDist = sphereRadius * 0.31;
    }

    function setupEventListeners() {
        window.addEventListener("resize", debounce(resize, 100));

        const container = document.getElementById("neuralCoreContainer") || canvas;

        container.addEventListener("mouseenter", () => {
            isHovered = true;
        });

        container.addEventListener("mouseleave", () => {
            isHovered = false;
            isMouseDown = false;
            targetTiltX = 0;
            targetTiltY = 0;
        });

        container.addEventListener("mousemove", (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left - width / 2;
            mouseY = e.clientY - rect.top - height / 2;

            const now = performance.now();
            const dt = Math.max(1, now - lastMoveTime);
            lastMoveTime = now;

            if (isMouseDown) {
                const deltaX = e.clientX - lastMouseX;
                const deltaY = e.clientY - lastMouseY;
                
                rotationY += deltaX * 0.007;
                rotationX -= deltaY * 0.007;

                // Track momentum velocity
                velY = (deltaX / dt) * 0.08;
                velX = -(deltaY / dt) * 0.08;

                lastMouseX = e.clientX;
                lastMouseY = e.clientY;
            } else {
                // Smooth perspective tilt toward cursor
                targetTiltY = (mouseX / width) * 0.45;
                targetTiltX = -(mouseY / height) * 0.35;
            }
        });

        container.addEventListener("mousedown", (e) => {
            isMouseDown = true;
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
            lastMoveTime = performance.now();
            velX = 0;
            velY = 0;
            triggerShockwave(30);
        });

        window.addEventListener("mouseup", () => {
            if (isMouseDown) {
                isMouseDown = false;
            }
        });

        // Touch support for mobile devices
        container.addEventListener("touchstart", (e) => {
            if (e.touches.length === 1) {
                isMouseDown = true;
                lastMouseX = e.touches[0].clientX;
                lastMouseY = e.touches[0].clientY;
                lastMoveTime = performance.now();
                velX = 0;
                velY = 0;
                triggerShockwave(25);
            }
        }, { passive: true });

        container.addEventListener("touchmove", (e) => {
            if (e.touches.length === 1 && isMouseDown) {
                const now = performance.now();
                const dt = Math.max(1, now - lastMoveTime);
                lastMoveTime = now;

                const deltaX = e.touches[0].clientX - lastMouseX;
                const deltaY = e.touches[0].clientY - lastMouseY;
                
                rotationY += deltaX * 0.008;
                rotationX -= deltaY * 0.008;

                velY = (deltaX / dt) * 0.08;
                velX = -(deltaY / dt) * 0.08;

                lastMouseX = e.touches[0].clientX;
                lastMouseY = e.touches[0].clientY;
            }
        }, { passive: true });

        container.addEventListener("touchend", () => {
            isMouseDown = false;
        });
    }

    function setupBadgeInteractions() {
        badgeElements.forEach((badge, idx) => {
            badge.addEventListener("mouseenter", () => {
                activeBadgeIndex = idx;
                triggerShockwave(20);
                
                // Gently nudge rotation towards the badge
                if (idx === 0) { targetTiltY = -0.3; targetTiltX = 0.2; }
                else if (idx === 1) { targetTiltY = 0.3; targetTiltX = 0.2; }
                else if (idx === 2) { targetTiltY = -0.3; targetTiltX = -0.2; }
                else if (idx === 3) { targetTiltY = 0.3; targetTiltX = -0.2; }
            });
            badge.addEventListener("mouseleave", () => {
                if (activeBadgeIndex === idx) {
                    activeBadgeIndex = -1;
                    targetTiltX = 0;
                    targetTiltY = 0;
                }
            });
        });
    }

    function triggerShockwave(intensity = 35) {
        pulseWave = 1.0;
        particles.forEach(p => {
            p.pulseOffset = intensity * (0.6 + Math.random() * 0.8);
        });
    }

    let lastTime = 0;

    function render(currentTime) {
        const delta = (currentTime - lastTime) * 0.001 || 0.016;
        lastTime = currentTime;

        const isLightMode = document.body.classList.contains("light");
        const activePalette = isLightMode ? LIGHT_COLORS : DARK_COLORS;

        // Physics: apply momentum and auto-rotation
        if (!isMouseDown) {
            // Apply drag inertia with gentle decay towards baseline
            velY *= 0.94;
            velX *= 0.94;

            // Clamping and blending back to baseline constant spin
            const baseRotSpeedY = 0.0032;
            const baseRotSpeedX = 0.0008 * Math.sin(currentTime * 0.0006);

            rotationY += velY + baseRotSpeedY;
            rotationX += velX + baseRotSpeedX;

            // Ease tilt towards mouse position
            currentTiltX += (targetTiltX - currentTiltX) * 0.06;
            currentTiltY += (targetTiltY - currentTiltY) * 0.06;
        }

        ctx.clearRect(0, 0, width, height);

        const centerX = width / 2;
        const centerY = height / 2;

        // 1. Draw Inner Glowing Nebula Core
        const coreGradient = ctx.createRadialGradient(
            centerX, centerY, 5,
            centerX, centerY, sphereRadius * 0.9
        );
        
        if (isLightMode) {
            coreGradient.addColorStop(0, 'rgba(109, 68, 245, 0.16)');
            coreGradient.addColorStop(0.4, 'rgba(140, 111, 255, 0.08)');
            coreGradient.addColorStop(0.8, 'rgba(2, 132, 199, 0.03)');
            coreGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        } else {
            coreGradient.addColorStop(0, 'rgba(140, 111, 255, 0.28)');
            coreGradient.addColorStop(0.35, 'rgba(124, 91, 255, 0.14)');
            coreGradient.addColorStop(0.7, 'rgba(56, 189, 248, 0.05)');
            coreGradient.addColorStop(1, 'rgba(11, 15, 30, 0)');
        }

        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, sphereRadius * 0.9, 0, Math.PI * 2);
        ctx.fill();

        // 2. Draw Subtle Concentric Orbital Rings (Gyro effect)
        ctx.save();
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 7]);

        // Ring 1 (tilted)
        ctx.strokeStyle = isLightMode ? 'rgba(109, 68, 245, 0.2)' : 'rgba(140, 111, 255, 0.18)';
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, sphereRadius * 1.18, sphereRadius * 0.42, (rotationY + currentTiltY) * 0.5, 0, Math.PI * 2);
        ctx.stroke();

        // Ring 2 (counter tilted)
        ctx.strokeStyle = isLightMode ? 'rgba(2, 132, 199, 0.2)' : 'rgba(56, 189, 248, 0.16)';
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, sphereRadius * 1.34, sphereRadius * 0.32, -(rotationY + currentTiltY) * 0.4 + 0.9, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // 3. Update all particles
        const radMult = 1 + (pulseWave > 0 ? Math.sin(pulseWave * Math.PI) * 0.09 : 0);
        if (pulseWave > 0) {
            pulseWave -= delta * 2;
            if (pulseWave < 0) pulseWave = 0;
        }

        for (let i = 0; i < particles.length; i++) {
            particles[i].update(currentTime * 0.001, radMult, sphereRadius);
        }

        // 4. Draw Synaptic Neural Lines (Connect nearby particles in forward z-space)
        ctx.lineWidth = 0.8;
        const lineBaseColor = isLightMode ? '109, 68, 245' : '164, 143, 255';
        for (let i = 0; i < particles.length; i++) {
            const p1 = particles[i];
            if (p1.z < -sphereRadius * 0.25) continue; // Skip back half for crisp foreground depth

            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                if (p2.z < -sphereRadius * 0.25) continue;

                const dx = p1.projX - p2.projX;
                const dy = p1.projY - p2.projY;
                const distSq = dx * dx + dy * dy;

                if (distSq < maxLineDist * maxLineDist) {
                    const dist = Math.sqrt(distSq);
                    const lineAlpha = (1 - dist / maxLineDist) * (isLightMode ? 0.35 : 0.28) * p1.scale;
                    ctx.strokeStyle = `rgba(${lineBaseColor}, ${lineAlpha})`;
                    ctx.beginPath();
                    ctx.moveTo(p1.projX, p1.projY);
                    ctx.lineTo(p2.projX, p2.projY);
                    ctx.stroke();
                }
            }
        }

        // 5. Draw Particles (Sorted by Z for proper perspective occlusion)
        particles.sort((a, b) => a.z - b.z);

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            const renderSize = Math.max(0.65, p.size * p.scale);
            const renderAlpha = Math.min(1, Math.max(0.18, (p.z + sphereRadius) / (sphereRadius * 2) * p.alpha));
            const particleColor = activePalette[p.colorIndex % activePalette.length];

            ctx.beginPath();
            ctx.arc(p.projX, p.projY, renderSize, 0, Math.PI * 2);
            ctx.fillStyle = particleColor;
            ctx.globalAlpha = renderAlpha;
            ctx.fill();

            // Extra luminous halo on forward-facing particles
            if (p.z > sphereRadius * 0.35) {
                ctx.beginPath();
                ctx.arc(p.projX, p.projY, renderSize * 2.4, 0, Math.PI * 2);
                ctx.fillStyle = particleColor;
                ctx.globalAlpha = renderAlpha * (isLightMode ? 0.2 : 0.3);
                ctx.fill();
            }
        }
        ctx.globalAlpha = 1.0;

        // 6. Draw Energy Arc to Active Badge if hovered
        if (activeBadgeIndex >= 0 && badgeElements[activeBadgeIndex]) {
            const bRect = badgeElements[activeBadgeIndex].getBoundingClientRect();
            const cRect = canvas.getBoundingClientRect();
            const targetX = (bRect.left + bRect.width / 2) - cRect.left;
            const targetY = (bRect.top + bRect.height / 2) - cRect.top;

            ctx.save();
            ctx.strokeStyle = isLightMode ? 'rgba(109, 68, 245, 0.65)' : 'rgba(140, 111, 255, 0.6)';
            ctx.lineWidth = 1.8;
            ctx.shadowColor = isLightMode ? '#6d44f5' : '#8c6fff';
            ctx.shadowBlur = 14;

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            
            // Jittered electric arc
            const midX = (centerX + targetX) / 2 + (Math.random() - 0.5) * 24;
            const midY = (centerY + targetY) / 2 + (Math.random() - 0.5) * 24;
            ctx.quadraticCurveTo(midX, midY, targetX, targetY);
            ctx.stroke();

            // Contact spark at target
            ctx.beginPath();
            ctx.arc(targetX, targetY, 4 + Math.random() * 3, 0, Math.PI * 2);
            ctx.fillStyle = isLightMode ? '#0284c7' : '#38bdf8';
            ctx.fill();

            ctx.restore();
        }

        requestAnimationFrame(render);
    }

    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // Auto-init on DOM load
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
