"use client";

import React, { ReactNode, useEffect } from "react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  title: string;
  showBackButton?: boolean;
  backButtonHref?: string;
}

export function PageContainer({ 
  children, 
  className,
  title,
  showBackButton = false
}: PageContainerProps) {
  const router = useRouter();

  useEffect(() => {
    // Function to check window width and update sidebar state
    const handleResize = () => {
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
      {/* Mobile Back Button - Visible only on screens <= 690px via CSS */}
      {showBackButton && (
        <div className="fixed top-0 left-0 z-50 p-4 min-[691px]:hidden">
          <button 
            onClick={handleBackClick}
            className="p-2 rounded-full hover:bg-white/10 transition-all duration-100 cursor-pointer active:scale-90"
            aria-label="Go back"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
        </div>
      )}
      
      <div className={`w-full flex justify-center transition-all duration-300 ${
        "max-[690px]:pt-16 max-[690px]:pb-16 max-[690px]:px-0 " +
        "min-[1181px]:pl-[100px] " +
        "min-[691px]:max-[1180px]:pl-[65px]"
      }`}>
        <main className={`w-full py-8 font-inter ${
          "max-[690px]:max-w-full max-[690px]:px-0 " +
          "min-[691px]:max-w-3xl min-[691px]:px-4 " +
          className
        }`}>
          {/* Desktop Header - Hidden on mobile via CSS */}
          <div className="max-[690px]:hidden flex items-center justify-center relative mb-6">
            {showBackButton && (
              <button 
                onClick={handleBackClick}
                className="absolute left-0 p-2 rounded-full hover:bg-white/10 transition-all duration-100 cursor-pointer active:scale-90"
                aria-label="Go back"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-l font-bold text-center">{title}</h1>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}