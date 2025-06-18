"use client";

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface SmoothCursorProps {
  className?: string;
}

export const SmoothCursor: React.FC<SmoothCursorProps> = ({ className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [hasMouseDevice, setHasMouseDevice] = useState(false);
  
  // Always call these hooks - never conditionally
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  // Main cursor - fastest, most responsive
  const mainSpringConfig = { damping: 20, stiffness: 300, mass: 0.8 };
  const cursorXSpring = useSpring(cursorX, mainSpringConfig);
  const cursorYSpring = useSpring(cursorY, mainSpringConfig);
  
  // Restore original spring configs with bigger differences for cascading effect
  const trail1XSpring = useSpring(cursorX, { damping: 25, stiffness: 200, mass: 1.2 });
  const trail1YSpring = useSpring(cursorY, { damping: 25, stiffness: 200, mass: 1.2 });
  
  const trail2XSpring = useSpring(cursorX, { damping: 30, stiffness: 150, mass: 1.8 });
  const trail2YSpring = useSpring(cursorY, { damping: 30, stiffness: 150, mass: 1.8 });
  
  const trail3XSpring = useSpring(cursorX, { damping: 35, stiffness: 100, mass: 2.2 });
  const trail3YSpring = useSpring(cursorY, { damping: 35, stiffness: 100, mass: 2.2 });
  
  // Large glow effect - slowest for smooth trailing
  const glowXSpring = useSpring(cursorX, { damping: 40, stiffness: 80, mass: 3.0 });
  const glowYSpring = useSpring(cursorY, { damping: 40, stiffness: 80, mass: 3.0 });

  useEffect(() => {
    setIsMounted(true);

    // Check if device has a mouse (not touch device)
    const checkMouseDevice = () => {
      const hasMouseDevice = window.matchMedia('(pointer: fine)').matches;
      setHasMouseDevice(hasMouseDevice);
      return hasMouseDevice;
    };

    if (!checkMouseDevice()) {
      return; // Don't add event listeners on touch devices
    }

    const moveCursor = (e: MouseEvent) => {
      // Set cursor position to exact mouse position (no offset)
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      
      if (!isVisible) {
        setIsVisible(true);
      }
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    // Add hover effects for interactive elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.getAttribute('role') === 'button' ||
        target.classList.contains('cursor-pointer') ||
        target.closest('button') ||
        target.closest('a') ||
        target.closest('[role="button"]') ||
        target.closest('.cursor-pointer')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    // Initial cursor position
    const handleInitialMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      setIsVisible(true);
    };

    document.addEventListener('mousemove', moveCursor);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseover', handleMouseOver);
    
    // Set initial position
    document.addEventListener('mousemove', handleInitialMove, { once: true });

    return () => {
      document.removeEventListener('mousemove', moveCursor);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mousemove', handleInitialMove);
    };
  }, [cursorX, cursorY, isVisible]);

  // Don't render on server, if not mounted, or on touch devices
  if (!isMounted || !hasMouseDevice) {
    return null;
  }

  return (
    <>
      {/* Large Background Glow - Furthest back, biggest, most delayed */}
      <motion.div
        className={`fixed pointer-events-none z-[9995] ${className}`}
        style={{
          left: glowXSpring,
          top: glowYSpring,
          width: '128px',
          height: '128px',
          marginLeft: '-64px', // Half of width to center
          marginTop: '-64px',  // Half of height to center
        }}
        animate={{
          scale: isVisible ? (isHovering ? 1.2 : 0.8) : 0,
          opacity: isVisible ? 0.08 : 0,
        }}
        transition={{
          scale: { duration: 0.6 },
          opacity: { duration: 0.8 },
        }}
      >
        <div className="w-full h-full bg-primary rounded-full blur-3xl" />
      </motion.div>

      {/* Trail 3 - Large, most delayed */}
      <motion.div
        className={`fixed pointer-events-none z-[9996] ${className}`}
        style={{
          left: trail3XSpring,
          top: trail3YSpring,
          width: '80px',
          height: '80px',
          marginLeft: '-40px', // Half of width to center
          marginTop: '-40px',  // Half of height to center
        }}
        animate={{
          scale: isVisible ? (isHovering ? 1.1 : 0.9) : 0,
          opacity: isVisible ? 0.15 : 0,
        }}
        transition={{
          scale: { duration: 0.5 },
          opacity: { duration: 0.6 },
        }}
      >
        <div className="w-full h-full bg-primary rounded-full blur-xl" />
      </motion.div>

      {/* Trail 2 - Medium */}
      <motion.div
        className={`fixed pointer-events-none z-[9997] ${className}`}
        style={{
          left: trail2XSpring,
          top: trail2YSpring,
          width: '56px',
          height: '56px',
          marginLeft: '-28px', // Half of width to center
          marginTop: '-28px',  // Half of height to center
        }}
        animate={{
          scale: isVisible ? (isHovering ? 1.2 : 1.0) : 0,
          opacity: isVisible ? 0.25 : 0,
        }}
        transition={{
          scale: { duration: 0.4 },
          opacity: { duration: 0.5 },
        }}
      >
        <div className="w-full h-full bg-primary rounded-full blur-lg" />
      </motion.div>

      {/* Trail 1 - Smaller, faster */}
      <motion.div
        className={`fixed pointer-events-none z-[9998] ${className}`}
        style={{
          left: trail1XSpring,
          top: trail1YSpring,
          width: '40px',
          height: '40px',
          marginLeft: '-20px', // Half of width to center
          marginTop: '-20px',  // Half of height to center
        }}
        animate={{
          scale: isVisible ? (isHovering ? 1.3 : 1.1) : 0,
          opacity: isVisible ? 0.4 : 0,
        }}
        transition={{
          scale: { duration: 0.3 },
          opacity: { duration: 0.4 },
        }}
      >
        <div className="w-full h-full bg-primary rounded-full blur-md" />
      </motion.div>

      {/* Inner glow around main cursor */}
      <motion.div
        className={`fixed pointer-events-none z-[9998] ${className}`}
        style={{
          left: cursorXSpring,
          top: cursorYSpring,
          width: '32px',
          height: '32px',
          marginLeft: '-16px', // Half of width to center
          marginTop: '-16px',  // Half of height to center
        }}
        animate={{
          scale: isVisible ? (isHovering ? 1.4 : 1.0) : 0,
          opacity: isVisible ? 0.6 : 0,
        }}
        transition={{
          scale: { duration: 0.2 },
          opacity: { duration: 0.3 },
        }}
      >
        <div className="w-full h-full bg-primary rounded-full blur-sm" />
      </motion.div>

      {/* Main cursor - Core light/brush tip - EXACT cursor position */}
      <motion.div
        className={`fixed pointer-events-none z-[9999] ${className}`}
        style={{
          left: cursorXSpring,
          top: cursorYSpring,
          width: '12px',
          height: '12px',
          marginLeft: '-6px', // Half of width to center
          marginTop: '-6px',  // Half of height to center
        }}
        animate={{
          scale: isVisible ? (isHovering ? 1.5 : 1.0) : 0,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{
          scale: { duration: 0.2 },
          opacity: { duration: 0.3 },
        }}
      >
        <div className="w-full h-full bg-white rounded-full shadow-lg" />
      </motion.div>
    </>
  );
};