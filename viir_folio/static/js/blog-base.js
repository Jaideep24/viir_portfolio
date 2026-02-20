/* ==========================================================================
   VIIR PORTFOLIO — Blog Base JavaScript
   Extracted from blog/base.html inline scripts.
   ========================================================================== */


/* --------------------------------------------------------------------------
   1. DARK MODE INITIALIZATION
   -------------------------------------------------------------------------- */

const isDarkMode = localStorage.getItem('darkMode') === 'true';

document.addEventListener("DOMContentLoaded", () => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    document.body.classList.toggle("light", !isDarkMode);
    document.body.classList.toggle("dark", isDarkMode);
    document.body.classList.toggle('darkmode', isDarkMode);
    document.querySelectorAll("section span").forEach(x => x.classList.toggle("green", isDarkMode));
    document.querySelectorAll("section span").forEach(x => x.classList.toggle("blue", !isDarkMode));
    const toggleCheckbox = document.getElementById("toggle");
    if (toggleCheckbox) toggleCheckbox.checked = isDarkMode;

    applyDarkModeStyles(isDarkMode);
});


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
    document.querySelectorAll("section span").forEach(x => x.classList.toggle("green"));
    document.querySelectorAll("section span").forEach(x => x.classList.toggle("blue"));
    document.getElementById("menuthing").classList.toggle("navbar-light");
    document.getElementById("menuthing").classList.toggle("navbar-dark");
    const currentMode = document.body.classList.contains('darkmode');
    localStorage.setItem('darkMode', currentMode);
}


/* --------------------------------------------------------------------------
   3. PASSWORD TOGGLE
   -------------------------------------------------------------------------- */

function myFunction() {
    var x = document.getElementById("password");
    if (x.type === "password") {
        x.type = "text";
    } else {
        x.type = "password";
    }
    document.getElementById('something').classList.toggle('fa-eye');
    document.getElementById('something').classList.toggle('fa-eye-slash');
}


/* --------------------------------------------------------------------------
   4. INPUT FOCUS/BLUR HANDLING
   -------------------------------------------------------------------------- */

document.querySelectorAll('.inputBox input').forEach(input => {
    input.addEventListener('focus', function () {
        this.nextElementSibling.classList.add('active');
    });

    input.addEventListener('blur', function () {
        if (this.value === '') {
            this.nextElementSibling.classList.remove('active');
        }
    });

    input.addEventListener('input', function () {
        if (this.value !== '') {
            this.nextElementSibling.classList.add('active');
        } else {
            this.nextElementSibling.classList.remove('active');
        }
        toggleSubmitButton();
    });
});


/* --------------------------------------------------------------------------
   5. PASSWORD VISIBILITY TOGGLE (button)
   -------------------------------------------------------------------------- */

const togglePasswordBtn = document.getElementById('togglePassword');
if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener('click', function () {
        const password = document.getElementById('password');
        const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
        password.setAttribute('type', type);
        this.querySelector('i').classList.toggle('fa-eye');
        this.querySelector('i').classList.toggle('fa-eye-slash');
    });
}


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
