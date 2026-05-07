"use client";

import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { trpc } from "@/app/_trpc/client";
import { PageContainer } from "@/components/ui/page-container";
import { Sidebar } from "@/components/layout/sidebar";
import { ProjectForm } from "@/components/project/project-form";

import { useEffect, useState } from "react";


export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoaded: isUserLoaded } = useUser();

  const projectIdOrSlug = params.id as string;

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 690);
    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const {
    data: project,
    isLoading: isLoadingProject,
    error: projectError,
  } = trpc.project.getOne.useQuery(
    {
      id: projectIdOrSlug,
    },
    {
      enabled: !!projectIdOrSlug && isUserLoaded && !!user,
    },
  );

  // Authorization check
  const isOwner = project?.data.project_user.some(
    (pu) => pu.ownership === "OWNER" && pu.user.id === user?.id,
  );

  // Unified effects at top level
  useEffect(() => {
    if (isUserLoaded && !user) {
      router.push("/sign-in");
    }
  }, [isUserLoaded, user, router]);

  useEffect(() => {
    if (isUserLoaded && user && project && !isLoadingProject && !isOwner) {
      router.push(`/project/${project.data.slug || projectIdOrSlug}`);
    }
  }, [isUserLoaded, user, project, isLoadingProject, isOwner, router, projectIdOrSlug]);

  // Page loading states
  if (!isUserLoaded || isLoadingProject) {
    return (
      <>
        <Sidebar />
        <PageContainer title="Loading..." showBackButton={true}>
          <div className="p-6">
            <p>Loading project details for editing...</p>
          </div>
        </PageContainer>
      </>
    );
  }

  // Fallback for redirected states
  if (!user || (project && !isOwner)) {
    return null;
  }

  // Error fetching project or project not found
  if (projectError || !project) {
    return (
      <>
        <Sidebar />
        <PageContainer
          title={projectError ? "Error" : "Project Not Found"}
          showBackButton={true}
          backButtonHref="/feeds"
        >
          <div className="p-6">
            <p>
              {projectError
                ? `Could not load project: ${projectError.message}`
                : "The project you're trying to edit doesn't exist or has been removed."}
            </p>
          </div>
        </PageContainer>
      </>
    );
  }

  return (
    <>
      <Sidebar activeItem="Create" />
      <PageContainer
        title={`Edit: ${project.data.title}`}
        showBackButton={true}
        backButtonHref={`/project/${project.data.slug || projectIdOrSlug}`}
      >
        <div
          className={`overflow-hidden ${isMobile ? "bg-background" : "bg-card rounded-3xl border border-white/10"}`}
        >
          <div className="p-6 space-y-6">
            <ProjectForm
              mode="edit"
              project={project.data}
            />
          </div>
        </div>
      </PageContainer>
    </>
  );
}
