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
    document.addEventListener('DOMContentLoaded', () => {
        const navLinks = document.querySelectorAll('.br-sidebar .menu-list .nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                // Remove active from all
                navLinks.forEach(nav => nav.classList.remove('active'));
                // Add active to the clicked one
                this.classList.add('active');
            });
        });
        
        // Pre-set active state if URL has a hash on load
        const currentHash = window.location.hash;
        if (currentHash) {
            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href === currentHash || href === '/' + currentHash) {
                    navLinks.forEach(nav => nav.classList.remove('active'));
                    link.classList.add('active');
                }
            });
        }
    });
})();
