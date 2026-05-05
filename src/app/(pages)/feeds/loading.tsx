"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { PageContainer } from "@/components/ui/page-container";
import { LoadingSpinner } from "@/components/ui/loading";

export default function FeedsLoading() {
  return (
    <>
      <Sidebar activeItem="Home" />
      <PageContainer title="Home">
        <LoadingSpinner />
      </PageContainer>
    </>
  );
}
