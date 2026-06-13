/* ==========================================================================
   VIIR PORTFOLIO — Blog Index (2) JavaScript
   Extracted from templates/blog/index (2).html inline scripts.
   ========================================================================== */

// ---- Mobile navigation toggle ----
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        }
    });
}

// ---- Theme toggle (dark / light) ----
document.addEventListener("DOMContentLoaded", () => {
    // Get theme from localStorage or from window.__isDarkMode set in head
    const isDarkMode = typeof window.__isDarkMode !== 'undefined'
        ? window.__isDarkMode
        : localStorage.getItem('darkMode') === 'true';

    // Ensure classes are applied (may already be applied by inline script)
    if (!document.body.classList.contains('dark') && !document.body.classList.contains('light')) {
        document.body.classList.toggle("light", !isDarkMode);
        document.body.classList.toggle("dark", isDarkMode);
    }

    const toggleCheckbox = document.getElementById("toggle");
    if (toggleCheckbox) toggleCheckbox.checked = isDarkMode;

    applyDarkModeStyles(isDarkMode);
    if (typeof window.updateGridTheme === 'function') window.updateGridTheme(isDarkMode);

    // Apply data-bg attributes for blog card images
    document.querySelectorAll('[data-bg]').forEach(el => {
        el.style.backgroundImage = `url('${el.dataset.bg}')`;
    });
});

function toggleStyles(event) {
    // Prevent the parent <label> from automatically toggling the checkbox a second time natively
    if (event) event.preventDefault();

    const isDark = document.body.classList.contains("dark");
    const newMode = !isDark;

    document.body.classList.toggle("dark", newMode);
    document.body.classList.toggle("light", !newMode);
    localStorage.setItem("darkMode", newMode);

    const toggleCheckbox = document.getElementById("toggle");
    if (toggleCheckbox) toggleCheckbox.checked = newMode;

    applyDarkModeStyles(newMode);
    if (typeof window.updateGridTheme === 'function') window.updateGridTheme(newMode);
}

// Apply inline styles for legacy elements not using CSS variables
function applyDarkModeStyles(isDarkMode) {
    const body = document.body;
    body.style.backgroundColor = "";

    const styles = [
        { selector: "#myself", property: "color", dark: "#EEEEEE", light: "#000000" },
        { selector: "h3", property: "color", dark: "#EEEEEE", light: "#000000" },
        { selector: ".blog-title", property: "color", dark: "#EEEEEE", light: "#000000" },
        { selector: "p", property: "color", dark: "#EEEEEE", light: "#000000" },
        { selector: ".br-learn-more-right", property: "color", dark: "#EEEEEE", light: "#000000" },
        { selector: ".br-learn-more-right", property: "borderColor", dark: "#EEEEEE", light: "#000000" },
        { selector: "h2", property: "color", dark: "#EEEEEE", light: "#000000" },
        { selector: ".ligh-title", property: "color", dark: "#202337", light: "#EEEEEE" },
        { selector: ".ligh-title", property: "opacity", dark: "0.12", light: "0.05" },
        { selector: "li", property: "color", dark: "#a5a3b3", light: "#000000" },
        { selector: ".title", property: "color", dark: "#EEEEEE", light: "#000000" },
        { selector: "#editorTitle", property: "color", dark: "#EEEEEE", light: "#000000" },
        { selector: ".br-box", property: "backgroundColor", dark: "#202337", light: "#f5f7fa" },
        { selector: ".br-box", property: "borderColor", dark: "#1b1d30", light: "#ccc" },
        { selector: ".track", property: "stroke", dark: "#333754", light: "#ccc" },
        { selector: ".margin-t-80", property: "backgroundColor", dark: "#202337", light: "#eef1f6" },
        { selector: ".box-front", property: "backgroundColor", dark: "#202337", light: "#f5f7fa" },
        { selector: ".box-front", property: "borderColor", dark: "#353250", light: "#ccc" },
        { selector: ".br-project-box", property: "backgroundColor", dark: "#202337", light: "#f5f7fa" },
        { selector: ".br-project-box", property: "borderColor", dark: "#353250", light: "#ccc" },
        { selector: ".form-control", property: "backgroundColor", dark: "#202337", light: "#f5f7fa" },
        { selector: ".form-control", property: "borderColor", dark: "#353250", light: "#ccc" },
        { selector: ".form-control", property: "color", dark: "#EEEEEE", light: "#000000" },
        { selector: ".card", property: "backgroundColor", dark: "#202337", light: "#f5f7fa" },
        { selector: ".my-3", property: "color", dark: "#FFFFFF", light: "#000000" },
        { selector: ".card-title", property: "color", dark: "#FFFFFF", light: "#000000" },
        { selector: "#date", property: "color", dark: "#EEEEEE", light: "#000000" },
        { selector: ".br-hero h1", property: "color", dark: "#EEEEEE", light: "#000000" },
        { selector: ".br-hero p", property: "color", dark: "#CCCCCC", light: "#333333" },
        { selector: ".br-learn-more", property: "color", dark: "#EEEEEE", light: "#000000" },
        { selector: ".br-learn-more", property: "borderColor", dark: "#EEEEEE", light: "#000000" },
        { selector: ".br-learn-more", property: "backgroundColor", dark: "#333333", light: "#f2f2f2" },
        { selector: ".br-learn-more-right", property: "backgroundColor", dark: "#333333", light: "#f2f2f2" },
        { selector: "section h2", property: "color", dark: "#EEEEEE", light: "#000000" },
        { selector: ".blog-card", property: "backgroundColor", dark: "#202337", light: "#f5f7fa" },
        { selector: ".blog-card h3", property: "color", dark: "#EEEEEE", light: "#000000" },
        { selector: ".blog-excerpt", property: "color", dark: "#a5a3b3", light: "#444444" },
        { selector: ".blog-meta", property: "color", dark: "#999999", light: "#666666" },
        { selector: ".certificate-card", property: "backgroundColor", dark: "#202337", light: "#f5f7fa" },
        { selector: ".project-card", property: "backgroundColor", dark: "#202337", light: "#f5f7fa" },
        { selector: ".publication-card", property: "backgroundColor", dark: "#202337", light: "#f5f7fa" },
        { selector: ".btn", property: "backgroundColor", dark: "#333333", light: "#f2f2f2" },
        { selector: ".comment-button", property: "backgroundColor", dark: "#333333", light: "#94a3b8" },
        { selector: "#btn", property: "color", dark: "red", light: "red" },
        { selector: ".action-btn", property: "color", dark: "#EEEEEE", light: "#000000" },
        { selector: ".action-btn", property: "backgroundColor", dark: "#333333", light: "#f2f2f2" },
        { selector: ".action-btn", property: "borderColor", dark: "#555555", light: "#cccccc" },
        { selector: ".btn", property: "borderColor", dark: "#555555", light: "#cccccc" },
        { selector: ".comment-btn i", property: "color", dark: "#EEEEEE", light: "#000000" },
        { selector: ".share-btn i", property: "color", dark: "#EEEEEE", light: "#000000" },
        { selector: ".comment-author", property: "color", dark: "#e2e8f0", light: "#1e293b" },
        { selector: "#likes-display", property: "color", dark: "#e2e8f0", light: "#1e293b" },
        { selector: ".comment-date", property: "color", dark: "#94a3b8", light: "#64748b" },
        { selector: ".comment-text", property: "color", dark: "#cbd5e1", light: "#000000" },
        // Admin panel specific selectors
        { selector: ".blog-item", property: "backgroundColor", dark: "#202337", light: "#f5f7fa" },
        { selector: ".blog-item", property: "borderColor", dark: "#353250", light: "#f0f0f0" },
        { selector: ".blog-item-body", property: "backgroundColor", dark: "#202337", light: "#f5f7fa" }
    ];

    styles.forEach(({ selector, property, dark, light }) => {
        document.querySelectorAll(selector).forEach(el => {
            el.style[property] = isDarkMode ? dark : light;
        });
    });
}
