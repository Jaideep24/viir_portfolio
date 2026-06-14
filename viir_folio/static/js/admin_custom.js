document.addEventListener("DOMContentLoaded", function() {
    const userMenu = document.querySelector('.navbar-nav.ml-auto');
    if (userMenu) {
        // Insert the View Site link right before the language chooser / user profile
        const viewSiteHtml = '<li class="nav-item d-none d-sm-inline-block"><a href="/" class="nav-link" title="View Site"><i class="fas fa-eye"></i> View Site</a></li>';
        userMenu.insertAdjacentHTML('afterbegin', viewSiteHtml);
    }
});
