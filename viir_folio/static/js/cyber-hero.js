/**
 * Cyber Hero Console & Telemetry Engine
 * Interactive Hacker Terminal & Defense HUD
 * Viir Phuria Portfolio
 */

(function () {
    "use strict";

    let termInput, termOutput, deckTabs, deckPanels;
    let isScanning = false;

    const COMMANDS = {
        help: [
            "<span class='term-comment'>Available commands:</span>",
            "  <span class='term-accent'>whoami</span>      - Brief summary of Viir Phuria",
            "  <span class='term-accent'>stack</span>       - View core language, frameworks & security tools",
            "  <span class='term-accent'>papers</span>      - Display IEEE published research work",
            "  <span class='term-accent'>scan</span>        - Run active telemetry & vulnerability diagnostic",
            "  <span class='term-accent'>sudo hire</span>   - Open direct encrypted line with Viir",
            "  <span class='term-accent'>clear</span>       - Clear terminal screen buffer"
        ],
        whoami: [
            "<span class='term-bold'>Viir Phuria</span> — <span class='term-success'>Cybersecurity Engineer & Full-Stack Architect</span>",
            "<span class='term-comment'>• Focus:</span> Application Security, Zero-Trust Architecture, Deep Learning",
            "<span class='term-comment'>• Research:</span> Published IEEE Researcher (2+ peer-reviewed papers)",
            "<span class='term-comment'>• Location:</span> Mumbai, India • Available worldwide for engineering & research"
        ],
        stack: [
            "<span class='term-accent'>[LANGUAGES]</span>   Python, Go, Dart, JavaScript/TypeScript, SQL, C/C++",
            "<span class='term-accent'>[FRAMEWORKS]</span>  Django, DRF, Flutter, FastAPI, PostgreSQL, Docker",
            "<span class='term-accent'>[SECURITY]</span>    AppSec, Pentesting, OWASP Top 10, Cryptography, Burp",
            "<span class='term-accent'>[AI / ML]</span>     PyTorch, Threat Detection, Neural Anomaly Modeling"
        ],
        papers: [
            "<span class='term-success'>[IEEE PUBLICATION 01]</span> <span class='term-bold'>AI-Driven Cybersecurity Defense Frameworks</span>",
            "<span class='term-comment'>  Published in IEEE Xplore • Focus on predictive vulnerability modeling</span>",
            "<span class='term-success'>[IEEE PUBLICATION 02]</span> <span class='term-bold'>Distributed Microservice Security Assessment</span>",
            "<span class='term-comment'>  Peer-reviewed architecture analysis • High-throughput security</span>"
        ],
        clear: "__CLEAR__"
    };

    function init() {
        termInput = document.getElementById("cyberTermInput");
        termOutput = document.getElementById("cyberTermOutput");
        deckTabs = document.querySelectorAll(".deck-tab-btn");
        deckPanels = document.querySelectorAll(".deck-tab-panel");

        if (!termOutput) return;

        setupTabs();
        setupInput();
        setupChips();
        setupAuditTrigger();
        bootSequence();
    }

    function setupTabs() {
        deckTabs.forEach(tab => {
            tab.addEventListener("click", () => {
                const target = tab.getAttribute("data-tab");
                deckTabs.forEach(t => t.classList.remove("active"));
                deckPanels.forEach(p => {
                    p.style.display = "none";
                    p.classList.remove("active");
                });

                tab.classList.add("active");
                const targetPanel = document.getElementById(target);
                if (targetPanel) {
                    targetPanel.style.display = "block";
                    targetPanel.classList.add("active");
                }
            });
        });
    }

    function setupInput() {
        if (!termInput) return;

        termInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                const rawVal = termInput.value.trim().toLowerCase();
                termInput.value = "";
                if (!rawVal) return;
                executeCommand(rawVal);
            }
        });
    }

    function setupChips() {
        const chips = document.querySelectorAll(".term-chip");
        chips.forEach(chip => {
            chip.addEventListener("click", () => {
                const cmd = chip.getAttribute("data-cmd");
                if (cmd) executeCommand(cmd);
            });
        });
    }

    function setupAuditTrigger() {
        const auditBtn = document.getElementById("btnTriggerAudit");
        if (auditBtn) {
            auditBtn.addEventListener("click", () => {
                runSecurityAudit();
            });
        }
    }

    function printLine(html) {
        if (!termOutput) return;
        const line = document.createElement("div");
        line.className = "term-line";
        line.innerHTML = html;
        termOutput.appendChild(line);
        termOutput.scrollTop = termOutput.scrollHeight;
    }

    function executeCommand(cmd) {
        // Echo user command
        printLine("<span class='term-accent'>viir@sec-ops:~$</span> <span class='term-bold'>" + escapeHtml(cmd) + "</span>");

        if (cmd === "clear") {
            termOutput.innerHTML = "";
            return;
        }

        if (cmd === "scan" || cmd === "audit") {
            runSecurityAudit();
            return;
        }

        if (cmd === "sudo hire" || cmd === "hire" || cmd === "contact") {
            printLine("<span class='term-success'>[⚡] ACCESS GRANTED. Initializing encrypted channel to Viir...</span>");
            setTimeout(() => {
                const contactSec = document.getElementById("contact") || document.getElementById("connect");
                if (contactSec) {
                    contactSec.scrollIntoView({ behavior: "smooth" });
                }
            }, 800);
            return;
        }

        if (COMMANDS[cmd]) {
            COMMANDS[cmd].forEach(l => printLine(l));
        } else {
            printLine("<span class='term-red'>zsh: command not found: " + escapeHtml(cmd) + "</span>");
            printLine("<span class='term-comment'>Type <span class='term-accent'>help</span> or click command chips below.</span>");
        }
    }

    function runSecurityAudit() {
        if (isScanning) return;
        isScanning = true;

        // Switch to terminal tab if not already active so user sees progress
        const termTab = document.querySelector('[data-tab="panelTerminal"]');
        if (termTab && !termTab.classList.contains("active")) {
            termTab.click();
        }

        printLine("<span class='term-accent'>[+] Initializing live security & defense audit...</span>");

        setTimeout(() => {
            printLine("<span class='term-success'>[✔] Stage 1/3:</span> Cryptographic handshake verified <span class='term-comment'>(TLS 1.3 / AES-256-GCM)</span>");
        }, 500);

        setTimeout(() => {
            printLine("<span class='term-success'>[✔] Stage 2/3:</span> Perimeter inspection completed <span class='term-comment'>(0 open vulnerabilities)</span>");
        }, 1100);

        setTimeout(() => {
            printLine("<span class='term-success'>[✔] Stage 3/3:</span> Neural threat modeling <span class='term-comment'>(Integrity: 100% NOMINAL)</span>");
            printLine("<span class='term-bold' style='color:#34d399;'>[✓] PORTFOLIO HEALTH: AUDIT PASSED WITH ZERO FINDINGS.</span>");
            isScanning = false;
        }, 1700);
    }

    function bootSequence() {
        const bootLines = [
            "<span class='term-comment'>// Viir Phuria Security & Operations Kernel v4.19</span>",
            "<span class='term-success'>[OK]</span> Encrypted enclave initialized.",
            "<span class='term-success'>[OK]</span> Telemetry nodes online. Defense protocols active.",
            "<span class='term-bold'>Type a command or click quick badges below:</span>"
        ];

        bootLines.forEach(l => printLine(l));
    }

    function escapeHtml(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }

    // Initialize when DOM is ready
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

    // Expose global trigger for hero button
    window.launchCyberTerminal = function () {
        const termTab = document.querySelector('[data-tab="panelTerminal"]');
        if (termTab) termTab.click();
        const input = document.getElementById("cyberTermInput");
        if (input) input.focus();
    };
})();
