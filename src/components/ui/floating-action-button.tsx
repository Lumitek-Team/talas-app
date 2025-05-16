"use client";

import React, { useEffect, useState } from "react";

interface FloatingActionButtonProps {
  onClick: () => void;
  label?: string;
}

export function FloatingActionButton({
  onClick,
  label = "Create new post",
}: FloatingActionButtonProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 690);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`fixed bg-primary rounded-2xl shadow-lg flex items-center justify-center transition-all duration-300 ease-in-out hover:scale-105 hover:bg-primary-foreground group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary z-50 cursor-pointer ${
        isMobile ? "bottom-20 right-4 w-14 h-14 rounded-full" : "bottom-8 right-8 w-20 h-16"
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-white"
      >
        <path d="M5 12h14" />
        <path d="M12 5v14" />
      </svg>
    </button>
  );
}