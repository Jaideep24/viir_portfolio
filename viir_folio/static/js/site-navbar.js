(() => {
    function setSidebarState(isOpen) {
        const sidebar = document.querySelector('.br-sidebar');
        const overlay = document.querySelector('.br-sidebar-overlay');
        const toggleBtn = document.querySelector('.sidebar-toggle-btn');

        if (!sidebar || !overlay) {
            return;
        }

        sidebar.classList.toggle('br-sidebar-open', isOpen);
        sidebar.classList.toggle('br-open', isOpen);
        overlay.style.display = isOpen ? 'block' : 'none';
        
        if (toggleBtn) {
            toggleBtn.classList.toggle('btn-open', isOpen);
        }
    }

    window.menu = function (event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        const sidebar = document.querySelector('.br-sidebar');
        if (!sidebar) {
            return;
        }

        setSidebarState(!sidebar.classList.contains('br-sidebar-open'));
    };

    window.closeSidebar = function () {
        setSidebarState(false);
    };

    window.toggleStyles = function (event) {
        if (event) {
            event.preventDefault();
        }

        const isDark = document.body.classList.contains('dark');
        const newMode = !isDark;

        document.body.classList.toggle('dark', newMode);
        document.body.classList.toggle('light', !newMode);
        localStorage.setItem('darkMode', newMode);

        const toggleCheckbox = document.getElementById('toggle');
        if (toggleCheckbox) {
            toggleCheckbox.checked = newMode;
        }

        if (typeof window.applyDarkModeStyles === 'function') {
            window.applyDarkModeStyles(newMode);
        }

        if (typeof window.updateGridTheme === 'function') {
            window.updateGridTheme(newMode);
        }
    };

    document.addEventListener('click', event => {
        const sidebar = document.querySelector('.br-sidebar');
        const toggle = document.querySelector('.br-sidebar-toggle');

        if (!sidebar || !toggle) {
            return;
        }

        const clickedInsideSidebar = sidebar.contains(event.target);
        const clickedToggle = toggle.contains(event.target);

        if (!clickedInsideSidebar && !clickedToggle) {
            setSidebarState(false);
        }
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            setSidebarState(false);
        }
    });

    // Handle Active Link State dynamically
    function initNavbarActiveState() {
        const navLinks = document.querySelectorAll('.br-sidebar .menu-list .nav-link');
        
        function setActiveLink(activeNav) {
            navLinks.forEach(nav => {
                nav.classList.remove('active');
                nav.removeAttribute('aria-current');
            });
            if (activeNav) {
                activeNav.classList.add('active');
                activeNav.setAttribute('aria-current', 'page');
            }
        }

        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                setActiveLink(this);
            });
        });
        
        // Pre-set active state if URL has a hash on load
        const currentHash = window.location.hash;
        if (currentHash) {
            navLinks.forEach(nav => {
                if (nav.getAttribute('href').includes(currentHash)) {
                    setActiveLink(nav);
                }
            });
        }
    }

    function setupNavbarEvents() {
        initNavbarActiveState();
        
        // CSP Compliant Event Listeners for Navbar
        const menuBtns = document.querySelectorAll(".menu-trigger");
        menuBtns.forEach(btn => btn.addEventListener("click", window.menu));
        
        const closeBtns = document.querySelectorAll(".close-sidebar-trigger");
        closeBtns.forEach(btn => btn.addEventListener("click", window.closeSidebar));

        // Initialize Theme Toggle Checkbox State
        const isDarkMode = localStorage.getItem('darkMode') !== 'false';
        const toggleCheckbox = document.getElementById('toggle');
        if (toggleCheckbox) {
            toggleCheckbox.checked = isDarkMode;
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener('DOMContentLoaded', setupNavbarEvents);
    } else {
        setupNavbarEvents();
    }
})();
