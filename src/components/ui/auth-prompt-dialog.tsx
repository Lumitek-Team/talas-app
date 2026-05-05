// src/components/ui/auth-prompt-dialog.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface AuthPromptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export function AuthPromptDialog({
  isOpen,
  onClose,
  message = "Create an account or sign in to interact with projects, leave comments, and save your favourites.",
}: AuthPromptDialogProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleSignIn = useCallback(() => {
    onClose();
    router.push("/sign-in");
  }, [onClose, router]);

  if (!mounted) return null;

  const dialogContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            key="dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-prompt-title"
            className="fixed inset-0 z-[99999] flex items-center justify-center px-4 font-inter pointer-events-none"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="relative w-full max-w-[400px] bg-[#181818] border border-white/5 rounded-[24px] shadow-2xl p-8 sm:p-10 flex flex-col pointer-events-auto">
              
              <button
                onClick={onClose}
                className="absolute top-6 right-6 text-[#777777] hover:text-white transition-colors duration-200 cursor-pointer"
                aria-label="Close dialog"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>

              <div className="text-center mb-8">
                <div className="flex justify-center mb-6">
                  <div className="w-14 h-14 rounded-full bg-[#0a0a0a] border border-white/10 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                      />
                    </svg>
                  </div>
                </div>

                <h2
                  id="auth-prompt-title"
                  className="text-[24px] font-bold text-white tracking-tight leading-tight mb-3"
                >
                  Join Talas to Continue
                </h2>

                <p className="text-[#777777] text-[15px] leading-relaxed">
                  {message}
                </p>
              </div>

              <button
                id="auth-prompt-signin-btn"
                onClick={handleSignIn}
                className="bg-secondary hover:bg-primary-foreground border border-white/10 text-white text-[15px] font-semibold h-[60px] rounded-[16px] flex items-center justify-center w-full transition-colors cursor-pointer"
              >
                Continue to Sign In
              </button>

              <div className="mt-8 text-center">
                <p className="text-[#555555] text-[14px]">
                  Secured via Clerk
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(dialogContent, document.body);
}