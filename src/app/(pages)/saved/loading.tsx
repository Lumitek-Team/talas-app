"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { PageContainer } from "@/components/ui/page-container";
import { LoadingSpinner } from "@/components/ui/loading";

export default function SavedLoading() {
  return (
    <>
      <Sidebar activeItem="Saved" />
      <PageContainer title="Saved Projects">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </PageContainer>
    </>
  );
}
