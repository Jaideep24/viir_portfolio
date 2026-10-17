/**
 * ============================================================================
 * VIIR PHURIA PORTFOLIO — 3D TELEMETRY MATRIX & CYBER CORE ENGINE
 * Inspired by Miten Parvatia, Mohit Nippanikar & Prem Rathod
 * Features:
 * - 3D Undulating Telemetry Point-Cloud Matrix with dynamic waveform modulation
 * - Traversal Crimson Red Telemetry Trace Line (Miten Parvatia signature)
 * - Floating 3D Quantum Gyroscope Rings & Icosahedron Cyber Lattice
 * - Kinetic drag-to-orbit physics with momentum deceleration
 * - Real-time perspective cursor parallax & expanding shockwave ripples
 * - Live Mumbai IST Clock telemetry ticker (Prem Rathod inspired)
 * - Adaptive color palette for Dark & Light themes
 * ============================================================================
 */

(function () {
    "use strict";

    let canvas, ctx;
    let width = 0, height = 0;
    let isInitialized = false;
    let animFrameId = null;

    // Camera & Perspective Settings
    const FOV = 480;
    let cameraY = -60;
    let cameraZ = 500;

    // Rotation & Momentum
    let rotX = 0.22;
    let rotY = 0;
    let targetRotX = 0.22;
    let targetRotY = 0;
    let velX = 0;
    let velY = 0;
    let isDragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;

    // Kinetic interaction variables
    let shockwaves = [];
    let time = 0;

    // -------------------------------------------------------------------------
    // 1. 3D TERRAIN POINT-CLOUD GRID (Miten Parvatia inspired)
    // -------------------------------------------------------------------------
    const GRID_COLS = 36;
    const GRID_ROWS = 28;
    const GRID_SPACING = 38;
    let terrainPoints = [];

    function initTerrain() {
        terrainPoints = [];
        const startX = -((GRID_COLS - 1) * GRID_SPACING) / 2;
        const startZ = -100;

        for (let r = 0; r < GRID_ROWS; r++) {
            for (let c = 0; c < GRID_COLS; c++) {
                terrainPoints.push({
                    baseX: startX + c * GRID_SPACING,
                    baseY: 130, // Position below center
                    baseZ: startZ + r * GRID_SPACING,
                    col: c,
                    row: r,
                    isCenterPath: (c === Math.floor(GRID_COLS / 2) || c === Math.floor(GRID_COLS / 2) - 1)
                });
            }
        }
    }

    // -------------------------------------------------------------------------
    // 2. 3D FLOATING ICOSAHEDRON & GYROSCOPE CORE
    // -------------------------------------------------------------------------
    const PHI = (1 + Math.sqrt(5)) / 2; // Golden ratio ~1.618
    let icoVertices = [];
    let icoEdges = [];
    const CORE_RADIUS = 68;
    const GYRO_RADIUS_1 = 120;
    const GYRO_RADIUS_2 = 155;

    function buildIcosahedron() {
        const raw = [
            [-1,  PHI, 0], [ 1,  PHI, 0], [-1, -PHI, 0], [ 1, -PHI, 0],
            [ 0, -1,  PHI], [ 0,  1,  PHI], [ 0, -1, -PHI], [ 0,  1, -PHI],
            [ PHI, 0, -1], [ PHI, 0,  1], [-PHI, 0, -1], [-PHI, 0,  1]
        ];
        // Normalize to unit sphere
        icoVertices = raw.map(v => {
            const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
            return [v[0] / len, v[1] / len, v[2] / len];
        });

        // Find edges between adjacent vertices (dist ~ 1.05)
        icoEdges = [];
        for (let i = 0; i < icoVertices.length; i++) {
            for (let j = i + 1; j < icoVertices.length; j++) {
                const dx = icoVertices[i][0] - icoVertices[j][0];
                const dy = icoVertices[i][1] - icoVertices[j][1];
                const dz = icoVertices[i][2] - icoVertices[j][2];
                const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
                if (d < 1.15) {
                    icoEdges.push([i, j]);
                }
            }
        }
    }

    // Traveling photons on gyro rings
    const ringPhotons = [
        { angle: 0, speed: 0.024 },
        { angle: Math.PI, speed: 0.024 },
        { angle: 1.2, speed: -0.02 },
        { angle: 4.3, speed: -0.02 }
    ];

    // -------------------------------------------------------------------------
    // 3. 3D ROTATION & PERSPECTIVE MATH
    // -------------------------------------------------------------------------
    function rotatePoint(x, y, z, rx, ry) {
        // Rotate around Y
        const cosY = Math.cos(ry);
        const sinY = Math.sin(ry);
        const x1 = x * cosY - z * sinY;
        const z1 = z * cosY + x * sinY;

        // Rotate around X
        const cosX = Math.cos(rx);
        const sinX = Math.sin(rx);
        const y2 = y * cosX - z1 * sinX;
        const z2 = z1 * cosX + y * sinX;

        return [x1, y2, z2];
    }

    function project(x, y, z, cx, cy) {
        const effZ = z + cameraZ;
        if (effZ <= 20) return null; // Behind camera
        const scale = FOV / effZ;
        return {
            x: cx + x * scale,
            y: cy + (y - cameraY) * scale,
            scale: scale,
            depth: effZ
        };
    }

    // -------------------------------------------------------------------------
    // 4. MAIN RENDER LOOP
    // -------------------------------------------------------------------------
    function render() {
        if (!ctx || width === 0 || height === 0) {
            animFrameId = requestAnimationFrame(render);
            return;
        }

        time += 0.016;
        ctx.clearRect(0, 0, width, height);

        const isLight = document.body.classList.contains("light");
        const cx = width / 2;
        const cy = height * 0.48; // Centered stage anchor

        // Smooth cursor parallax and momentum
        if (!isDragging) {
            rotX += (targetRotX - rotX) * 0.04;
            rotY += (targetRotY - rotY) * 0.04;
            rotY += 0.003; // Gentle persistent orbit
        } else {
            rotX += velX;
            rotY += velY;
            velX *= 0.92;
            velY *= 0.92;
        }

        // Update shockwaves
        for (let i = shockwaves.length - 1; i >= 0; i--) {
            const sw = shockwaves[i];
            sw.radius += 9;
            sw.alpha *= 0.96;
            if (sw.alpha < 0.01 || sw.radius > sw.maxRadius) {
                shockwaves.splice(i, 1);
            }
        }

        // ---------------------------------------------------------------------
        // A. RENDER 3D UNDULATING POINT-CLOUD TERRAIN
        // ---------------------------------------------------------------------
        const projectedTerrain = [];
        const ridgeLinePoints = [];

        for (let i = 0; i < terrainPoints.length; i++) {
            const p = terrainPoints[i];

            // Wave height computation: multiple harmonic sines
            const wave1 = Math.sin(p.baseX * 0.007 + time * 1.2) * 22;
            const wave2 = Math.cos(p.baseZ * 0.009 + time * 0.9) * 18;
            const wave3 = Math.sin((p.baseX + p.baseZ) * 0.005 + time * 1.5) * 12;

            // Shockwave perturbation
            let shockDisp = 0;
            for (let s = 0; s < shockwaves.length; s++) {
                const sw = shockwaves[s];
                const dx = p.baseX - sw.x;
                const dz = p.baseZ - sw.z;
                const dist = Math.sqrt(dx * dx + dz * dz);
                const diff = Math.abs(dist - sw.radius);
                if (diff < 50) {
                    shockDisp += Math.sin((diff / 50) * Math.PI) * 28 * sw.alpha;
                }
            }

            const currentY = p.baseY + wave1 + wave2 + wave3 - shockDisp;

            // Rotate terrain with slight dampening relative to core
            const [rx, ry, rz] = rotatePoint(p.baseX, currentY, p.baseZ, rotX * 0.7, rotY * 0.5);
            const proj = project(rx, ry, rz, cx, cy);

            if (proj) {
                projectedTerrain.push({
                    proj: proj,
                    row: p.row,
                    col: p.col,
                    isCenterPath: p.isCenterPath,
                    depth: proj.depth
                });

                if (p.isCenterPath && p.col === Math.floor(GRID_COLS / 2)) {
                    ridgeLinePoints.push(proj);
                }
            }
        }

        // Draw connecting terrain grid lines along Z (subtle wireframe depth)
        ctx.lineWidth = 0.7;
        for (let r = 0; r < GRID_ROWS; r += 2) {
            ctx.beginPath();
            let first = true;
            for (let c = 0; c < GRID_COLS; c++) {
                const idx = r * GRID_COLS + c;
                if (idx < terrainPoints.length) {
                    const pt = projectedTerrain.find(tp => tp.row === r && tp.col === c);
                    if (pt) {
                        if (first) {
                            ctx.moveTo(pt.proj.x, pt.proj.y);
                            first = false;
                        } else {
                            ctx.lineTo(pt.proj.x, pt.proj.y);
                        }
                    }
                }
            }
            ctx.strokeStyle = isLight ? "rgba(148, 163, 184, 0.12)" : "rgba(255, 255, 255, 0.04)";
            ctx.stroke();
        }

        // Draw Point-Cloud nodes
        for (let i = 0; i < projectedTerrain.length; i++) {
            const pt = projectedTerrain[i];
            const p = pt.proj;

            // Fog falloff
            const depthFactor = Math.max(0, Math.min(1, 1 - (pt.depth - 300) / 750));
            if (depthFactor <= 0.02) continue;

            let ptRadius = Math.max(0.8, 1.8 * p.scale);
            let color;

            if (pt.isCenterPath) {
                // Central red telemetry crest (Miten Parvatia signature)
                color = isLight ? `rgba(230, 57, 70, ${0.75 * depthFactor})` : `rgba(230, 57, 70, ${0.9 * depthFactor})`;
                ptRadius *= 1.4;
            } else {
                color = isLight ? `rgba(100, 116, 139, ${0.45 * depthFactor})` : `rgba(226, 232, 240, ${0.35 * depthFactor})`;
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, ptRadius, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
        }

        // Draw central crimson telemetry trace line
        if (ridgeLinePoints.length > 2) {
            ctx.beginPath();
            ctx.moveTo(ridgeLinePoints[0].x, ridgeLinePoints[0].y);
            for (let i = 1; i < ridgeLinePoints.length; i++) {
                ctx.lineTo(ridgeLinePoints[i].x, ridgeLinePoints[i].y);
            }
            ctx.lineWidth = isLight ? 1.4 : 1.8;
            ctx.strokeStyle = isLight ? "rgba(230, 57, 70, 0.65)" : "rgba(230, 57, 70, 0.75)";
            ctx.stroke();

            // Glow on dark mode
            if (!isLight) {
                ctx.save();
                ctx.shadowColor = "rgba(230, 57, 70, 0.8)";
                ctx.shadowBlur = 12;
                ctx.stroke();
                ctx.restore();
            }
        }

        // ---------------------------------------------------------------------
        // B. RENDER FLOATING 3D QUANTUM ICOSAHEDRON & GYROSCOPE CORE
        // ---------------------------------------------------------------------
        const coreCenterY = -40; // Floating above terrain
        const coreCenterZ = 120;

        // Transform icosahedron vertices
        const rotatedIco = [];
        const coreScalePulse = 1 + Math.sin(time * 2.2) * 0.04;
        const currentCoreRadius = CORE_RADIUS * coreScalePulse;

        for (let i = 0; i < icoVertices.length; i++) {
            const v = icoVertices[i];
            const vx = v[0] * currentCoreRadius;
            const vy = v[1] * currentCoreRadius;
            const vz = v[2] * currentCoreRadius;

            // Independent subtle spin on core
            const [rx, ry, rz] = rotatePoint(vx, vy, vz, rotX + Math.sin(time * 0.5) * 0.2, rotY + time * 0.4);
            const proj = project(rx, ry + coreCenterY, rz + coreCenterZ, cx, cy);
            rotatedIco.push({ proj, rx, ry, rz, depth: proj ? proj.depth : 999 });
        }

        // Draw Icosahedron Edges with depth sorting
        ctx.lineWidth = isLight ? 1.2 : 1.5;
        for (let i = 0; i < icoEdges.length; i++) {
            const [v1, v2] = icoEdges[i];
            const p1 = rotatedIco[v1].proj;
            const p2 = rotatedIco[v2].proj;

            if (p1 && p2) {
                const avgDepth = (rotatedIco[v1].depth + rotatedIco[v2].depth) / 2;
                const alpha = Math.max(0.15, Math.min(0.85, 1 - (avgDepth - 350) / 400));

                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.strokeStyle = isLight
                    ? `rgba(14, 165, 233, ${alpha * 0.6})`
                    : `rgba(56, 189, 248, ${alpha * 0.7})`;
                ctx.stroke();
            }
        }

        // Draw Icosahedron Vertex Nodes
        for (let i = 0; i < rotatedIco.length; i++) {
            const node = rotatedIco[i];
            if (node.proj) {
                const p = node.proj;
                const r = Math.max(2, 3.8 * p.scale);

                ctx.beginPath();
                ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
                ctx.fillStyle = isLight ? "#0284c7" : "#38bdf8";
                ctx.fill();

                if (!isLight) {
                    ctx.save();
                    ctx.shadowColor = "#38bdf8";
                    ctx.shadowBlur = 10;
                    ctx.fill();
                    ctx.restore();
                }
            }
        }

        // Draw Concentric 3D Gyroscope Ring 1 (tilted on X/Y)
        draw3DGyroRing(cx, cy, coreCenterY, coreCenterZ, GYRO_RADIUS_1, rotX * 1.3, rotY + time * 0.3, isLight, "cyan");

        // Draw Concentric 3D Gyroscope Ring 2 (tilted on Y/Z)
        draw3DGyroRing(cx, cy, coreCenterY, coreCenterZ, GYRO_RADIUS_2, rotX * 0.8 + 0.4, rotY - time * 0.25, isLight, "crimson");

        // Traveling Ring Photons
        for (let i = 0; i < ringPhotons.length; i++) {
            const ph = ringPhotons[i];
            ph.angle += ph.speed;
            const r = (i < 2) ? GYRO_RADIUS_1 : GYRO_RADIUS_2;
            const px = Math.cos(ph.angle) * r;
            const py = Math.sin(ph.angle) * r;
            const rotAppliedX = (i < 2) ? rotX * 1.3 : rotX * 0.8 + 0.4;
            const rotAppliedY = (i < 2) ? rotY + time * 0.3 : rotY - time * 0.25;

            const [rx, ry, rz] = rotatePoint(px, py, 0, rotAppliedX, rotAppliedY);
            const proj = project(rx, ry + coreCenterY, rz + coreCenterZ, cx, cy);

            if (proj) {
                ctx.beginPath();
                ctx.arc(proj.x, proj.y, Math.max(2.5, 4.5 * proj.scale), 0, Math.PI * 2);
                ctx.fillStyle = (i >= 2) ? "#e63946" : (isLight ? "#0284c7" : "#00f0ff");
                ctx.fill();

                if (!isLight) {
                    ctx.save();
                    ctx.shadowColor = (i >= 2) ? "#e63946" : "#00f0ff";
                    ctx.shadowBlur = 14;
                    ctx.fill();
                    ctx.restore();
                }
            }
        }

        animFrameId = requestAnimationFrame(render);
    }

    // Helper: Draw 3D Gyroscope Ring with Telemetry Ticks
    function draw3DGyroRing(cx, cy, centerY, centerZ, radius, rxAngle, ryAngle, isLight, colorType) {
        const SEGMENTS = 48;
        const pts = [];

        for (let i = 0; i <= SEGMENTS; i++) {
            const angle = (i / SEGMENTS) * Math.PI * 2;
            const px = Math.cos(angle) * radius;
            const py = Math.sin(angle) * radius;

            const [rx, ry, rz] = rotatePoint(px, py, 0, rxAngle, ryAngle);
            const proj = project(rx, ry + centerY, rz + centerZ, cx, cy);
            if (proj) {
                pts.push(proj);
            }
        }

        if (pts.length < 3) return;

        // Draw ring stroke
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
            ctx.lineTo(pts[i].x, pts[i].y);
        }
        ctx.closePath();

        const strokeColor = (colorType === "crimson")
            ? (isLight ? "rgba(230, 57, 70, 0.45)" : "rgba(230, 57, 70, 0.55)")
            : (isLight ? "rgba(14, 165, 233, 0.4)" : "rgba(56, 189, 248, 0.45)");

        ctx.lineWidth = isLight ? 1.0 : 1.2;
        ctx.strokeStyle = strokeColor;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.setLineDash([]); // Reset dash

        // Draw tick marks at 4 cardinals
        for (let i = 0; i < 4; i++) {
            const idx = Math.floor((i / 4) * pts.length);
            if (pts[idx]) {
                ctx.beginPath();
                ctx.arc(pts[idx].x, pts[idx].y, 1.8, 0, Math.PI * 2);
                ctx.fillStyle = (colorType === "crimson") ? "#e63946" : (isLight ? "#0284c7" : "#38bdf8");
                ctx.fill();
            }
        }
    }

    // -------------------------------------------------------------------------
    // 5. EVENT LISTENERS & RESIZE
    // -------------------------------------------------------------------------
    function resize() {
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        width = rect.width;
        height = rect.height;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);

        initTerrain();
    }

    function setupEventListeners() {
        window.addEventListener("resize", resize);

        // Mouse Parallax
        window.addEventListener("mousemove", (e) => {
            if (isDragging) return;
            const normX = (e.clientX / window.innerWidth) - 0.5;
            const normY = (e.clientY / window.innerHeight) - 0.5;
            targetRotY = normX * 0.7;
            targetRotX = 0.22 + normY * 0.4;
        });

        // Click & Drag to Orbit Canvas
        canvas.addEventListener("mousedown", (e) => {
            isDragging = true;
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
            velX = 0;
            velY = 0;
        });

        window.addEventListener("mousemove", (e) => {
            if (!isDragging) return;
            const dx = e.clientX - lastMouseX;
            const dy = e.clientY - lastMouseY;
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;

            velY = dx * 0.005;
            velX = -dy * 0.005;
        });

        window.addEventListener("mouseup", () => {
            if (isDragging) {
                isDragging = false;
                targetRotX = rotX;
                targetRotY = rotY;
            }
        });

        // Touch Drag for Mobile
        canvas.addEventListener("touchstart", (e) => {
            if (e.touches.length === 1) {
                isDragging = true;
                lastMouseX = e.touches[0].clientX;
                lastMouseY = e.touches[0].clientY;
                velX = 0;
                velY = 0;
            }
        }, { passive: true });

        window.addEventListener("touchmove", (e) => {
            if (!isDragging || e.touches.length !== 1) return;
            const dx = e.touches[0].clientX - lastMouseX;
            const dy = e.touches[0].clientY - lastMouseY;
            lastMouseX = e.touches[0].clientX;
            lastMouseY = e.touches[0].clientY;

            velY = dx * 0.005;
            velX = -dy * 0.005;
        }, { passive: true });

        window.addEventListener("touchend", () => {
            if (isDragging) {
                isDragging = false;
                targetRotX = rotX;
                targetRotY = rotY;
            }
        });

        // Click Shockwave Ripple
        canvas.addEventListener("click", (e) => {
            const rect = canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left - width / 2;
            const clickY = e.clientY - rect.top - height / 2;

            shockwaves.push({
                x: clickX,
                z: 150,
                radius: 10,
                maxRadius: 420,
                alpha: 1.0
            });
        });
    }

    // -------------------------------------------------------------------------
    // 6. LIVE MUMBAI IST CLOCK (Prem Rathod inspired)
    // -------------------------------------------------------------------------
    function initMumbaiClock() {
        const clockEl = document.getElementById("liveMumbaiClock");
        if (!clockEl) return;

        function updateClock() {
            try {
                const now = new Date();
                const timeStr = now.toLocaleTimeString("en-US", {
                    timeZone: "Asia/Kolkata",
                    hour12: false,
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                });
                clockEl.textContent = `${timeStr} IST`;
            } catch (err) {
                clockEl.textContent = "MUMBAI (IST)";
            }
        }

        updateClock();
        setInterval(updateClock, 1000);
    }

    // -------------------------------------------------------------------------
    // 7. INITIALIZATION
    // -------------------------------------------------------------------------
    function init() {
        if (isInitialized) return;
        canvas = document.getElementById("cyberCoreCanvas");
        if (!canvas) return;

        ctx = canvas.getContext("2d");
        if (!ctx) return;

        isInitialized = true;
        buildIcosahedron();
        initTerrain();
        resize();
        setupEventListeners();
        initMumbaiClock();

        if (!animFrameId) {
            animFrameId = requestAnimationFrame(render);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
