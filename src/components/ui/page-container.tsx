"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  title: string;
  showBackButton?: boolean;
}

export function PageContainer({ 
  children, 
  className,
  title,
  showBackButton = false
}: PageContainerProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Function to check window width and update sidebar state
    const handleResize = () => {
      const width = window.innerWidth;
      setIsCollapsed(width <= 990);
      setIsMobile(width <= 690);
    };

    // Set initial state
    handleResize();

    // Add event listener for window resize
    window.addEventListener('resize', handleResize);

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleBackClick = () => {
    router.back();
  };

  return (
    <div className="bg-background min-h-screen">
      {isMobile && showBackButton && (
        <div className="fixed top-0 left-0 z-50 p-4">
          <button 
            onClick={handleBackClick}
            className="p-2 rounded-full hover:bg-white/10 transition-all duration-100 hover:scale-110 cursor-pointer active:scale-90"
            aria-label="Go back"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
        </div>
      )}
      
      <div className={cn(
        "w-full flex justify-center transition-all duration-300",
        isMobile ? "pt-16 pb-16 px-0" : (isCollapsed ? "pl-[65px]" : "pl-[100px]")
      )}>
        <main className={cn(
          "w-full py-8 font-inter", // Added font-inter class here
          isMobile ? "max-w-full px-0" : "max-w-3xl px-4",
          className
        )}>
          {!isMobile && (
            <div className="flex items-center justify-center relative mb-6">
              {showBackButton && (
                <button 
                  onClick={handleBackClick}
                  className="absolute left-0 p-2 rounded-full hover:bg-white/10 transition-all duration-100 hover:scale-110 cursor-pointer active:scale-90"
                  aria-label="Go back"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                </button>
              )}
              <h1 className="text-l font-bold text-center">{title}</h1>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}