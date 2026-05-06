"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { LoadingSpinner } from "@/components/ui/loading";

export default function SSOCallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse"></div>
        <LoadingSpinner className="h-12 w-12 text-primary relative z-10" />
      </div>
      <p className="text-muted-foreground animate-pulse font-medium">
        Completing secure sign-in...
      </p>
      <AuthenticateWithRedirectCallback />
    </div>
  );
}