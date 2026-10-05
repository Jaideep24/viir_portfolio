document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("project-items-container");
    if (!container) return;
    
    // Clone items behind the scenes so ultrawide screens can loop infinitely!
    // We tag them with 'marquee-clone' so index.js can smartly hide them if a category has <= 2 items.
    const originalChildren = Array.from(container.children);
    originalChildren.forEach(child => {
        const clone = child.cloneNode(true);
        clone.classList.add('marquee-clone');
        // Immediately hide clones if the total starting original count is 2 or fewer
        if (originalChildren.length <= 2) {
            clone.style.display = 'none';
        }
        container.appendChild(clone);
    });
    
    let autoScroll;
    let scrollAmount = 0.7; 
    let exactScroll = 0;
    let isDown = false;
    let startX;
    let scrollLeft;
    
    // Helper to determine if we should be scrolling at all
    const canScroll = () => {
        let visibleOriginals = 0;
        for (let i = 0; i < container.children.length; i++) {
            // Only count original items that are visible
            if (container.children[i].offsetWidth > 0 && !container.children[i].classList.contains('marquee-clone')) {
                visibleOriginals++;
            }
        }
        // User requested: scroll ONLY when cards more than 2 (not equal to 2)
        return visibleOriginals > 2;
    };
    
    const manageInfiniteLoop = () => {
        // Handle scrolling forward (right)
        let maxIters = container.children.length;
        let iters = 0;
        while (container.firstElementChild && iters < maxIters) {
            iters++;
            let child = container.firstElementChild;
            
            if (child.offsetWidth === 0) {
                // Element is hidden by filter, move it silently
                container.appendChild(child);
                continue;
            }
            const rect = child.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            
            // Added a 50px buffer (hysteresis) to prevent oscillation loops 
            // where moving an element back and forth locks the scroll exactly at 0.
            if (rect.right < containerRect.left - 50) {
                container.appendChild(child);
                const shift = rect.width + 30; // element width + gap
                container.scrollLeft -= shift;
                exactScroll = container.scrollLeft;
                if (isDown) scrollLeft -= shift;
            } else {
                break; 
            }
        }
        
        // Handle scrolling backward (left)
        if (container.scrollLeft <= 0) {
            maxIters = container.children.length;
            iters = 0;
            while (container.lastElementChild && iters < maxIters) {
                iters++;
                let child = container.lastElementChild;
                container.prepend(child);
                if (child.offsetWidth === 0) {
                    continue; // Move hidden elements instantly
                }
                // We found a visible element to prepend
                const rect = child.getBoundingClientRect();
                const shift = rect.width + 30;
                container.scrollLeft += shift;
                exactScroll = container.scrollLeft;
                if (isDown) scrollLeft += shift;
                break; // Stop after prepending one visible element to maintain smoothness
            }
        }
    };
    
    const scrollLoop = () => {
        if (!isDown && canScroll()) {
            // Sync with actual scroll BEFORE incrementing to respect external resets (like category changes)
            exactScroll = container.scrollLeft;
            exactScroll += scrollAmount;
            container.scrollLeft = exactScroll;
            
            manageInfiniteLoop();
        }
        autoScroll = requestAnimationFrame(scrollLoop);
    };
    
    const startScroll = () => {
        if (autoScroll) cancelAnimationFrame(autoScroll);
        exactScroll = container.scrollLeft;
        autoScroll = requestAnimationFrame(scrollLoop);
    };
    
    const stopScroll = () => {
        if (autoScroll) cancelAnimationFrame(autoScroll);
    };
    
    container.addEventListener("mouseenter", stopScroll);
    container.addEventListener("mouseleave", () => {
        if (!isDown) startScroll();
    });
    
    container.addEventListener('mousedown', (e) => {
        isDown = true;
        container.classList.add('active');
        startX = e.pageX - container.offsetLeft;
        scrollLeft = container.scrollLeft;
        stopScroll();
    });
    
    container.addEventListener('mouseleave', () => {
        isDown = false;
        container.classList.remove('active');
        startScroll();
    });
    
    container.addEventListener('mouseup', () => {
        isDown = false;
        container.classList.remove('active');
    });
    
    container.addEventListener('mousemove', (e) => {
        if (!isDown || !canScroll()) return;
        e.preventDefault();
        const x = e.pageX - container.offsetLeft;
        const walk = (x - startX) * 1.5; 
        container.scrollLeft = scrollLeft - walk;
        exactScroll = container.scrollLeft;
        manageInfiniteLoop();
    });
    
    container.addEventListener("touchstart", stopScroll, {passive: true});
    container.addEventListener("touchend", startScroll, {passive: true});
    
    setTimeout(startScroll, 1000);
});
