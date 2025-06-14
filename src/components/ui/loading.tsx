"use client";

import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  /**
   * Custom className untuk container
   */
  className?: string;
}

export function LoadingSpinner({ className }: LoadingSpinnerProps) {
  return (
    <div className={cn(
      "flex justify-center items-center h-64",
      className
    )}>
      <div className="animate-pulse flex space-x-2">
        {[0, 0.1, 0.2].map((delay) => (
          <div
            key={delay}
            className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
            style={{ animationDelay: `${delay}s` }}
          />
        ))}
      </div>
    </div>
  );
}