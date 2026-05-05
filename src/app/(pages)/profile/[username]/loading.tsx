"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { PageContainer } from "@/components/ui/page-container";
import { LoadingSpinner } from "@/components/ui/loading";
import { FloatingActionButton } from "@/components/ui/floating-action-button";

export default function ProfileLoading() {
  return (
    <>
      <Sidebar activeItem="" />
      <PageContainer title="Loading Profile...">
        <LoadingSpinner className="h-96" />
      </PageContainer>
      <FloatingActionButton />
    </>
  );
}
