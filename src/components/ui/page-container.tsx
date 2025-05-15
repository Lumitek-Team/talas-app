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

  useEffect(() => {
    // Function to check window width and update sidebar state
    const handleResize = () => {
      setIsCollapsed(window.innerWidth <= 990);
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
        isCollapsed ? "pl-[70px]" : "pl-[280px]"
      )}>
        <main className={cn("w-full max-w-3xl py-8 px-4", className)}>
          <h1 className="text-l font-bold mb-6 text-center">{title}</h1>
          {children}
        </main>
      </div>
    </div>
  );
}