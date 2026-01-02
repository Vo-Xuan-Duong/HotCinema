import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component
 * Automatically scrolls to the top of the page when the route changes
 * Uses smooth scroll behavior for better UX
 */
const ScrollToTop = () => {
    const { pathname, hash, key } = useLocation();

    useEffect(() => {
        // If there's a hash (anchor link), let browser handle it naturally
        if (hash) {
            // Small delay to ensure content is loaded before scrolling to hash
            setTimeout(() => {
                const element = document.querySelector(hash);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
            return;
        }

        // Scroll to top with smooth behavior
        const scrollToTop = () => {
            try {
                // Use smooth scroll for better UX
                window.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: 'smooth'
                });

                // Also set scrollTop directly for immediate effect (fallback)
                if (document.documentElement) {
                    document.documentElement.scrollTop = 0;
                }
                if (document.body) {
                    document.body.scrollTop = 0;
                }

                // Handle scrollable containers (like main content areas)
                const scrollableContainers = document.querySelectorAll('[data-scroll-container]');
                scrollableContainers.forEach(container => {
                    container.scrollTop = 0;
                });
            } catch (error) {
                console.error('ScrollToTop error:', error);
                // Fallback: instant scroll
                window.scrollTo(0, 0);
            }
        };

        // Immediate scroll
        scrollToTop();

        // Delayed scroll for dynamic content that loads after route change
        const timeoutId = setTimeout(() => {
            scrollToTop();
        }, 100);

        // Additional scroll after animations complete
        const animationFrameId = requestAnimationFrame(() => {
            scrollToTop();
        });

        return () => {
            clearTimeout(timeoutId);
            cancelAnimationFrame(animationFrameId);
        };
    }, [pathname, hash, key]);

    return null;
};

export default ScrollToTop;
