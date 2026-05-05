"use client";

import { useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { PageContainer } from "@/components/ui/page-container";
import { Button } from "@/components/ui/button";
import { FloatingActionButton } from "@/components/ui/floating-action-button";

export default function SearchError({
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
      <Sidebar activeItem="Search" />
      <PageContainer title="Search">
        <div className="flex flex-col items-center justify-center h-96 gap-4 text-center">
          <h2 className="text-xl font-bold">Search unavailable</h2>
          <p className="text-muted-foreground">
            An error occurred while loading the search functionality.
          </p>
          <Button
            onClick={() => reset()}
            className="mt-4 bg-primary text-white hover:bg-primary-foreground"
          >
            Try again
          </Button>
        </div>
      </PageContainer>
      <FloatingActionButton />
    </>
  );
}
