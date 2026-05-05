"use client";

import { useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { PageContainer } from "@/components/ui/page-container";
import { Button } from "@/components/ui/button";

export default function FeedsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <Sidebar activeItem="Home" />
      <PageContainer title="Home">
        <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
          <h2 className="text-xl font-bold">Error Loading Posts</h2>
          <p className="text-muted-foreground">
            {error.message || "Failed to load posts. Please try again later."}
          </p>
          <Button
            onClick={() => reset()}
            className="mt-4 bg-primary text-white hover:bg-primary-foreground"
          >
            Try again
          </Button>
        </div>
      </PageContainer>
    </>
  );
}
