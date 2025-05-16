"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  title: string;
}

export function PageContainer({ 
  children, 
  className,
  title 
}: PageContainerProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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

  return (
    <div className="bg-background min-h-screen">
      <div className={cn(
        "w-full flex justify-center transition-all duration-300",
        isMobile ? "pt-16 pb-16 px-0" : (isCollapsed ? "pl-[65px]" : "pl-[100px]")
      )}>
        <main className={cn(
          "w-full py-8 font-inter", // Added font-inter class here
          isMobile ? "max-w-full px-0" : "max-w-3xl px-4",
          className
        )}>
          {!isMobile && <h1 className="text-l font-bold mb-6 text-center">{title}</h1>}
          {children}
        </main>
      </div>
    </div>
  );
}