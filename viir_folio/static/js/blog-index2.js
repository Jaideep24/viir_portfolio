/* ==========================================================================
   VIIR PORTFOLIO — Blog Index (2) JavaScript
   Extracted from templates/blog/index (2).html inline scripts.
   ========================================================================== */


// ---- Theme toggle (dark / light) ----
function initBlogIndex2() {
    // Get theme from localStorage or from window.__isDarkMode set in head
    const isDarkMode = typeof window.__isDarkMode !== 'undefined'
        ? window.__isDarkMode
        : localStorage.getItem('darkMode') !== 'false';

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
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initBlogIndex2);
} else {
    initBlogIndex2();
}

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

    // Legacy inline styles have been removed. 
    // Theme is now fully controlled by CSS using body.dark and body.light classes.
}
