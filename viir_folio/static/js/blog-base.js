/* ==========================================================================
   VIIR PORTFOLIO — Blog Base JavaScript
   Extracted from blog/base.html inline scripts.
   ========================================================================== */


/* --------------------------------------------------------------------------
   1. DARK MODE INITIALIZATION
   -------------------------------------------------------------------------- */

function generateBackgroundSpans() {
    const section = document.getElementById('section');
    if (!section) return;

    // Remove all existing background spans
    section.querySelectorAll('span.bg-span').forEach(span => span.remove());

    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    
    // Sync with CSS media queries responsive columns
    let cols = 16;
    if (window.innerWidth <= 600) {
        cols = 6;
    } else if (window.innerWidth <= 900) {
        cols = 10;
    }

    const spanSize = window.innerWidth / cols;
    const rows = Math.ceil(window.innerHeight / spanSize) + 4; // Add extra rows to ensure full coverage
    const totalSpans = cols * rows;

    const fragment = document.createDocumentFragment();
    const signinForm = section.querySelector('.signin');

    for (let i = 0; i < totalSpans; i++) {
        const span = document.createElement('span');
        span.classList.add('bg-span');
        span.className += ' ' + (isDarkMode ? 'green' : 'blue');
        fragment.appendChild(span);
    }

    if (signinForm) {
        section.insertBefore(fragment, signinForm);
    } else {
        section.appendChild(fragment);
    }
}

function initBlogBase() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    document.body.classList.toggle("light", !isDarkMode);
    document.body.classList.toggle("dark", isDarkMode);
    document.body.classList.toggle('darkmode', isDarkMode);
    
    // Generate spans dynamically on load
    generateBackgroundSpans();

    document.querySelectorAll("section span.bg-span").forEach(x => x.classList.toggle("green", isDarkMode));
    document.querySelectorAll("section span.bg-span").forEach(x => x.classList.toggle("blue", !isDarkMode));
    const toggleCheckbox = document.getElementById("toggle");
    if (toggleCheckbox) toggleCheckbox.checked = isDarkMode;

    if (typeof applyDarkModeStyles === 'function') {
        applyDarkModeStyles(isDarkMode);
    }

    // Set up password toggle listener
    const togglePasswordBtn = document.getElementById("togglePassword");
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener("click", myFunction);
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initBlogBase);
} else {
    initBlogBase();
}

window.addEventListener('resize', generateBackgroundSpans);


/* --------------------------------------------------------------------------
   2. DARK MODE TOGGLE HELPERS
   -------------------------------------------------------------------------- */

function something(x) {
    if (x.style.color == "black") {
        x.style.color = "white";
    } else {
        x.style.color = "black";
    }
}

function some(y) {
    y.classList.toggle("text-muted");
    if (y.style.color == "#FFC107") {
        y.style.color = "";
    } else {
        y.style.color = "#FFC107";
    }
}

function darktheme() {
    document.body.classList.toggle("darkmode");
    document.querySelectorAll(".navbar-brand").forEach(something);
    document.querySelectorAll(".nav-link").forEach(something);
    document.querySelectorAll("p").forEach(some);
    document.querySelectorAll("span").forEach(some);
    document.querySelectorAll(".card-body").forEach(x => x.classList.toggle('darkmode'));
    document.querySelectorAll("section span.bg-span").forEach(x => x.classList.toggle("green"));
    document.querySelectorAll("section span.bg-span").forEach(x => x.classList.toggle("blue"));
    const menuthingEl = document.getElementById("menuthing");
    if (menuthingEl) {
        menuthingEl.classList.toggle("navbar-light");
        menuthingEl.classList.toggle("navbar-dark");
    }
    const currentMode = document.body.classList.contains('darkmode');
    localStorage.setItem('darkMode', currentMode);
}


/* --------------------------------------------------------------------------
   3. PASSWORD TOGGLE
   -------------------------------------------------------------------------- */

function myFunction() {
    var x = document.getElementById("password");
    var toggleBtn = document.getElementById("togglePassword");
    if (!x || !toggleBtn) return;

    if (x.type === "password") {
        x.type = "text";
        toggleBtn.innerHTML = '<i class="fa-solid fa-eye-slash toggle-password-icon" id="togglePasswordIcon"></i>';
    } else {
        x.type = "password";
        toggleBtn.innerHTML = '<i class="fa-solid fa-eye toggle-password-icon" id="togglePasswordIcon"></i>';
    }
}


/* --------------------------------------------------------------------------
   4. INPUT FOCUS/BLUR HANDLING
   -------------------------------------------------------------------------- */

document.querySelectorAll('.inputBox input').forEach(input => {
    input.addEventListener('input', function () {
        toggleSubmitButton();
    });
});


/* --------------------------------------------------------------------------
   6. SUBMIT BUTTON VALIDATION
   -------------------------------------------------------------------------- */

function toggleSubmitButton() {
    const username = document.querySelector('input[type="text"]');
    const password = document.getElementById('password');
    const submitButton = document.querySelector('input[type="submit"]');
    if (username && password && submitButton) {
        if (username.value !== '' && password.value !== '') {
            submitButton.classList.add('enabled');
        } else {
            submitButton.classList.remove('enabled');
        }
    }
}

const submitBtn = document.querySelector('input[type="submit"]');
if (submitBtn) {
    submitBtn.addEventListener('click', function (event) {
        const username = document.querySelector('input[type="text"]');
        const password = document.getElementById('password');
        if (username.value === '' || password.value === '') {
            alert('Please fill in both fields.');
            event.preventDefault();
        }
    });
}


/* --------------------------------------------------------------------------
   7. MOBILE NAVIGATION (Hamburger menu)
   -------------------------------------------------------------------------- */

const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        }
    });
}
