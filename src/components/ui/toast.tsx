"use client";

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export function Toast({ 
  message, 
  type = 'success', 
  isVisible, 
  onClose, 
  duration = 3000 
}: ToastProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-full duration-300">
      <div className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border backdrop-blur-sm",
        "min-w-[300px] max-w-[400px]",
        type === 'success' && "bg-primary/20 border-primary/40 text-primary-foreground backdrop-blur-md",
        type === 'error' && "bg-destructive/20 border-destructive/40 text-destructive backdrop-blur-md",
        type === 'info' && "bg-accent/20 border-accent/40 text-accent-foreground backdrop-blur-md"
      )}>
        {type === 'success' && (
          <CheckCircleIcon className="h-5 w-5 text-primary flex-shrink-0" />
        )}
        
        <span className="text-sm font-medium flex-1">{message}</span>
        
        <button
          onClick={onClose}
          className={cn(
            "p-1 rounded-full hover:bg-background/20 transition-colors",
            "text-muted-foreground hover:text-foreground"
          )}
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}