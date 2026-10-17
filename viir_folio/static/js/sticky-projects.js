/**
 * Sticky Horizontal Scroll for Featured Projects
 * Linear / Apple style pinned vertical-to-horizontal scrolling
 * Viir Phuria Portfolio
 */

(function () {
    "use strict";

    let container, viewport, track, trackWrapper, progressThumb;
    let currentNumEl, totalNumEl;
    let cards = [];
    let filterButtons = [];
    
    let maxTranslate = 0;
    let currentX = 0;
    let targetX = 0;
    let isTicking = false;
    let isDesktop = true;

    function init() {
        container = document.getElementById("sticky-projects-container");
        viewport = document.getElementById("sticky-projects-viewport");
        track = document.getElementById("sticky-projects-track");
        trackWrapper = document.getElementById("sticky-track-wrapper");
        progressThumb = document.getElementById("sticky-progress-thumb");
        currentNumEl = document.getElementById("sticky-current-num");
        totalNumEl = document.getElementById("sticky-total-num");

        if (!container || !track) return;

        cards = Array.from(track.querySelectorAll(".sticky-project-card"));
        filterButtons = Array.from(document.querySelectorAll("#projects .filter"));


        setupFilters();
        updateDimensions();

        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", debounce(onResize, 150));

        // Re-calculate after all fonts/images load
        window.addEventListener("load", () => {
            updateDimensions();
            onScroll();
        });

        // Track wrapper horizontal scroll for mobile
        if (trackWrapper) {
            trackWrapper.addEventListener("scroll", onMobileScroll, { passive: true });
        }

        // Initial run
        onScroll();
    }

    function setupFilters() {
        filterButtons.forEach((btn) => {
            btn.addEventListener("click", () => handleFilter(btn));
            btn.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleFilter(btn);
                }
            });
        });
    }

    function handleFilter(btn) {
        filterButtons.forEach((b) => b.classList.remove("mixitup-control-active"));
        btn.classList.add("mixitup-control-active");

        const filterVal = btn.getAttribute("data-filter") || "all";
        const filterClass = filterVal === "all" ? "" : filterVal.replace(".", "");

        let visibleCount = 0;

        cards.forEach((card) => {
            const matches = filterVal === "all" || card.classList.contains(filterClass);
            if (matches) {
                card.classList.remove("is-filtered-out");
                card.style.display = "";
                visibleCount++;
            } else {
                card.classList.add("is-filtered-out");
                card.style.display = "none";
            }
        });

        // Reset scroll states
        targetX = 0;
        currentX = 0;
        track.style.transform = "translate3d(0, 0, 0)";
        if (progressThumb) progressThumb.style.width = "0%";
        if (currentNumEl) currentNumEl.textContent = "01";
        if (totalNumEl) totalNumEl.textContent = String(visibleCount).padStart(2, "0");

        if (trackWrapper) {
            trackWrapper.scrollLeft = 0;
        }

        // Recalculate dimensions for new card count
        updateDimensions();

        // If currently pinned deep in container, smoothly reposition to container top
        const rect = container.getBoundingClientRect();
        if (rect.top < -50) {
            const targetScrollY = window.scrollY + rect.top;
            window.scrollTo({
                top: targetScrollY,
                behavior: "smooth",
            });
        }
    }

    function updateDimensions() {
        isDesktop = window.innerWidth >= 768;

        const visibleCards = cards.filter((c) => !c.classList.contains("is-filtered-out"));
        if (totalNumEl) {
            totalNumEl.textContent = String(visibleCards.length).padStart(2, "0");
        }

        if (!isDesktop) {
            container.style.height = "auto";
            track.style.transform = "none";
            return;
        }

        if (visibleCards.length === 0) {
            container.style.height = "100vh";
            maxTranslate = 0;
            return;
        }

        // Compute total track scroll width cleanly
        const savedTransform = track.style.transform;
        track.style.transform = "none";
        const trackScrollWidth = track.scrollWidth;
        track.style.transform = savedTransform;

        const viewportWidth = window.innerWidth;
        // Padding at end so last card has comfortable breathing room
        const endBuffer = window.innerWidth > 1200 ? 120 : 60;

        maxTranslate = Math.max(0, trackScrollWidth - viewportWidth + endBuffer);

        if (maxTranslate > 0) {
            // Container height determines vertical scrolling distance required to glide all cards
            // Use 1:1 scroll speed ratio for natural feel
            container.style.height = `${window.innerHeight + maxTranslate}px`;
        } else {
            // All cards fit in screen
            container.style.height = "100vh";
        }
    }

    function onScroll() {
        if (!isDesktop || maxTranslate <= 0) return;

        const rect = container.getBoundingClientRect();
        const navOffset = 60;
        const scrollDistance = container.offsetHeight - (window.innerHeight - navOffset);

        if (scrollDistance <= 0) return;

        // Progress goes from 0.0 at pinning start (navOffset) to 1.0 at pinning end
        let progress = (navOffset - rect.top) / scrollDistance;
        progress = Math.max(0, Math.min(1, progress));

        targetX = progress * maxTranslate;

        // Update progress bar
        if (progressThumb) {
            progressThumb.style.width = `${Math.round(progress * 100)}%`;
        }

        // Update active card number
        const visibleCards = cards.filter((c) => !c.classList.contains("is-filtered-out"));
        if (visibleCards.length > 0 && currentNumEl) {
            const activeIdx = Math.min(
                visibleCards.length - 1,
                Math.floor(progress * visibleCards.length)
            );
            currentNumEl.textContent = String(activeIdx + 1).padStart(2, "0");
        }

        requestRender();
    }

    function onMobileScroll() {
        if (isDesktop || !trackWrapper) return;
        const visibleCards = cards.filter((c) => !c.classList.contains("is-filtered-out"));
        if (visibleCards.length === 0) return;

        const scrollLeft = trackWrapper.scrollLeft;
        const maxScroll = trackWrapper.scrollWidth - trackWrapper.clientWidth;
        const progress = maxScroll > 0 ? scrollLeft / maxScroll : 0;

        if (progressThumb) {
            progressThumb.style.width = `${Math.round(progress * 100)}%`;
        }

        if (currentNumEl) {
            const cardWidth = visibleCards[0].offsetWidth || 300;
            const activeIdx = Math.min(
                visibleCards.length - 1,
                Math.round(scrollLeft / (cardWidth + 16))
            );
            currentNumEl.textContent = String(activeIdx + 1).padStart(2, "0");
        }
    }

    function requestRender() {
        if (!isTicking) {
            isTicking = true;
            requestAnimationFrame(renderGlide);
        }
    }

    function renderGlide() {
        // Smooth lerp: currentX approaches targetX for silky motion
        currentX += (targetX - currentX) * 0.18;

        if (Math.abs(targetX - currentX) < 0.2) {
            currentX = targetX;
        }

        track.style.transform = `translate3d(-${currentX.toFixed(2)}px, 0, 0)`;

        if (Math.abs(targetX - currentX) >= 0.2) {
            requestAnimationFrame(renderGlide);
        } else {
            isTicking = false;
        }
    }

    function onResize() {
        updateDimensions();
        onScroll();
    }

    function debounce(func, wait) {
        let timeout;
        return function () {
            const context = this,
                args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
