"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { PageContainer } from "@/components/ui/page-container";
import { LoadingSpinner } from "@/components/ui/loading";

export default function ProjectLoading() {
  return (
    <>
      <Sidebar />
      <PageContainer title="Loading Project..." showBackButton={true}>
        <LoadingSpinner className="h-96" />
      </PageContainer>
    </>
  );
}
