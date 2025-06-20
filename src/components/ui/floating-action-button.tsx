"use client";

import React, { useEffect, useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

interface FloatingActionButtonProps {
  onClick?: () => void;
  label?: string;
}

export function FloatingActionButton({
  label = "Create new post",
}: FloatingActionButtonProps) {
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

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

  const handleRedirect = () => {
    router.push("/create-project");
  };

  return (
    <button
      onClick={handleRedirect}
      aria-label={label}
      className={`fixed bg-primary rounded-2xl shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-90 hover:bg-primary-foreground group focus:outline-none z-50 cursor-pointer ${
        isMobile ? "bottom-20 right-4 w-14 h-14 rounded-full" : "bottom-8 right-8 w-20 h-16"
      }`}
    >
      <PlusIcon className="w-7 h-7 text-white" />
    </button>
  );
}