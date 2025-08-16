import { useState, useRef, useCallback, useEffect } from "react";

const useProfilePreview = (delay = 300) => {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState("bottom-start");
    const timeoutRef = useRef(null);
    const triggerRef = useRef(null);

    const showPreview = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            setIsVisible(true);
        }, delay);
    }, [delay]);

    const hidePreview = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Add a small delay before hiding to make it easier to move mouse to preview
        timeoutRef.current = setTimeout(() => {
            setIsVisible(false);
        }, 150); // 150ms delay before hiding
    }, []);

    const handleMouseEnter = useCallback(() => {
        showPreview();
    }, [showPreview]);

    const handleMouseLeave = useCallback(() => {
        hidePreview();
    }, [hidePreview]);

    // Calculate position based on trigger element position
    const calculatePosition = useCallback((triggerElement) => {
        if (!triggerElement) return "bottom-start";

        const rect = triggerElement.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        // Check if there's space below
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;

        // Check if there's space to the right
        const spaceRight = viewportWidth - rect.left;
        const spaceLeft = rect.left;

        let verticalPos = spaceBelow > 200 ? "bottom" : "top";
        let horizontalPos = spaceRight > 280 ? "start" : "end";

        return `${verticalPos}-${horizontalPos}`;
    }, []);

    // Update position when preview becomes visible
    useEffect(() => {
        if (isVisible && triggerRef.current) {
            const newPosition = calculatePosition(triggerRef.current);
            setPosition(newPosition);
        }
    }, [isVisible, calculatePosition]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return {
        isVisible,
        position,
        triggerRef,
        handleMouseEnter,
        handleMouseLeave,
    };
};

export default useProfilePreview;
