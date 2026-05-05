"use client";

import { useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { PageContainer } from "@/components/ui/page-container";
import { Button } from "@/components/ui/button";

export default function ProjectError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <>
      <Sidebar />
      <PageContainer title="Error" showBackButton={true}>
        <div className="flex flex-col items-center justify-center h-96 gap-4 text-center">
          <h2 className="text-xl font-bold">Something went wrong!</h2>
          <p className="text-muted-foreground">
            We couldn't load the project data. Please try again.
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
