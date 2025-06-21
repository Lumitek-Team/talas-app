// app/project/[id]/edit/page.tsx

"use client";

import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { trpc } from "@/app/_trpc/client";
import { PageContainer } from "@/components/ui/page-container";
import { Sidebar } from "@/components/layout/sidebar";
// Ensure ProjectForm is adapted to handle edit mode and these props
import { ProjectForm, ProjectFormValues } from "@/components/project/project-form";
import { useEffect, useState } from "react";
import { ProjectOneType } from "@/lib/type"; // Type for project data

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const utils = trpc.useUtils();
  const { user, isLoaded: isUserLoaded } = useUser();

  // Assuming the route is /project/[slug]/edit, so params.id is the slug.
  // If the route uses the actual ID, this would be params.id.
  // The provided page.tsx links to /project/${project.slug}/edit.
  const projectIdOrSlug = params.id as string;

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 690);
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { data: project, isLoading: isLoadingProject, error: projectError } = trpc.project.getOne.useQuery(
    {
      id: projectIdOrSlug, // Pass the slug (or ID) to fetch the project
      id_user: user!.id,   // Pass current user ID for backend checks (e.g., viewing own archived project)
    },
    {
      enabled: !!projectIdOrSlug && isUserLoaded && !!user, // Enable query when slug/ID and user are available
    }
  );

  // The updateProjectMutation is defined here for clarity, but the actual call
  // to `mutate` would ideally be encapsulated within the enhanced ProjectForm.
  // For ProjectForm to handle its own mutation, it would use trpc.project.edit.useMutation internally.
  const updateProjectMutation = trpc.project.edit.useMutation({
    onSuccess: (updatedProjectData) => {
      // Invalidate relevant queries to refetch data on other pages
      utils.project.getOne.invalidate({ id: updatedProjectData.data.slug, id_user: user?.id });
      // If you sometimes query by raw ID, invalidate that too
      utils.project.getOne.invalidate({ id: updatedProjectData.data.id, id_user: user?.id });
      utils.project.getAll.invalidate(); // Invalidate project lists/feeds
      // Potentially invalidate user-specific project lists if they exist

      router.push(`/project/${updatedProjectData.data.slug || projectIdOrSlug}`); // Navigate back to the project detail page
      // Consider adding a success toast notification here
    },
    onError: (error) => {
      console.error("Failed to update project:", error);
      // Display a toast notification to the user
      alert(`Error updating project: ${error.message}`); // Replace with a proper toast
    },
  });


  // Page loading states
  if (!isUserLoaded || isLoadingProject) {
    return (
      <>
        <Sidebar />
        <PageContainer title="Loading..." showBackButton={true}>
          <div className="p-6">
            <p>Loading project details for editing...</p> {/* Consider a skeleton loader here */}
          </div>
        </PageContainer>
      </>
    );
  }

  // Handling user not signed in (Clerk usually handles this with middleware for protected routes)
  if (isUserLoaded && !user) {
    // This should ideally be caught by route protection, but as a fallback:
    useEffect(() => { router.push("/sign-in"); }, [router]);
    return (
      <>
        <Sidebar />
        <PageContainer title="Authentication Required" showBackButton={false}>
          <div className="p-6"><p>Redirecting to sign-in...</p></div>
        </PageContainer>
      </>
    );
  }

  // Error fetching project or project not found
  if (projectError || !project) {
    return (
      <>
        <Sidebar />
        <PageContainer title={projectError ? "Error" : "Project Not Found"} showBackButton={true} backButtonHref="/feeds">
          <div className="p-6">
            <p>{projectError ? `Could not load project: ${projectError.message}` : "The project you're trying to edit doesn't exist or has been removed."}</p>
          </div>
        </PageContainer>
      </>
    );
  }

  // Authorization: Check if the current user is the owner of the project
  // Assumes project_user[0] is the primary owner.
  const isOwner = project.data.project_user.some(
    (pu) => pu.ownership === "OWNER" && pu.user.id === user.id
  );

  if (!isOwner) {
    // Redirect if not the owner. useEffect ensures this runs client-side after initial render.
    useEffect(() => {
      router.push(`/project/${project?.data.slug || projectIdOrSlug}`);
    }, [router, project, projectIdOrSlug]);

    return (
      <>
        <Sidebar />
        <PageContainer title="Unauthorized" showBackButton={true} backButtonHref={`/project/${project?.data.slug || projectIdOrSlug}`}>
          <div className="p-6"><p>You are not authorized to edit this project. Redirecting...</p></div>
        </PageContainer>
      </>
    );
  }

  // Prepare initial data for the form, mapping from ProjectOneType to ProjectFormValues
  const initialFormValues: Partial<ProjectFormValues> = {
    title: project.data.title,
    caption: project.data.content, // 'caption' in form schema maps to 'content' in DB
    githubUrl: project.data.link_github || "",
    figmaUrl: project.data.link_figma || "",
    category: project.data.id_category, // Store category ID
  };

  // Extract existing image URLs to pass to the ProjectForm
  const existingImageUrls: (string | null)[] = [
    project.data.image1,
    project.data.image2,
    project.data.image3,
    project.data.image4,
    project.data.image5,
  ].map(url => url || null); // Use null for empty image slots

  return (
    <>
      <Sidebar activeItem="Create" /> {/* Or a more relevant activeItem like "My Projects" */}
      <PageContainer title={`Edit: ${project.data.title}`} showBackButton={true} backButtonHref={`/project/${project.data.slug || projectIdOrSlug}`}>
        <div className={`overflow-hidden ${isMobile ? 'bg-background' : 'bg-card rounded-3xl border border-white/10'}`}>
          <div className="p-6 space-y-6">
            {/*
              The ProjectForm component needs to be significantly enhanced to:
              1. Accept `mode="edit"`.
              2. Use `initialData` and `existingImageUrls` to pre-fill the form and display current images.
              3. Manage its own state for image files (new uploads) and previews.
              4. Contain the `trpc.project.edit.useMutation()` hook internally.
              5. Its internal onSubmit handler would then:
                - Upload any new/changed image files.
                - Determine which existing images were cleared (to send `null` for those fields).
                - Construct the final payload for the mutation, including `projectId` and `userId`.
                - Call the mutate function.
            */}
            <ProjectForm
              mode="edit"
              project={project.data} // Pass the fetched project data directly
            // initialData, existingImageUrls, projectId props are removed from ProjectForm
            />
          </div>
        </div>
      </PageContainer>
    </>
  );
}