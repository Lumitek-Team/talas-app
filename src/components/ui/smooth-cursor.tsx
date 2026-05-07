"use client";

import { useEffect, useState, useMemo } from 'react';
import { motion, useMotionValue, useSpring, useVelocity, useTransform } from 'framer-motion';

interface SmoothCursorProps {
  className?: string;
}

export const SmoothCursor: React.FC<SmoothCursorProps> = ({ className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [hasMouseDevice, setHasMouseDevice] = useState(false);
  
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  // Velocity tracking for the brush effect
  const velocityX = useVelocity(cursorX);
  const velocityY = useVelocity(cursorY);
  
  const velocity = useTransform(
    [velocityX, velocityY],
    ([vX, vY]) => Math.sqrt(Math.pow(vX as number, 2) + Math.pow(vY as number, 2))
  );

  // Spring configs for cascading "liquid" feel
  const springConfigs = [
    { damping: 20, stiffness: 300, mass: 0.5 }, // Near
    { damping: 25, stiffness: 200, mass: 0.8 },
    { damping: 30, stiffness: 150, mass: 1.2 },
    { damping: 35, stiffness: 100, mass: 1.8 },
    { damping: 40, stiffness: 80, mass: 2.5 },  // Far
  ];

  const springsX = springConfigs.map(config => useSpring(cursorX, config));
  const springsY = springConfigs.map(config => useSpring(cursorY, config));

  useEffect(() => {
    setIsMounted(true);
    const checkMouseDevice = () => {
      const hasMouse = window.matchMedia('(pointer: fine)').matches;
      setHasMouseDevice(hasMouse);
      return hasMouse;
    };

    if (!checkMouseDevice()) return;

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      setIsHovering(!!(
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a') ||
        target.closest('.cursor-pointer')
      ));
    };

    document.addEventListener('mousemove', moveCursor);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseenter', () => setIsVisible(true));
    document.addEventListener('mouseleave', () => setIsVisible(false));

    return () => {
      document.removeEventListener('mousemove', moveCursor);
      document.removeEventListener('mouseover', handleMouseOver);
    };
  }, [cursorX, cursorY, isVisible]);

  if (!isMounted || !hasMouseDevice) return null;

  return (
    <>
      {/* Background Glow */}
      <motion.div
        className={`fixed pointer-events-none z-[9995] ${className}`}
        style={{
          left: springsX[4],
          top: springsY[4],
          width: '160px',
          height: '160px',
          x: '-50%',
          y: '-50%',
        }}
        animate={{
          scale: isVisible ? (isHovering ? 1.3 : 1) : 0,
          opacity: isVisible ? 0.05 : 0,
        }}
      >
        <div className="w-full h-full bg-primary rounded-full blur-3xl opacity-20" />
      </motion.div>

      {/* Brush Trails - Cascading glowing circles */}
      {[4, 3, 2, 1, 0].map((index) => (
        <motion.div
          key={index}
          className={`fixed pointer-events-none z-[9996] ${className}`}
          style={{
            left: springsX[index],
            top: springsY[index],
            width: `${12 + (index * 10)}px`,
            height: `${12 + (index * 10)}px`,
            x: '-50%',
            y: '-50%',
          }}
          animate={{
            opacity: isVisible ? (0.6 - (index * 0.1)) : 0,
            scale: isHovering ? 1.2 : 1,
          }}
          transition={{
            opacity: { duration: 0.2 }
          }}
        >
          <div 
            className="w-full h-full bg-primary rounded-full blur-[4px]"
            style={{
              boxShadow: `0 0 ${10 + index * 5}px var(--color-primary)`,
              filter: `blur(${index * 2}px)`
            }}
          />
        </motion.div>
      ))}
    </>
  );
};