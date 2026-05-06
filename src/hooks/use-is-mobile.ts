import { useState, useEffect } from "react";

/**
 * Optimized hook to detect mobile viewports.
 * Consolidates resize listeners to prevent redundant calculations.
 */
export function useIsMobile(breakpoint = 690) {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkSize = () => {
      setIsMobile(window.innerWidth <= breakpoint);
    };

    // Initial check
    checkSize();

    // Listen for resize
    window.addEventListener("resize", checkSize);
    
    return () => window.removeEventListener("resize", checkSize);
  }, [breakpoint]);

  return isMobile;
}
