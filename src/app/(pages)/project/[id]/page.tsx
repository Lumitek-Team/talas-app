// src/app/(pages)/project/[id]/page.tsx
// Server Component — prefetches project data on the server so the client
// renders the full page instantly with zero loading spinner.
import { createServerSideHelpers } from "@trpc/react-query/server";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { appRouter } from "@/app/server";
import { createContext } from "@/app/server/context";
import superjson from "superjson";
import { notFound } from "next/navigation";
import { ProjectDetailView } from "@/components/project/project-detail-view";
import { Metadata } from "next";
import { getPublicUrl } from "@/lib/utils";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const helpers = createServerSideHelpers({
      router: appRouter,
      ctx: await createContext(),
      transformer: superjson,
    });

    const project = await helpers.project.getOne.fetch({ id });

    if (!project?.data) {
      return {
        title: "Project Not Found | Talas",
      };
    }

    const title = `${project.data.title} | Talas`;
    const description = project.data.content?.substring(0, 160) || "Check out this amazing project on Talas.";
    const image = project.data.image1 ? getPublicUrl(project.data.image1) : "/img/og-default.png";

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [image],
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [image],
      },
    };
  } catch (error) {
    console.error("METADATA_ERROR: Project metadata fetch failed:", error);
    return {
      title: "Project Details | Talas",
      description: "View project details and collaboration history on Talas.",
    };
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;

  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: await createContext(),
    transformer: superjson,
  });

  // Prefetch without a user ID — this is the public, guest-accessible snapshot.
  // When the client loads and Clerk resolves the user, it will refetch with
  // the user ID to get personalised like/bookmark state. Because staleTime is
  // 5 minutes, the initial public data still shows instantly.
  const project = await helpers.project.getOne
    .fetch({ id })
    .catch(() => null);

  if (!project) notFound();

  // Prefetch comments in parallel (already resolved by the time client loads)
  await helpers.project.getComments
    .prefetch({ id: project.data.id })
    .catch(() => null);

  return (
    <HydrationBoundary state={dehydrate(helpers.queryClient)}>
      <ProjectDetailView projectId={id} />
    </HydrationBoundary>
  );
}
