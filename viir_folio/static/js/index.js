/* ==========================================================================
   VIIR PORTFOLIO — Main JavaScript
   All inline scripts extracted from index.html and organized.
   ========================================================================== */


/* --------------------------------------------------------------------------
   0. INITIALIZATION — Apply data attributes to replace inline styles
   -------------------------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", function () {
    // Apply background images from data-bg attributes
    document.querySelectorAll("[data-bg]").forEach(function (el) {
        const bgUrl = el.getAttribute("data-bg");
        if (bgUrl) {
            el.style.backgroundImage = "url('" + bgUrl + "')";
            el.style.backgroundSize = "cover";
        }
    });

    // Apply progress bar widths from data-width attributes
    document.querySelectorAll(".progress-bar-skill[data-width]").forEach(function (el) {
        el.style.width = el.getAttribute("data-width") + "%";
    });
});


/* --------------------------------------------------------------------------
   1. TYPING ANIMATION (Hero section)
   -------------------------------------------------------------------------- */

const typedTexts = [
    "a Web Designer",
    "a Web Developer",
    "a Front End Developer",
    "an App Designer",
    "an App Developer"
];
let typedIndex = 0;
let letterIndex = 0;
let textElement = document.getElementById('typed-text');

function typeWriter() {
    if (letterIndex < typedTexts[typedIndex].length) {
        textElement.textContent += typedTexts[typedIndex].charAt(letterIndex);
        letterIndex++;
        setTimeout(typeWriter, 100);
    } else {
        setTimeout(erase, 1000);
    }
}

function erase() {
    if (letterIndex >= 0) {
        const currentText = textElement.textContent.slice(0, -1);
        textElement.textContent = currentText;
        letterIndex--;
        setTimeout(erase, 50);
    } else {
        typedIndex = (typedIndex + 1) % typedTexts.length;
        setTimeout(typeWriter, 1000);
    }
}

typeWriter();


/* --------------------------------------------------------------------------
   2. AGE CALCULATOR
   -------------------------------------------------------------------------- */

const birthDate = new Date(2005, 8, 27); // September 27, 2005

function calculateAge(birth) {
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth() + 1;
    const dayDiff = today.getDate() - birth.getDate();
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
    }
    return age;
}

document.getElementById("age").innerHTML =
    " <span class='title'>Age<b>:</b></span>" + calculateAge(birthDate) + " Years";


/* --------------------------------------------------------------------------
   3. PUBLICATIONS SEARCH
   -------------------------------------------------------------------------- */

document.getElementById('searchInput').addEventListener('input', function () {
    const query = this.value.toLowerCase();
    const cards = document.querySelectorAll('.pub-card');
    cards.forEach(card => {
        const text = card.innerText.toLowerCase();
        card.style.display = text.includes(query) ? 'block' : 'none';
    });
});


/* --------------------------------------------------------------------------
   4. THEME TOGGLE (Publications)
   -------------------------------------------------------------------------- */

function toggleTheme() {
    document.body.classList.toggle('light');
    document.body.classList.toggle('dark');
}


/* --------------------------------------------------------------------------
   5. PARTICLES.JS CONFIGURATIONS
   -------------------------------------------------------------------------- */

const darkParticlesConfig = {
    "particles": {
        "number": { "value": 80, "density": { "enable": true, "value_area": 800 } },
        "color": { "value": "#ffffff" },
        "shape": {
            "type": "circle",
            "stroke": { "width": 0, "color": "#000000" },
            "polygon": { "nb_sides": 5 },
            "image": { "src": "img/github.svg", "width": 100, "height": 100 }
        },
        "opacity": { "value": 0.5, "random": false, "anim": { "enable": false, "speed": 1, "opacity_min": 0.1, "sync": false } },
        "size": { "value": 5, "random": true, "anim": { "enable": false, "speed": 40, "size_min": 0.1, "sync": false } },
        "line_linked": { "enable": true, "distance": 150, "color": "#ffffff", "opacity": 0.4, "width": 1 },
        "move": { "enable": true, "speed": 6, "direction": "none", "random": false, "straight": false, "out_mode": "out", "attract": { "enable": false, "rotateX": 600, "rotateY": 1200 } }
    },
    "interactivity": {
        "detect_on": "canvas",
        "events": { "onhover": { "enable": true, "mode": "repulse" }, "onclick": { "enable": true, "mode": "push" }, "resize": true },
        "modes": {
            "grab": { "distance": 400, "line_linked": { "opacity": 1 } },
            "bubble": { "distance": 400, "size": 40, "duration": 2, "opacity": 8, "speed": 3 },
            "repulse": { "distance": 200 },
            "push": { "particles_nb": 4 },
            "remove": { "particles_nb": 2 }
        }
    },
    "retina_detect": true,
    "config_demo": { "hide_card": false, "background_color": "#b61924", "background_image": "", "background_position": "50% 50%", "background_repeat": "no-repeat", "background_size": "cover" }
};

const lightParticlesConfig = {
    "particles": {
        "number": { "value": 80, "density": { "enable": true, "value_area": 800 } },
        "color": { "value": "#0e0c22" },
        "shape": {
            "type": "circle",
            "stroke": { "width": 0, "color": "#000000" },
            "polygon": { "nb_sides": 5 },
            "image": { "src": "img/github.svg", "width": 100, "height": 100 }
        },
        "opacity": { "value": 0.5, "random": false, "anim": { "enable": false, "speed": 1, "opacity_min": 0.1, "sync": false } },
        "size": { "value": 5, "random": true, "anim": { "enable": false, "speed": 40, "size_min": 0.1, "sync": false } },
        "line_linked": { "enable": true, "distance": 150, "color": "#0e0c22", "opacity": 0.4, "width": 1 },
        "move": { "enable": true, "speed": 6, "direction": "none", "random": false, "straight": false, "out_mode": "out", "attract": { "enable": false, "rotateX": 600, "rotateY": 1200 } }
    },
    "interactivity": {
        "detect_on": "canvas",
        "events": { "onhover": { "enable": true, "mode": "repulse" }, "onclick": { "enable": true, "mode": "push" }, "resize": true },
        "modes": {
            "grab": { "distance": 400, "line_linked": { "opacity": 1 } },
            "bubble": { "distance": 400, "size": 40, "duration": 2, "opacity": 8, "speed": 3 },
            "repulse": { "distance": 200 },
            "push": { "particles_nb": 4 },
            "remove": { "particles_nb": 2 }
        }
    },
    "retina_detect": true,
    "config_demo": { "hide_card": false, "background_color": "#b61924", "background_image": "", "background_position": "50% 50%", "background_repeat": "no-repeat", "background_size": "cover" }
};


/* --------------------------------------------------------------------------
   6. DARK MODE INITIALIZATION & TOGGLING
   -------------------------------------------------------------------------- */

const darkModeColors = ['#00f7ff', '#a020f0', '#39ff14'];
const lightModeColors = ['#4f46e5', '#1e293b', '#64748b'];

document.addEventListener("DOMContentLoaded", () => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    document.body.classList.toggle("light", !isDarkMode);
    document.body.classList.toggle("dark", isDarkMode);

    const toggleCheckbox = document.getElementById("toggle");
    if (toggleCheckbox) toggleCheckbox.checked = isDarkMode;

    applyDarkModeStyles(isDarkMode);
});

function toggleStyles() {
    const isDark = document.body.classList.contains("dark");
    const newMode = !isDark;

    document.body.classList.toggle("dark", newMode);
    document.body.classList.toggle("light", !newMode);
    localStorage.setItem("darkMode", newMode);

    const toggleCheckbox = document.getElementById("toggle");
    if (toggleCheckbox) toggleCheckbox.checked = !newMode;

    applyDarkModeStyles(newMode);
}

function applyDarkModeStyles(isDarkMode) {
    const body = document.body;
    body.style.backgroundColor = isDarkMode ? "#0c0e22ed" : "#E6F4FF";

    if (isDarkMode) {
        particlesJS('particles-js', darkParticlesConfig);
    } else {
        particlesJS('particles-js', lightParticlesConfig);
    }

    const styles = [
        { selector: "#myself", property: "color", dark: "#EEEEEE", light: "#000000" },
        { selector: "h3", property: "color", dark: "#EEEEEE", light: "#000000" },
        { selector: "p", property: "color", dark: "#EEEEEE", light: "#000000" },
        { selector: ".br-learn-more-right", property: "color", dark: "#EEEEEE", light: "#000000" },
        { selector: ".br-learn-more-right", property: "borderColor", dark: "#EEEEEE", light: "#000000" },
        { selector: "h2", property: "color", dark: "#EEEEEE", light: "#000000" },
        { selector: ".ligh-title", property: "color", dark: "#202337", light: "#EEEEEE" },
        { selector: ".ligh-title", property: "opacity", dark: "0.12", light: "0.05" },
        { selector: "li", property: "color", dark: "#a5a3b3", light: "#000000" },
        { selector: ".title", property: "color", dark: "#EEEEEE", light: "#000000" },
        { selector: ".br-box", property: "backgroundColor", dark: "#202337", light: "#ffffff" },
        { selector: ".br-box", property: "borderColor", dark: "#1b1d30", light: "#ccc" },
        { selector: "h4", property: "color", dark: "#EEEEEE", light: "#000000" },
        { selector: ".track", property: "stroke", dark: "#333754", light: "#ccc" },
        { selector: ".margin-t-80", property: "backgroundColor", dark: "#202337", light: "#ffffff" },
        { selector: ".timeline-item", property: "backgroundColor", dark: "#202337", light: "#ffffff" },
        { selector: ".timeline-item", property: "borderColor", dark: "#353250", light: "#ccc" },
        { selector: ".box-front", property: "backgroundColor", dark: "#202337", light: "#ffffff" },
        { selector: ".box-front", property: "borderColor", dark: "#353250", light: "#ccc" },
        { selector: ".br-project-box", property: "backgroundColor", dark: "#202337", light: "#ffffff" },
        { selector: ".br-project-box", property: "borderColor", dark: "#353250", light: "#ccc" },
        { selector: ".form-control", property: "backgroundColor", dark: "#202337", light: "#ffffff" },
        { selector: ".form-control", property: "borderColor", dark: "#353250", light: "#5f5757ff" },
        { selector: ".form-control", property: "color", dark: "#EEEEEE", light: "#000000" },
        { selector: ".card", property: "backgroundColor", dark: "#202337", light: "#ffffff" },
        { selector: ".my-3", property: "color", dark: "#FFFFFF", light: "#000000" },
        { selector: ".card-title", property: "color", dark: "#FFFFFF", light: "#000000" },
        { selector: "#date", property: "color", dark: "#EEEEEE", light: "#000000" },
        { selector: ".view-cv-btn", property: "color", dark: "#EEEEEE", light: "#000000" },
        { selector: ".view-cv-btn", property: "borderColor", dark: "rgba(255, 255, 255, 0.4)", light: "rgba(0, 0, 0, 0.4)" },
        { selector: ".download-cv-btn", property: "color", dark: "#EEEEEE", light: "#000000" },
        { selector: ".download-cv-btn", property: "borderColor", dark: "rgba(255, 255, 255, 1)", light: "rgba(0, 0, 0, 0.4)" },
        { selector: ".capsule-btn", property: "color", dark: "#EEEEEE", light: "#000000" },
        { selector: ".capsule-btn", property: "borderColor", dark: "rgba(255, 255, 255, 0.4)", light: "rgba(0, 0, 0, 0.4)" }
    ];

    styles.forEach(({ selector, property, dark, light }) => {
        document.querySelectorAll(selector).forEach(el => {
            el.style[property] = isDarkMode ? dark : light;
        });
    });
}


/* --------------------------------------------------------------------------
   7. PROJECT FILTER (Using MixItUp library)
   -------------------------------------------------------------------------- */

// MixItUp is initialized in script.js on '.portfolio-content'
// We just need to handle the filter button clicks and active state

function design(event) {
    const clickedItem = event.target;

    if (clickedItem.classList.contains('filter')) {
        // Update active state on filter buttons
        document.querySelectorAll(".filter").forEach(item => {
            item.classList.remove("mixitup-control-active");
        });
        clickedItem.classList.add("mixitup-control-active");

        const filterValue = clickedItem.getAttribute("data-filter");
        const container = document.getElementById("project-items-container");
        const items = container.querySelectorAll(".project-item");

        if (filterValue === "all") {
            // Show all items
            items.forEach(item => {
                item.style.display = "";
            });
        } else {
            // Filter by class name (remove the leading dot)
            const className = filterValue.substring(1);
            items.forEach(item => {
                if (item.classList.contains(className)) {
                    item.style.display = "";
                } else {
                    item.style.display = "none";
                }
            });
        }
    } else if (clickedItem.classList.contains("br-nav")) {
        document.querySelectorAll(".br-nav").forEach(item => {
            item.parentNode.classList.remove("active");
            clickedItem.parentNode.classList.add("active");
        });
    }
}


/* --------------------------------------------------------------------------
   8. SIDEBAR MENU TOGGLE
   -------------------------------------------------------------------------- */

function menu() {
    document.querySelector(".br-sidebar").classList.toggle("dissappear");
}

document.addEventListener("click", function (event) {
    const targetDiv = document.querySelector(".br-sidebar");
    const isClickInside = targetDiv.contains(event.target);
    const targetBtn = document.querySelector(".br-sidebar-toggle");
    const isClickButton = targetBtn.contains(event.target);

    if (!isClickInside && !isClickButton) {
        document.querySelector(".br-sidebar").classList.remove("dissappear");
    }
});


/* --------------------------------------------------------------------------
   9. SCROLL SPY — Active section highlighting + vanish animation
   -------------------------------------------------------------------------- */

document.addEventListener('scroll', function () {
    let scrollPosition = window.scrollY || window.pageYOffset;

    document.querySelectorAll('section').forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;

        if (scrollPosition >= sectionTop - 450 && scrollPosition < sectionTop + sectionHeight - 450) {
            const id = section.getAttribute('id');
            const navLink = document.querySelector(`a[href="#${id}"]`);
            if (navLink) navLink.parentNode.classList.add('active');
            if (section.classList.contains('vanish')) {
                section.classList.toggle('vanish');
            }
        } else {
            const id = section.getAttribute('id');
            const navLink = document.querySelector(`a[href="#${id}"]`);
            if (navLink) navLink.parentNode.classList.remove('active');
        }
    });
});
