/**
 * Transition Manager
 * Handles smooth page transitions and state management
 */

class TransitionManager {
    constructor() {
        this.pages = {};
        this.currentPageId = null;
        this.isTransitioning = false;
    }

    // Register a page element with optional callbacks
    registerPage(id, element, options = {}) {
        this.pages[id] = {
            id,
            element,
            onEnter: options.onEnter || null,
            onLeave: options.onLeave || null,
            enterAnimation: options.enterAnimation || 'fade',
            leaveAnimation: options.leaveAnimation || 'fade'
        };
    }

    // Set transition callbacks
    onPageEnter(id, callback) {
        if (this.pages[id]) {
            this.pages[id].onEnter = callback;
        }
    }

    onPageLeave(id, callback) {
        if (this.pages[id]) {
            this.pages[id].onLeave = callback;
        }
    }

    // Initialize with start page
    showPage(id) {
        Object.values(this.pages).forEach(page => {
            page.element.classList.remove('active');
            page.element.style.display = 'none';
        });

        const target = this.pages[id];
        if (target) {
            target.element.classList.add('active');
            target.element.style.display = 'flex';
            this.currentPageId = id;
            if (target.onEnter) target.onEnter();
        }
    }

    // Transition between pages
    async transitionTo(id, transitionType = 'fade') {
        if (this.isTransitioning || id === this.currentPageId) return;

        const current = this.pages[this.currentPageId];
        const next = this.pages[id];

        if (!current || !next) return;

        this.isTransitioning = true;

        // Run leave callback
        if (current.onLeave) current.onLeave();

        // Prepare next page
        next.element.style.display = 'flex';
        next.element.style.opacity = '0';
        next.element.classList.add('active'); // Ensure visibility for animation

        // Perform transition based on type
        if (transitionType === 'zoom') {
            current.element.style.transition = 'transform 1s ease, opacity 1s ease';
            current.element.style.transform = 'scale(5) rotate(10deg)';
            current.element.style.opacity = '0';

            setTimeout(() => {
                next.element.style.transition = 'opacity 1s ease';
                next.element.style.opacity = '1';
            }, 500);
        } else {
            // Default fade with smoother easing
            current.element.style.transition = 'opacity 1s cubic-bezier(0.4, 0, 0.2, 1), transform 1s cubic-bezier(0.4, 0, 0.2, 1)';
            current.element.style.opacity = '0';
            current.element.classList.add('transitioning-out'); // Ensure z-index handling

            next.element.style.transition = 'opacity 1s cubic-bezier(0.4, 0, 0.2, 1)';
            next.element.style.opacity = '1';
        }

        // Wait for transition to complete
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Cleanup
        current.element.classList.remove('active', 'transitioning-out');
        current.element.style.display = 'none';
        current.element.style.transform = '';
        current.element.style.opacity = '';

        next.element.style.transform = '';
        next.element.style.opacity = '';
        next.element.style.transition = '';

        this.currentPageId = id;
        this.isTransitioning = false;

        // Run enter callback
        if (next.onEnter) next.onEnter();
    }
}

// Export
window.TransitionManager = TransitionManager;
