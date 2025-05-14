"use client";

import React from "react";

interface FloatingActionButtonProps {
  onClick: () => void;
  label?: string;
}

export function FloatingActionButton({
  onClick,
  label = "Create new post",
}: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="fixed bottom-8 right-8 w-20 h-16 bg-primary rounded-2xl shadow-lg flex items-center justify-center transition-all duration-300 ease-in-out hover:scale-105 hover:bg-primary-foreground group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary z-50 cursor-pointer"
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