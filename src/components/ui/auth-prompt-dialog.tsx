// src/components/ui/auth-prompt-dialog.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

interface AuthPromptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  /** Optional custom message shown below the heading */
  message?: string;
}

/**
 * A polished, accessible modal that prompts guests to authenticate
 * before performing a protected action (like, comment, save, etc.).
 *
 * Design goals:
 * - Non-intrusive — only shown on demand, never on page load.
 * - Conversion-focused — clear CTA, no friction to dismiss.
 * - Consistent with the Talas dark-mode aesthetic.
 */
export function AuthPromptDialog({
  isOpen,
  onClose,
  message = "Create an account or sign in to interact with projects, leave comments, and save your favourites.",
}: AuthPromptDialogProps) {
  const router = useRouter();

  const handleSignIn = useCallback(() => {
    onClose();
    router.push("/sign-in");
  }, [onClose, router]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Dialog panel */}
          <motion.div
            key="dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-prompt-title"
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="relative w-full max-w-sm bg-[#1c1c1c] border border-white/10 rounded-2xl shadow-2xl p-7">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors duration-200 cursor-pointer"
                aria-label="Close dialog"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>

              {/* Icon */}
              <div className="flex justify-center mb-5">
                <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                  {/* Lock icon inline SVG for zero extra deps */}
                  <svg
                    className="w-7 h-7 text-primary"
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

              {/* Heading */}
              <h2
                id="auth-prompt-title"
                className="text-center text-lg font-bold text-white mb-2"
              >
                Join Talas to Continue
              </h2>

              {/* Message */}
              <p className="text-center text-sm text-white/50 mb-7 leading-relaxed">
                {message}
              </p>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <button
                  id="auth-prompt-signin-btn"
                  onClick={handleSignIn}
                  className="w-full py-2.5 rounded-xl bg-primary text-black text-sm font-semibold hover:bg-primary/90 active:scale-95 transition-all duration-200 cursor-pointer"
                >
                  Continue with Google
                </button>
              </div>

              {/* Subtle footer */}
              <p className="text-center text-xs text-white/30 mt-5">
                Secured with Clerk
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
