document.addEventListener("DOMContentLoaded", function () {
    const observerOptions = {
        root: null,
        rootMargin: "0px",
        threshold: 0.15 // Trigger when 15% of the element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add the 'visible' class to trigger CSS transitions
                entry.target.classList.add('is-visible');
                
                // Optional: stop observing if we only want it to animate once
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all elements with animation classes
    const animatedElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-scale, .reveal-stagger');
    animatedElements.forEach(el => observer.observe(el));
    
    // For stagger containers, we also want to stagger their children
    const staggerContainers = document.querySelectorAll('.reveal-stagger');
    staggerContainers.forEach(container => {
        const children = container.children;
        Array.from(children).forEach((child, index) => {
            child.style.transitionDelay = `${index * 50}ms`;
            child.classList.add('reveal-stagger-child');
        });
    });
});
