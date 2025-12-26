"use client";

import { useState, useEffect } from "react";

/**
 * Hook to detect mobile viewport using matchMedia
 * More performant than window.innerWidth as it uses native browser APIs
 * Returns undefined during SSR to prevent hydration mismatches
 */
export function useMobile(breakpoint: number = 768) {
    const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

    useEffect(() => {
        const mql = window.matchMedia(`(max-width: ${breakpoint}px)`);
        const onChange = () => setIsMobile(mql.matches);

        // Add listener for changes
        mql.addEventListener("change", onChange);

        // Set initial value
        setIsMobile(mql.matches);

        // Cleanup
        return () => mql.removeEventListener("change", onChange);
    }, [breakpoint]);

    // Return false for SSR safety, true/false after hydration
    return !!isMobile;
}
