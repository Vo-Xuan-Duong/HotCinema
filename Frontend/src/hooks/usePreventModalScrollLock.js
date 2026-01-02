import { useEffect } from 'react';

/**
 * Hook to prevent Ant Design Modal from causing scrollbar flicker
 * by preventing body overflow changes
 */
export const usePreventModalScrollLock = () => {
    useEffect(() => {
        // Store original body overflow
        const originalOverflow = document.body.style.overflow;
        const originalOverflowY = document.body.style.overflowY;
        
        // Create a MutationObserver to watch for body style changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const body = document.body;
                    const currentOverflow = body.style.overflow;
                    const currentOverflowY = body.style.overflowY;
                    
                    // If Ant Design tries to set overflow to hidden, override it
                    if (currentOverflow === 'hidden' || currentOverflowY === 'hidden') {
                        body.style.overflow = 'auto';
                        body.style.overflowY = 'scroll';
                    }
                    
                    // Remove padding-right that Ant Design adds
                    if (body.style.paddingRight && body.style.paddingRight !== '0px') {
                        body.style.paddingRight = '0px';
                    }
                }
            });
        });
        
        // Start observing body for style attribute changes
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['style']
        });
        
        // Cleanup
        return () => {
            observer.disconnect();
            // Restore original overflow if needed
            if (originalOverflow) {
                document.body.style.overflow = originalOverflow;
            }
            if (originalOverflowY) {
                document.body.style.overflowY = originalOverflowY;
            }
        };
    }, []);
};

