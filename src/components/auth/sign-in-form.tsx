"use client";

import { useSignIn } from "@clerk/nextjs";
import { useState } from "react";

export function SignInForm() {
  const { signIn, isLoaded } = useSignIn();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    if (!isLoaded) return;
    setIsLoading(true);
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/",
      });
    } catch (err) {
      console.error("OAuth error", err);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4 font-inter">
      <div className="bg-[#181818] border border-white/5 rounded-[24px] p-8 sm:p-10 w-full max-w-[400px] shadow-2xl flex flex-col">
        
        <div className="text-center mb-8">
          <h1 className="text-[24px] font-bold text-white tracking-tight leading-tight mb-3">
            Log in or sign up for Talas
          </h1>
          <p className="text-[#777777] text-[15px] leading-relaxed">
            See what people are talking about and join the conversation.
          </p>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading || !isLoaded}
          className="bg-secondary hover:bg-primary-foreground border border-white/10 text-white font-semibold h-[60px] rounded-[16px] justify-center w-full transition-colors flex items-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {isLoading ? "Redirecting..." : "Continue with Google"}
        </button>

        <div className="mt-8 text-center">
          <p className="text-[#555555] text-[14px]">
            Secured via Clerk
          </p>
        </div>

      </div>
    </div>
  );
}