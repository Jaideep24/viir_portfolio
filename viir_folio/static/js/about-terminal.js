/**
 * Interactive Terminal Engine for Portfolio About Section
 * Advanced Features:
 * - Dynamic Database Context ingestion (skills, projects, certs, research, experience, CV)
 * - Virtual filesystem with navigation (cd, pwd, cd ..)
 * - Authentic hidden files & directories (.secret.txt, .bash_history, .vault/)
 * - UNIX flags: ls, ls -a, ls -la, ls -l
 * - Cyber Commands: nmap, scan, curl, ping, grep, base64, top, htop, uname, sudo
 * - Navigation shortcuts: whoami, skills, projects, certs, research, experience, resume, contact, socials
 * - Terminal Utilities: theme (dark/light/matrix), matrix ASCII, history, clear, cls, date, echo, reboot
 * - Keyboard shortcuts: Tab autocompletion, Up/Down history, Ctrl+L, Ctrl+C
 * - Interactive click-to-run file links and suggestion pills
 */
(function () {
    function initAboutTerminal() {
        const termCard = document.getElementById("aboutTerminalCard");
        const termBody = document.getElementById("aboutTerminalBody");
        const historyDiv = document.getElementById("terminalOutputHistory");
        const termInput = document.getElementById("aboutTerminalInput");
        const activePromptSpan = document.querySelector(".terminal-active-line .terminal-prompt");

        if (!termCard || !termBody || !historyDiv || !termInput) return;

        // Prevent double initialization
        if (termCard.dataset.initialized === "true") return;
        termCard.dataset.initialized = "true";

        // Current Working Directory State
        let currentDir = "~"; // "~" or "~/.vault"

        function updatePrompts() {
            if (activePromptSpan) {
                activePromptSpan.textContent = `viir:${currentDir}$`;
            }
        }

        // 1. Ingest Dynamic Database Context if present
        let dbData = { skills: [], projects: [], certs: [], publications: [], experience: [], cv_url: "" };
        const dbScript = document.getElementById("terminalDbData");
        if (dbScript) {
            try {
                dbData = JSON.parse(dbScript.textContent);
            } catch (e) {
                console.warn("Could not parse terminalDbData JSON:", e);
            }
        }

        const whoamiContent = termCard.dataset.whoami || "Cybersecurity Engineer & Full-Stack Developer specializing in application security, penetration testing, and resilient architectures.";
        const userRole = termCard.dataset.role || "Cybersecurity Engineer";
        const userEmail = termCard.dataset.email || "virvphuria@gmail.com";
        const userLocation = termCard.dataset.location || "India";
        const userGithub = termCard.dataset.github || "https://github.com/Viir-Phuria";
        const userLinkedin = termCard.dataset.linkedin || "https://linkedin.com/in/viir-phuria";

        // Build dynamic file strings from database models
        let skillsTxt = "";
        if (dbData.skills && dbData.skills.length > 0) {
            skillsTxt = dbData.skills.map(cat => `[${cat.category.toUpperCase()}]\n${cat.items.join(", ")}`).join("\n\n");
        } else {
            skillsTxt = `[SECURITY]      AppSec, Pentesting, OWASP Top 10, Wireshark, Burp Suite, Kali Linux\n[LANGUAGES]     Python, Go, JavaScript, C/C++, SQL, Dart\n[FRAMEWORKS]    Django, FastAPI, React, Flutter, Flask\n[TOOLS & CLOUD] Docker, Git/GitHub, PostgreSQL, Linux, Nginx, Firebase`;
        }

        let projectsTxt = "";
        if (dbData.projects && dbData.projects.length > 0) {
            projectsTxt = dbData.projects.map((p, idx) => `* ${p.title} (${p.date || 'Recent'})\n  ${p.description ? p.description.slice(0, 160) + '...' : ''}\n  Link: ${p.url || p.github || 'https://github.com/Viir-Phuria'}`).join("\n\n");
        } else {
            projectsTxt = `* PhishGuard  - Dynamic Phishing Simulation & Security Awareness Platform\n* Urban Agro  - Smart IoT Agriculture Engine with Real-Time Sensor Telemetry\n* SecureVault - Zero-Knowledge Client-Side AES-256 Storage Solution\n* Anomaly IDS - Network Anomaly & Packet Threat Detection Daemon\n(Explore all case studies in the Featured Projects section below)`;
        }

        let certsTxt = "";
        if (dbData.certs && dbData.certs.length > 0) {
            certsTxt = dbData.certs.map(c => `[x] ${c.title} — ${c.platform} (${c.date || 'Verified'})`).join("\n");
        } else {
            certsTxt = `[x] Certified Ethical Hacker (CEH)\n[x] Cisco Certified Network Associate (CCNA)\n[x] Palo Alto Networks Cybersecurity Specialist\n[x] Google Cybersecurity Professional Certificate`;
        }

        let researchTxt = "";
        if (dbData.publications && dbData.publications.length > 0) {
            researchTxt = dbData.publications.map((pub, idx) => `[${idx + 1}] "${pub.title}"\n    Venue: ${pub.place} (${pub.date || 'Published'})\n    Link:  ${pub.url || 'IEEE Xplore'}`).join("\n\n");
        } else {
            researchTxt = `[1] "Anomaly-Based Network Intrusion Detection in Cloud Microservices"\n    Venue: IEEE International Conference on Cyber Security\n    Link:  https://ieeexplore.ieee.org`;
        }

        let experienceTxt = "";
        if (dbData.experience && dbData.experience.length > 0) {
            experienceTxt = dbData.experience.map(exp => `* ${exp.title} @ ${exp.company}\n  Duration: ${exp.period}\n  Location: ${exp.location || 'Remote/India'}`).join("\n\n");
        } else {
            experienceTxt = `* Cybersecurity Engineer & Developer @ Security Solutions\n  Focus: Penetration Testing, Secure Code Review, Hardening\n  Duration: 2023 - Present`;
        }

        const cvUrl = dbData.cv_url || "";
        const cvTxt = `Viir Phuria — Curriculum Vitae\nRole: ${userRole}\nEmail: ${userEmail}\nStatus: Available for Full-Time & Security Engineering Contracts\nCV Document: ${cvUrl ? cvUrl : 'Available on request'}\n(Type 'resume' or 'cv' to view/download directly)`;

        // Virtual Root Filesystem
        const rootFiles = {
            "whoami.txt":     { type: "file", content: whoamiContent, permissions: "-rw-r--r--", size: "340" },
            "skills.txt":     { type: "file", content: skillsTxt, permissions: "-rw-r--r--", size: "380" },
            "projects.txt":   { type: "file", content: projectsTxt, permissions: "-rw-r--r--", size: "520" },
            "certs.txt":      { type: "file", content: certsTxt, permissions: "-rw-r--r--", size: "310" },
            "research.txt":   { type: "file", content: researchTxt, permissions: "-rw-r--r--", size: "390" },
            "experience.txt": { type: "file", content: experienceTxt, permissions: "-rw-r--r--", size: "350" },
            "cv.txt":         { type: "file", content: cvTxt, permissions: "-rw-r--r--", size: "260" },
            "contact.sh": {
                type: "file",
                content:
`#!/bin/bash
echo "Operator: Viir Phuria"
echo "Role:     ${userRole}"
echo "Email:    ${userEmail}"
echo "Location: ${userLocation}"
echo "GitHub:   ${userGithub}"
echo "LinkedIn: ${userLinkedin}"
echo "PGP Key:  4A8F C910 2E77 B104 (Verified)"
echo "Status:   Open for High-Impact Security & Engineering Roles"`,
                permissions: "-rwxr-xr-x",
                size: "340",
                executable: true
            },
            // Hidden files and folders (revealed with ls -a or ls -la)
            ".secret.txt": {
                type: "file",
                hidden: true,
                content:
`[CLEARANCE LEVEL 5 GRANTED]
FLAG{v11r_s3cur1ty_pr0t0c0l_v7}
"Security is an active pursuit, not a passive checkbox."
Next target: Explore ~/.vault directory (try: cd .vault && ls -la)`,
                permissions: "-rw-r-----",
                size: "195"
            },
            ".bash_history": {
                type: "file",
                hidden: true,
                content:
`nmap -sV -sC -Pn 192.168.1.1/24
wireshark -k -i eth0
cat whoami.txt
python3 -m venv .venv
git commit -m "feat: harden production cryptography and CSP"
ls -la
cd .vault
cat flag.txt`,
                permissions: "-rw-------",
                size: "260"
            },
            ".vault": {
                type: "dir",
                hidden: true,
                permissions: "drwx------",
                size: "4096"
            }
        };

        const vaultFiles = {
            "flag.txt": {
                type: "file",
                content:
`[VAULT ACCESS GRANTED]
FLAG{c0ngr4ts_y0u_f0und_th3_h1dd3n_v4ult}
"Great security engineers always check what's hidden beneath the surface."`,
                permissions: "-rw-r-----",
                size: "155"
            },
            "notes.txt": {
                type: "file",
                content:
`Confidential Audit Note:
- Web Application Pentest scope completed.
- CSP nonces, HSTS (max-age=31536000), and X-Frame-Options: DENY deployed.
- Rate limiting confirmed via django-ratelimit and django-axes.
- Zero plaintext secrets in version control.`,
                permissions: "-rw-r--r--",
                size: "245"
            }
        };

        const commandHistory = [];
        let historyIndex = -1;

        function scrollToBottom() {
            requestAnimationFrame(() => {
                termBody.scrollTop = termBody.scrollHeight;
            });
        }

        function escapeHtml(str) {
            return String(str)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");
        }

        function appendCommandLine(cmdText) {
            const line = document.createElement("div");
            line.className = "terminal-line";
            line.innerHTML = `<span class="terminal-prompt">viir:${currentDir}$</span> <span class="terminal-command">${escapeHtml(cmdText)}</span>`;
            historyDiv.appendChild(line);
        }

        function appendOutput(htmlContent) {
            const out = document.createElement("div");
            out.className = "term-cmd-res";
            out.innerHTML = htmlContent;
            historyDiv.appendChild(out);
            scrollToBottom();
        }

        function getCurrentDirFiles() {
            return currentDir === "~/.vault" ? vaultFiles : rootFiles;
        }

        function executeCommand(rawInput) {
            const trimmed = rawInput.trim();
            if (!trimmed) {
                appendCommandLine("");
                scrollToBottom();
                return;
            }

            commandHistory.push(trimmed);
            historyIndex = commandHistory.length;
            appendCommandLine(trimmed);

            const parts = trimmed.split(/\s+/);
            const cmd = parts[0].toLowerCase();
            const args = parts.slice(1);

            const currentFiles = getCurrentDirFiles();

            switch (cmd) {
                case "start":
                case "menu":
                case "welcome":
                case "help":
                    appendOutput(
`<div style="font-family:'JetBrains Mono',monospace; font-size:0.79rem; line-height:1.65;">
<span style="color:#38bdf8; font-weight:700;">VIIR PHURIA // INTERACTIVE SECBOX DIRECTORY</span>
<div style="color:#94a3b8; margin:2px 0 6px;">Explore portfolio intelligence & cyber tools via standard Unix commands:</div>

<span style="color:#a78bfa; font-weight:600;">[1] PORTFOLIO HIGHLIGHTS:</span>
  <span class="term-suggest-cmd" data-cmd="whoami">whoami</span>       - Operator identity & role
  <span class="term-suggest-cmd" data-cmd="skills">skills</span>       - Technical skill competencies
  <span class="term-suggest-cmd" data-cmd="projects">projects</span>     - Production systems & case studies
  <span class="term-suggest-cmd" data-cmd="research">research</span>     - Published IEEE research papers
  <span class="term-suggest-cmd" data-cmd="certs">certs</span>        - Verified security & cloud credentials
  <span class="term-suggest-cmd" data-cmd="experience">experience</span>   - Engineering career history
  <span class="term-suggest-cmd" data-cmd="resume">resume</span> / <span class="term-suggest-cmd" data-cmd="cv">cv</span>  - View & download official PDF resume
  <span class="term-suggest-cmd" data-cmd="socials">socials</span>      - GitHub, LinkedIn, Email endpoints

<span style="color:#a78bfa; font-weight:600;">[2] FILE SYSTEM & RECON:</span>
  <span class="term-suggest-cmd" data-cmd="ls">ls</span> / <span class="term-suggest-cmd" data-cmd="ls -la">ls -la</span>  - List files (use -la for hidden .secret.txt & .vault)
  <span class="term-suggest-cmd" data-cmd="cd .vault">cd &lt;dir&gt;</span>     - Change folder (e.g. cd .vault, cd ..)
  <span class="term-suggest-cmd" data-cmd="pwd">pwd</span>          - Print working directory
  <span class="term-suggest-cmd" data-cmd="cat whoami.txt">cat &lt;file&gt;</span>   - Read file (e.g. cat skills.txt, cat research.txt)
  <span class="term-suggest-cmd" data-cmd="grep security whoami.txt">grep &lt;t&gt; &lt;f&gt;</span> - Search pattern within file

<span style="color:#a78bfa; font-weight:600;">[3] CYBERSECURITY & NETWORK:</span>
  <span class="term-suggest-cmd" data-cmd="nmap viir.tech">nmap</span>         - Port & service vulnerability scan
  <span class="term-suggest-cmd" data-cmd="curl -I https://viir.tech">curl</span>         - Inspect hardened HTTP security headers
  <span class="term-suggest-cmd" data-cmd="ping viir.tech">ping</span>         - ICMP latency echo check
  <span class="term-suggest-cmd" data-cmd="top">top</span> / <span class="term-suggest-cmd" data-cmd="htop">htop</span>   - Active system daemons & tasks
  <span class="term-suggest-cmd" data-cmd="base64 hello">base64</span>       - Encode / decode strings

<span style="color:#a78bfa; font-weight:600;">[4] THEMES & SHELL CONTROLS:</span>
  <span class="term-suggest-cmd" data-cmd="theme matrix">theme matrix</span> - Green phosphor cyberpunk mode
  <span class="term-suggest-cmd" data-cmd="theme dark">theme dark</span>   - Switch portfolio to dark mode
  <span class="term-suggest-cmd" data-cmd="theme light">theme light</span>  - Switch portfolio to light mode
  <span class="term-suggest-cmd" data-cmd="history">history</span>      - View command session history
  <span class="term-suggest-cmd" data-cmd="clear">clear</span> / <span class="term-suggest-cmd" data-cmd="cls">cls</span>  - Clear screen buffer
  <span class="term-suggest-cmd" data-cmd="reboot">reboot</span>       - Reset terminal to boot state
</div>`
                    );
                    break;

                case "pwd":
                    appendOutput(currentDir === "~" ? "/home/viir" : "/home/viir/.vault");
                    break;

                case "cd":
                    const target = (args[0] || "~").trim();
                    if (target === "~" || target === "") {
                        currentDir = "~";
                        updatePrompts();
                    } else if (target === ".." || target === "../") {
                        if (currentDir === "~/.vault") {
                            currentDir = "~";
                            updatePrompts();
                        } else {
                            appendOutput('<span style="color:#ef4444;">bash: cd: /home: Permission denied (restricted sandbox environment)</span>');
                        }
                    } else if (target === ".vault" || target === ".vault/" || target === "~/.vault") {
                        if (currentDir === "~") {
                            currentDir = "~/.vault";
                            updatePrompts();
                        } else {
                            appendOutput('<span style="color:#94a3b8;">Already in ~/.vault</span>');
                        }
                    } else if (target === ".") {
                        // Current directory stays unchanged
                    } else {
                        appendOutput(`<span style="color:#ef4444;">bash: cd: ${escapeHtml(target)}: No such file or directory</span>`);
                    }
                    break;

                case "ls":
                case "dir": {
                    const flags = args.filter(a => a.startsWith("-")).join("");
                    const showAll = flags.includes("a");
                    const showLong = flags.includes("l");

                    let fileNames = Object.keys(currentFiles);
                    if (!showAll) {
                        fileNames = fileNames.filter(name => !name.startsWith("."));
                    }

                    if (showLong) {
                        let table = `<div style="font-family:'JetBrains Mono',monospace; font-size:0.78rem; opacity:0.95;">`;
                        table += `<div style="color:#94a3b8; margin-bottom:4px;">total ${fileNames.length * 4}</div>`;
                        if (showAll) {
                            table += `<div><span style="color:#64748b;">drwxr-xr-x 3 viir viir  4096 Oct 18 19:15</span> <span class="term-dir">.</span></div>`;
                            table += `<div><span style="color:#64748b;">drwxr-xr-x 3 root root  4096 Oct 18 18:00</span> <span class="term-dir">..</span></div>`;
                        }
                        fileNames.forEach(fn => {
                            const item = currentFiles[fn];
                            const isDir = item.type === "dir";
                            const colorClass = isDir ? "term-dir" : (item.executable ? "term-file-sh" : (fn.includes("secret") || fn.includes("flag") ? "term-file-secret" : "term-file-txt"));
                            table += `<div><span style="color:#64748b;">${item.permissions} 1 viir viir ${item.size.padStart(5, ' ')} Oct 18 19:15</span> <span class="${colorClass}" data-cmd="${isDir ? `cd ${fn}` : `cat ${fn}`}" style="cursor:pointer;" title="Click to ${isDir ? 'enter' : 'view'}">${fn}${isDir ? '/' : ''}</span></div>`;
                        });
                        table += `</div>`;
                        appendOutput(table);
                    } else {
                        let outHtml = "";
                        fileNames.forEach(fn => {
                            const item = currentFiles[fn];
                            const isDir = item.type === "dir";
                            const colorClass = isDir ? "term-res-file term-dir" : (item.executable ? "term-res-file term-file-sh" : (fn.includes("secret") || fn.includes("flag") ? "term-res-file term-file-secret" : "term-res-file term-file-txt"));
                            outHtml += `<span class="${colorClass}" data-cmd="${isDir ? `cd ${fn}` : `cat ${fn}`}" style="cursor:pointer;" title="Click to ${isDir ? 'enter' : 'view'}">${fn}${isDir ? '/' : ''}</span>`;
                        });
                        appendOutput(outHtml);
                    }
                    break;
                }

                case "cat":
                case "type":
                    if (!args.length) {
                        appendOutput('<span style="color:#ef4444;">usage: cat &lt;filename&gt; (try: <span class="term-suggest-cmd" data-cmd="cat skills.txt">cat skills.txt</span> or <span class="term-suggest-cmd" data-cmd="cat research.txt">cat research.txt</span>)</span>');
                    } else {
                        const filename = args[0];
                        if (filename === "secret.txt" && currentDir === "~") {
                            appendOutput('<span style="color:#ef4444;">cat: secret.txt: No such file or directory.</span><br><span style="color:#64748b;">(Hint: Check for hidden files with <span class="term-suggest-cmd" data-cmd="ls -la">ls -la</span> or try <span class="term-suggest-cmd" data-cmd="cat .secret.txt">cat .secret.txt</span>)</span>');
                        } else if (currentFiles[filename]) {
                            if (currentFiles[filename].type === "dir") {
                                appendOutput(`<span style="color:#ef4444;">cat: ${escapeHtml(filename)}: Is a directory (try <span class="term-suggest-cmd" data-cmd="cd ${filename}">cd ${filename}</span>)</span>`);
                            } else {
                                appendOutput(escapeHtml(currentFiles[filename].content));
                            }
                        } else {
                            appendOutput(`<span style="color:#ef4444;">cat: ${escapeHtml(filename)}: No such file or directory. Type <span class="term-suggest-cmd" data-cmd="ls">ls</span> to list files.</span>`);
                        }
                    }
                    break;

                case "grep":
                    if (args.length < 2) {
                        appendOutput('<span style="color:#ef4444;">usage: grep &lt;pattern&gt; &lt;file&gt; (e.g. grep security whoami.txt)</span>');
                    } else {
                        const pattern = args[0].replace(/^["']|["']$/g, "").toLowerCase();
                        const targetFile = args[1];
                        if (currentFiles[targetFile] && currentFiles[targetFile].type === "file") {
                            const lines = currentFiles[targetFile].content.split("\n");
                            const matched = lines.filter(l => l.toLowerCase().includes(pattern));
                            if (matched.length > 0) {
                                appendOutput(escapeHtml(matched.join("\n")));
                            } else {
                                appendOutput(`<span style="color:#94a3b8;">Pattern "${escapeHtml(pattern)}" not found in ${escapeHtml(targetFile)}</span>`);
                            }
                        } else {
                            appendOutput(`<span style="color:#ef4444;">grep: ${escapeHtml(targetFile)}: No such file</span>`);
                        }
                    }
                    break;

                case "nmap":
                case "scan": {
                    const targetHost = (args[0] && !args[0].startsWith("-")) ? args[0] : "viir.tech";
                    appendOutput(
`<span style="color:#38bdf8;">Starting Nmap 7.94 ( https://nmap.org ) at ${new Date().toLocaleTimeString()}</span>
Nmap scan report for ${escapeHtml(targetHost)} (127.0.0.1)
Host is up (0.00021s latency).
Not shown: 996 closed tcp ports (reset)
<span style="color:#a78bfa; font-weight:600;">PORT     STATE    SERVICE       VERSION</span>
<span style="color:#4ade80;">22/tcp   filtered ssh           OpenSSH 9.3p1 (Key-Auth Enforcement)</span>
<span style="color:#4ade80;">80/tcp   open     http          nginx/1.24.0 (301 Moved Permanently)</span>
<span style="color:#4ade80;">443/tcp  open     ssl/https     nginx/1.24.0 (TLSv1.3, Strict CSP, HSTS)</span>
<span style="color:#4ade80;">8000/tcp open     http-alt      Django Core Engine (Hardened WSGI)</span>
Security Profile: <span style="color:#22c55e;">A+ SSL Labs / Zero Plaintext / Brute-force Protected</span>`
                    );
                    break;
                }

                case "curl": {
                    const url = args.find(a => !a.startsWith("-")) || "https://viir.tech";
                    appendOutput(
`<span style="color:#4ade80;">HTTP/2 200 OK</span>
<span style="color:#94a3b8;">server:</span> nginx/1.24.0 (Ubuntu)
<span style="color:#94a3b8;">date:</span> ${new Date().toUTCString()}
<span style="color:#94a3b8;">content-type:</span> text/html; charset=UTF-8
<span style="color:#38bdf8;">strict-transport-security:</span> max-age=31536000; includeSubDomains; preload
<span style="color:#38bdf8;">content-security-policy:</span> default-src 'self'; script-src 'self' 'nonce-...'
<span style="color:#38bdf8;">x-frame-options:</span> DENY
<span style="color:#38bdf8;">x-content-type-options:</span> nosniff
<span style="color:#38bdf8;">referrer-policy:</span> strict-origin-when-cross-origin
<span style="color:#22c55e;">[SUCCESS] Connection established over TLSv1.3 / AES-256-GCM</span>`
                    );
                    break;
                }

                case "ping": {
                    const host = args[0] || "viir.tech";
                    appendOutput(
`PING ${escapeHtml(host)} (127.0.0.1) 56(84) bytes of data.
64 bytes from ${escapeHtml(host)}: icmp_seq=1 ttl=64 time=11.2 ms
64 bytes from ${escapeHtml(host)}: icmp_seq=2 ttl=64 time=10.8 ms
64 bytes from ${escapeHtml(host)}: icmp_seq=3 ttl=64 time=12.1 ms
64 bytes from ${escapeHtml(host)}: icmp_seq=4 ttl=64 time=11.5 ms

--- ${escapeHtml(host)} ping statistics ---
4 packets transmitted, 4 received, 0% packet loss, time 3004ms
rtt min/avg/max = 10.8/11.4/12.1 ms`
                    );
                    break;
                }

                case "theme": {
                    const mode = (args[0] || "").toLowerCase();
                    if (mode === "matrix" || mode === "hacker") {
                        termCard.classList.toggle("term-matrix-mode");
                        const isMatrix = termCard.classList.contains("term-matrix-mode");
                        appendOutput(`<span style="color:#22c55e;">[MATRIX HUD] Terminal green phosphor mode: <b>${isMatrix ? 'ACTIVATED' : 'DEACTIVATED'}</b></span>`);
                    } else if (mode === "light") {
                        if (document.body.classList.contains("dark") && typeof window.toggleStyles === "function") {
                            window.toggleStyles();
                        }
                        appendOutput('<span style="color:#38bdf8;">Theme switched to Light mode.</span>');
                    } else if (mode === "dark") {
                        if (document.body.classList.contains("light") && typeof window.toggleStyles === "function") {
                            window.toggleStyles();
                        }
                        appendOutput('<span style="color:#38bdf8;">Theme switched to Dark mode.</span>');
                    } else {
                        if (typeof window.toggleStyles === "function") {
                            window.toggleStyles();
                            appendOutput('<span style="color:#38bdf8;">Theme toggled.</span>');
                        } else {
                            appendOutput('Usage: <span class="term-suggest-cmd" data-cmd="theme dark">theme dark</span>, <span class="term-suggest-cmd" data-cmd="theme light">theme light</span>, or <span class="term-suggest-cmd" data-cmd="theme matrix">theme matrix</span>');
                        }
                    }
                    break;
                }

                case "matrix": {
                    termCard.classList.add("term-matrix-mode");
                    appendOutput(
`<span style="color:#22c55e; font-weight:bold;">
  __  __       _        _      
 |  \\/  | __ _| |_ _ __(_)_  __
 | |\\/| |/ _\` | __| '__| \\ \\/ /
 | |  | | (_| | |_| |  | |>  < 
 |_|  |_|\\__,_|\\__|_|  |_/_/\\_\\
</span>
<span style="color:#86efac;">[SYSTEM OVERRIDE] Cyber neural security matrix online.
Type 'theme matrix' anytime to toggle this view.</span>`
                    );
                    break;
                }

                case "top":
                case "htop": {
                    appendOutput(
`<span style="color:#94a3b8;">top - ${new Date().toLocaleTimeString()} up 42 days, 1 user, load average: 0.14, 0.08, 0.05</span>
Tasks: 182 total, 1 running, 181 sleeping, 0 stopped
%Cpu(s): 1.8 us, 0.6 sy, 0.0 ni, 97.4 id, 0.2 wa
MiB Mem : 16384.0 total, 9240.2 free, 4120.4 used

<span style="color:#a78bfa;">  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     COMMAND</span>
 1042 viir      20   0  428912  64210  28192 S   2.1   0.4     django-uwsgi
  890 root      20   0  182400  18900  12400 S   0.8   0.1     nginx: worker
  612 root      20   0   94210  12400   8200 S   0.2   0.1     auditd
  744 root      20   0  114200  16200  10400 S   0.1   0.1     fail2ban-server
  501 postgres  20   0  384210  98200  42100 S   0.1   0.6     postgres: core`
                    );
                    break;
                }

                case "base64": {
                    if (!args.length) {
                        appendOutput('usage: base64 [-d] &lt;text&gt; (e.g. base64 hello or base64 -d SGVsbG8=)');
                    } else if (args[0] === "-d" && args.length > 1) {
                        try {
                            appendOutput(escapeHtml(atob(args.slice(1).join(" "))));
                        } catch (e) {
                            appendOutput('<span style="color:#ef4444;">base64: invalid input</span>');
                        }
                    } else {
                        try {
                            appendOutput(escapeHtml(btoa(args.join(" "))));
                        } catch (e) {
                            appendOutput('<span style="color:#ef4444;">base64: encoding error</span>');
                        }
                    }
                    break;
                }

                case "history": {
                    let histHtml = '<div style="font-family:\'JetBrains Mono\',monospace; font-size:0.78rem;">';
                    commandHistory.forEach((h, i) => {
                        histHtml += `<div><span style="color:#64748b;">${String(i + 1).padStart(3, " ")}</span>  ${escapeHtml(h)}</div>`;
                    });
                    histHtml += '</div>';
                    appendOutput(histHtml);
                    break;
                }

                case "socials": {
                    appendOutput(
`Communication & Profile Endpoints:
* GitHub:   <a href="${escapeHtml(userGithub)}" target="_blank" rel="noopener noreferrer" style="color:#38bdf8; text-decoration:underline;">${escapeHtml(userGithub)}</a>
* LinkedIn: <a href="${escapeHtml(userLinkedin)}" target="_blank" rel="noopener noreferrer" style="color:#38bdf8; text-decoration:underline;">${escapeHtml(userLinkedin)}</a>
* Email:    <a href="mailto:${escapeHtml(userEmail)}" style="color:#38bdf8; text-decoration:underline;">${escapeHtml(userEmail)}</a>`
                    );
                    break;
                }

                case "resume":
                case "cv": {
                    if (cvUrl) {
                        appendOutput(
`Curriculum Vitae:
* Direct Link: <a href="${escapeHtml(cvUrl)}" target="_blank" rel="noopener noreferrer" style="color:#4ade80; font-weight:600; text-decoration:underline;">Open / Download Official CV (PDF)</a>
Opening document in new tab...`
                        );
                        window.open(cvUrl, "_blank");
                    } else {
                        appendOutput(escapeHtml(cvTxt));
                    }
                    break;
                }

                case "clear":
                case "cls":
                    historyDiv.innerHTML = "";
                    scrollToBottom();
                    break;

                case "reboot":
                case "reset":
                    historyDiv.innerHTML = "";
                    currentDir = "~";
                    updatePrompts();
                    appendOutput(
`Linux viir-secbox 6.8.0-kali-amd64 #1 SMP PREEMPT_DYNAMIC
System initialized. All security daemons active.
Type <span class="term-suggest-cmd" data-cmd="help">help</span> or <span class="term-suggest-cmd" data-cmd="ls">ls</span> to begin.`
                    );
                    break;

                case "whoami":
                    appendOutput(`Viir Phuria &mdash; ${escapeHtml(userRole)}`);
                    break;

                case "skills":
                    appendOutput(escapeHtml(skillsTxt));
                    break;

                case "projects":
                    appendOutput(escapeHtml(projectsTxt));
                    break;

                case "certs":
                case "certifications":
                    appendOutput(escapeHtml(certsTxt));
                    break;

                case "research":
                case "publications":
                    appendOutput(escapeHtml(researchTxt));
                    break;

                case "experience":
                    appendOutput(escapeHtml(experienceTxt));
                    break;

                case "contact":
                    appendOutput(escapeHtml(rootFiles["contact.sh"].content));
                    break;

                case "date":
                    appendOutput(new Date().toString());
                    break;

                case "uname":
                    appendOutput("Linux viir-secbox 6.8.0-kali-amd64 #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux");
                    break;

                case "sudo":
                    appendOutput('<span style="color:#ef4444;">[SECURITY ALERT] viir is not in the sudoers file. This incident will be reported to /var/log/auth.log.</span>');
                    break;

                case "echo":
                    appendOutput(escapeHtml(args.join(" ")));
                    break;

                default:
                    appendOutput(`<span style="color:#f87171;">bash: ${escapeHtml(cmd)}: command not found. Type <span class="term-suggest-cmd" data-cmd="help">help</span> for supported commands.</span>`);
                    break;
            }

            scrollToBottom();
        }

        // Autocompletion Vocabulary
        const availableCommands = [
            "start", "menu", "welcome", "help", "ls", "cd", "pwd", "dir", "cat", "grep",
            "nmap", "scan", "curl", "ping", "top", "htop", "theme", "matrix",
            "whoami", "skills", "projects", "certs", "research", "publications",
            "experience", "resume", "cv", "contact", "socials",
            "clear", "cls", "reboot", "reset", "history", "date", "uname", "sudo", "echo", "base64"
        ];

        termInput.addEventListener("keydown", function (e) {
            if (e.key === "Enter") {
                e.preventDefault();
                const val = termInput.value;
                termInput.value = "";
                executeCommand(val);
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                if (commandHistory.length > 0 && historyIndex > 0) {
                    historyIndex--;
                    termInput.value = commandHistory[historyIndex];
                }
            } else if (e.key === "ArrowDown") {
                e.preventDefault();
                if (historyIndex < commandHistory.length - 1) {
                    historyIndex++;
                    termInput.value = commandHistory[historyIndex];
                } else {
                    historyIndex = commandHistory.length;
                    termInput.value = "";
                }
            } else if (e.key === "Tab") {
                e.preventDefault();
                const current = termInput.value.trim();
                if (!current) return;
                const parts = current.split(/\s+/);
                const currentFiles = getCurrentDirFiles();
                const fileList = Object.keys(currentFiles);

                if (parts.length === 1) {
                    const match = availableCommands.find(c => c.startsWith(parts[0].toLowerCase()));
                    if (match) termInput.value = match + " ";
                } else if ((parts[0].toLowerCase() === "cat" || parts[0].toLowerCase() === "type" || parts[0].toLowerCase() === "grep") && parts.length === 2) {
                    const match = fileList.find(f => f.startsWith(parts[1].toLowerCase()));
                    if (match) termInput.value = `${parts[0]} ${match}`;
                } else if (parts[0].toLowerCase() === "cd" && parts.length === 2) {
                    const dirs = fileList.filter(f => currentFiles[f].type === "dir");
                    const match = dirs.find(d => d.startsWith(parts[1].toLowerCase()));
                    if (match) termInput.value = `cd ${match}`;
                }
            } else if (e.key === "l" && e.ctrlKey) {
                e.preventDefault();
                historyDiv.innerHTML = "";
                scrollToBottom();
            } else if (e.key === "c" && e.ctrlKey) {
                e.preventDefault();
                appendCommandLine(termInput.value + "^C");
                termInput.value = "";
                scrollToBottom();
            }
        });

        // Delegate clicks on terminal interactive elements
        termCard.addEventListener("click", function (e) {
            const suggest = e.target.closest("[data-cmd]");
            if (suggest && suggest.dataset.cmd) {
                e.stopPropagation();
                executeCommand(suggest.dataset.cmd);
                termInput.focus();
                return;
            }
            termInput.focus();
        });

        const closeBtn = termCard.querySelector(".terminal-btn.close");
        if (closeBtn) {
            closeBtn.addEventListener("click", function (e) {
                e.stopPropagation();
                historyDiv.innerHTML = "";
                scrollToBottom();
                termInput.focus();
            });
        }

        const maxBtn = termCard.querySelector(".terminal-btn.maximize");
        if (maxBtn) {
            maxBtn.addEventListener("click", function (e) {
                e.stopPropagation();
                currentDir = "~";
                updatePrompts();
                executeCommand("cat whoami.txt");
                termInput.focus();
            });
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initAboutTerminal);
    } else {
        initAboutTerminal();
    }
})();
