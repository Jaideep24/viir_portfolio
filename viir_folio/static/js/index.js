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

let textElement = document.getElementById('typed-text');
const rawTexts = textElement ? textElement.getAttribute('data-texts') : null;
const typedTexts = rawTexts ? rawTexts.split(',').map(s => s.trim()) : [
    "a Web Designer",
    "a Web Developer",
    "a Front End Developer",
    "an App Designer",
    "an App Developer"
];
let typedIndex = 0;
let letterIndex = 0;

function typeWriter() {
    if (!textElement) return;
    if (letterIndex < typedTexts[typedIndex].length) {
        textElement.textContent += typedTexts[typedIndex].charAt(letterIndex);
        letterIndex++;
        setTimeout(typeWriter, 100);
    } else {
        setTimeout(erase, 1000);
    }
}

function erase() {
    if (!textElement) return;
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

if (textElement) typeWriter();


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

const ageEl = document.getElementById("age");
if (ageEl) ageEl.innerHTML = " <span class='title'>Age<b>:</b></span>" + calculateAge(birthDate) + " Years";


/* --------------------------------------------------------------------------
   3. PUBLICATIONS SEARCH
   -------------------------------------------------------------------------- */

const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('input', function () {
        const query = this.value.toLowerCase();
        const cards = document.querySelectorAll('.pub-card');
        cards.forEach(card => {
            const text = card.innerText.toLowerCase();
            card.style.display = text.includes(query) ? 'block' : 'none';
        });
    });
}


/* --------------------------------------------------------------------------
   4. THEME TOGGLE (Publications)
   -------------------------------------------------------------------------- */

function toggleTheme() {
    document.body.classList.toggle('light');
    document.body.classList.toggle('dark');
}


/* --------------------------------------------------------------------------
   5. DARK MODE INITIALIZATION & TOGGLING
   -------------------------------------------------------------------------- */

const darkModeColors = ['#00f7ff', '#a020f0', '#39ff14'];
const lightModeColors = ['#4f46e5', '#1e293b', '#64748b'];

document.addEventListener("DOMContentLoaded", () => {
    const isDarkMode = localStorage.getItem('darkMode') !== 'false';
    // Remove the default class so body.dark / body.light CSS rules fully apply
    document.body.classList.remove("body-default");
    document.body.classList.toggle("light", !isDarkMode);
    document.body.classList.toggle("dark", isDarkMode);

    const toggleCheckbox = document.getElementById("toggle");
    if (toggleCheckbox) toggleCheckbox.checked = isDarkMode;

    applyDarkModeStyles(isDarkMode);
});

function toggleStyles(event) {
    // Prevent the parent <label> from auto-toggling the checkbox a second time
    if (event) event.preventDefault();

    const isDark = document.body.classList.contains("dark");
    const newMode = !isDark;

    document.body.classList.toggle("dark", newMode);
    document.body.classList.toggle("light", !newMode);
    localStorage.setItem("darkMode", newMode);

    const toggleCheckbox = document.getElementById("toggle");
    if (toggleCheckbox) toggleCheckbox.checked = newMode;

    applyDarkModeStyles(newMode);
}

function applyDarkModeStyles(isDarkMode) {
    const body = document.body;
    // Background is handled by body.dark / body.light CSS classes — no inline override needed

    // Update grid canvas theme
    if (typeof window.updateGridTheme === 'function') {
        window.updateGridTheme(isDarkMode);
    }


    // Legacy inline styles have been removed. 
    // Theme is now fully controlled by CSS using body.dark and body.light classes.
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

function menu(event) {
    if (event) event.preventDefault();
    const sidebar = document.querySelector(".br-sidebar");
    const overlay = document.querySelector(".br-sidebar-overlay");
    const toggleBtn = document.querySelector(".sidebar-toggle-btn");
    if (!sidebar) return;
    const isOpen = sidebar.classList.contains("br-sidebar-open");

    if (isOpen) {
        sidebar.classList.remove("br-sidebar-open", "br-open");
        overlay.classList.remove("active");
        if (toggleBtn) {
            toggleBtn.classList.remove("open");
            toggleBtn.setAttribute("aria-expanded", "false");
        }
    } else {
        sidebar.classList.add("br-sidebar-open", "br-open");
        overlay.classList.add("active");
        if (toggleBtn) {
            toggleBtn.classList.add("open");
            toggleBtn.setAttribute("aria-expanded", "true");
        }
    }
}

function closeSidebar() {
    const sidebar = document.querySelector(".br-sidebar");
    const overlay = document.querySelector(".br-sidebar-overlay");
    const toggleBtn = document.querySelector(".sidebar-toggle-btn");

    if (sidebar) sidebar.classList.remove("br-sidebar-open", "br-open");
    if (overlay) overlay.classList.remove("active");
    if (toggleBtn) {
        toggleBtn.classList.remove("open");
        toggleBtn.setAttribute("aria-expanded", "false");
    }
}

// Bind event listeners for sidebar toggles (CSP compliant)
document.addEventListener("DOMContentLoaded", function() {
    const menuBtn = document.querySelector(".menu-trigger");
    if (menuBtn) {
        menuBtn.addEventListener("click", menu);
    }
    
    const closeBtns = document.querySelectorAll(".close-sidebar-trigger");
    closeBtns.forEach(btn => btn.addEventListener("click", closeSidebar));
});

document.addEventListener("click", function (event) {
    const targetDiv = document.querySelector(".br-sidebar");
    const isClickInside = targetDiv.contains(event.target);
    const targetBtn = document.querySelector(".br-sidebar-toggle");
    const isClickButton = targetBtn.contains(event.target);

    if (!isClickInside && !isClickButton) {
        closeSidebar();
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
        } else {
            const id = section.getAttribute('id');
            const navLink = document.querySelector(`a[href="#${id}"]`);
            if (navLink) navLink.parentNode.classList.remove('active');
        }
    });
});

/* --------------------------------------------------------------------------
    10. LEGACY CUSTOM CURSOR REMOVED
    -------------------------------------------------------------------------- */
