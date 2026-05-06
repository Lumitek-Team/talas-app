"use client";

import { useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { PageContainer } from "@/components/ui/page-container";
import { Button } from "@/components/ui/button";

export default function SavedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Saved Page Error:", error);
  }, [error]);

  return (
    <>
      <Sidebar activeItem="Saved" />
      <PageContainer title="Saved Projects">
        <div className="flex flex-col items-center justify-center h-64 text-center px-4">
          <h2 className="text-xl font-semibold text-red-500 mb-2">
            Failed to load saved projects
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            {error.message || "There was an error loading your bookmarked projects. Please try again."}
          </p>
          <Button onClick={() => reset()} variant="outline">
            Try Again
          </Button>
        </div>
      </PageContainer>
    </>
  );
}
