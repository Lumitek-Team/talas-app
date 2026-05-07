"use client";

import React, { useEffect, useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { AuthPromptDialog } from "@/components/ui/auth-prompt-dialog";

interface FloatingActionButtonProps {
  onClick?: () => void;
  label?: string;
  requiresAuth?: boolean;
}

export function FloatingActionButton({
  onClick,
  label = "Create new post",
  requiresAuth = true,
}: FloatingActionButtonProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();

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

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // If auth is required:
    // 1. If still loading, we can either wait or show the prompt. 
    // Showing the prompt is safer than a sudden redirect.
    // 2. If loaded and not signed in, show auth prompt.
    if (requiresAuth) {
      if (!isLoaded || !isSignedIn) {
        setIsAuthDialogOpen(true);
        return;
      }
    }

    // If a custom onClick was provided (like scroll to top), call it
    if (onClick) {
      onClick();
    } else {
      // Default behavior is to navigate to create project
      router.push("/create-project");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        aria-label={label}
        className={`fixed bg-primary rounded-2xl shadow-lg flex items-center justify-center transition-all duration-200 hover:bg-primary-foreground group focus:outline-none z-[100] cursor-pointer max-[690px]:bottom-20 max-[690px]:right-4 max-[690px]:w-14 max-[690px]:h-14 max-[690px]:rounded-full min-[691px]:bottom-8 min-[691px]:right-8 min-[691px]:w-20 min-[691px]:h-16 ${
          isMobile ? "bottom-20 right-4 w-14 h-14 rounded-full" : "bottom-8 right-8 w-20 h-16"
        }`}
      >
        <PlusIcon className="w-7 h-7 text-white" />
      </button>

      <AuthPromptDialog 
        isOpen={isAuthDialogOpen}
        onClose={() => setIsAuthDialogOpen(false)}
        message="Sign in to share your amazing projects with the community."
      />
    </>
  );
}