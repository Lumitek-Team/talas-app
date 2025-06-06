"use client";

import { useRouter } from "next/navigation";
import { trpc } from "@/app/_trpc/client";
import { Sidebar } from "@/components/layout/sidebar";
import { PageContainer } from "@/components/ui/page-container";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { CardArchive } from "@/components/archive/card-archive";
import type { ProjectType } from "@/components/archive/card-archive";
import { PostSkeleton } from "@/components/project/skeleton";

export default function Archive() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const userId = user?.id;

  const { data, isLoading } = trpc.project.getArchived.useQuery(
    { id_user: userId || "" },
    { enabled: !!userId }
  );

  // Detect mobile
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 690);
    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Redirect if user not signed in
  useEffect(() => {
    if (isLoaded && !userId) {
      router.push("/sign-in");
    }
  }, [isLoaded, userId, router]);

  if (!isLoaded || !userId) return null;

  return (
    <>
      <Sidebar activeItem="Settings" />
      <PageContainer title="Archive" showBackButton={true}>
        <div
          className={`text-white shadow-md space-y-4 p-6 pt-10 ${
            isMobile
              ? "bg-background"
              : "bg-card rounded-3xl border border-white/10"
          }`}
        >
          <div className="w-full flex justify-center">
            <div className="w-full max-w-3xl space-y-6">
              {isLoading ? (
                <>
                  <PostSkeleton />
                  <PostSkeleton />
                </>
              ) : data?.projects?.length ? (
                data.projects.map((project: ProjectType, index: number) => (
                  <div key={project.id}>
                    <CardArchive project={project} />
                    {index < data.projects.length - 1 && (
                      <div className="my-1 border-t border-white/10 mb-5" />
                    )}
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center">
                  No archived projects.
                </p>
              )}
            </div>
          </div>
        </div>
      </PageContainer>
      <FloatingActionButton />
    </>
  );
}
