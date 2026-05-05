"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { PageContainer } from "@/components/ui/page-container";
import { PostCard } from "@/components/home/organisms/post-card";
import { CommentSection } from "@/components/project/comment-section";
import { LoadingSpinner } from "@/components/ui/loading";
import { trpc } from "@/app/_trpc/client";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CustomAlertDialog } from "@/components/ui/custom-alert-dialog";
import { AuthPromptDialog } from "@/components/ui/auth-prompt-dialog";
import { skipToken } from "@tanstack/react-query";
import { STALE } from "@/lib/query-config";
import { useToast } from "@/contexts/toast-context";

interface ProjectDetailViewProps {
  projectId: string;
}

export function ProjectDetailView({ projectId }: ProjectDetailViewProps) {
  const router = useRouter();
  const { user, isLoaded: isUserLoaded } = useUser();
  const [isMobile, setIsMobile] = useState(false);
  const { showToast } = useToast();

  const [optimisticLike, setOptimisticLike] = useState<boolean | undefined>(undefined);
  const [optimisticBookmark, setOptimisticBookmark] = useState<boolean | undefined>(undefined);

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false);
  const [isUnarchiveConfirmOpen, setIsUnarchiveConfirmOpen] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authDialogMessage, setAuthDialogMessage] = useState<string | undefined>(undefined);

  const utils = trpc.useUtils();
  const currentUserId = user?.id;

  // Query key: pass id_user when known, omit when guest so we hit the
  // same cache key that the server prefetch used (no id_user).
  const queryInput = useMemo(
    () =>
      projectId
        ? { id: projectId, ...(currentUserId ? { id_user: currentUserId } : {}) }
        : undefined,
    [projectId, currentUserId],
  );

  const {
    data: project,
    isLoading,
    error,
    refetch: refetchProject,
  } = trpc.project.getOne.useQuery(queryInput ?? skipToken, {
    // Only block rendering while Clerk is still initialising.
    // Once isUserLoaded is true we can safely fetch (with or without userId).
    enabled: isUserLoaded,
    staleTime: STALE.LONG,
  });

  useEffect(() => {
    const data = project?.data;
    if (data) {
      if (optimisticLike === undefined) setOptimisticLike(data.is_liked);
      if (optimisticBookmark === undefined) setOptimisticBookmark(data.is_bookmarked);
    }
  }, [project, optimisticLike, optimisticBookmark]);

  // --- Mutations ---
  const bookmarkMutation = trpc.bookmark.create.useMutation({
    onMutate: async () => {
      await utils.project.getOne.cancel(queryInput);
      const previousProjectData = utils.project.getOne.getData(queryInput);
      if (queryInput)
        utils.project.getOne.setData(queryInput, (old) =>
          old ? { ...old, is_bookmarked: true } : undefined,
        );
      return { previousProjectData };
    },
    onError: (_err, _vars, context) => {
      setOptimisticBookmark(false);
      if (context?.previousProjectData && queryInput)
        utils.project.getOne.setData(queryInput, context.previousProjectData);
    },
    onSettled: () => {
      utils.project.getOne.invalidate(queryInput);
      if (user?.id) utils.user.getBookmarked.invalidate({ id: user.id });
    },
  });

  const unbookmarkMutation = trpc.bookmark.delete.useMutation({
    onMutate: async () => {
      await utils.project.getOne.cancel(queryInput);
      const previousProjectData = utils.project.getOne.getData(queryInput);
      if (queryInput)
        utils.project.getOne.setData(queryInput, (old) =>
          old ? { ...old, is_bookmarked: false } : undefined,
        );
      return { previousProjectData };
    },
    onError: (_err, _vars, context) => {
      setOptimisticBookmark(true);
      if (context?.previousProjectData && queryInput)
        utils.project.getOne.setData(queryInput, context.previousProjectData);
    },
    onSettled: () => {
      utils.project.getOne.invalidate(queryInput);
      if (user?.id) utils.user.getBookmarked.invalidate({ id: user.id });
    },
  });

  const likeMutation = trpc.likeProject.like.useMutation({
    onMutate: async () => {
      await utils.project.getOne.cancel(queryInput);
      const previousProjectData = utils.project.getOne.getData(queryInput);
      if (queryInput)
        utils.project.getOne.setData(queryInput, (old) =>
          old ? { ...old, is_liked: true, count_likes: (old.data.count_likes || 0) + 1 } : undefined,
        );
      setOptimisticLike(true);
      return { previousProjectData };
    },
    onError: (err: unknown, _vars, context) => {
      setOptimisticLike(false);
      if (context?.previousProjectData && queryInput)
        utils.project.getOne.setData(queryInput, context.previousProjectData);
      if ((err as { data?: { code: string } }).data?.code === "CONFLICT") {
        if (queryInput)
          utils.project.getOne.setData(queryInput, (old) =>
            old ? { ...old, is_liked: true } : undefined,
          );
        setOptimisticLike(true);
      }
    },
    onSettled: () => utils.project.getOne.invalidate(queryInput),
  });

  const unlikeMutation = trpc.likeProject.unlike.useMutation({
    onMutate: async () => {
      await utils.project.getOne.cancel(queryInput);
      const previousProjectData = utils.project.getOne.getData(queryInput);
      if (queryInput)
        utils.project.getOne.setData(queryInput, (old) =>
          old
            ? { ...old, is_liked: false, count_likes: Math.max(0, (old.data.count_likes || 0) - 1) }
            : undefined,
        );
      setOptimisticLike(false);
      return { previousProjectData };
    },
    onError: (err: unknown, _vars, context) => {
      setOptimisticLike(true);
      if (context?.previousProjectData && queryInput)
        utils.project.getOne.setData(queryInput, context.previousProjectData);
      if ((err as { data?: { code: string } }).data?.code === "NOT_FOUND") {
        if (queryInput)
          utils.project.getOne.setData(queryInput, (old) =>
            old ? { ...old, is_liked: false } : undefined,
          );
        setOptimisticLike(false);
      }
    },
    onSettled: () => utils.project.getOne.invalidate(queryInput),
  });

  const deleteProjectMutation = trpc.project.delete.useMutation({
    onSuccess: () => {
      utils.project.getAll.invalidate();
      router.push("/feeds");
    },
    onError: (error) => {
      showToast(`Failed to delete project: ${error.message}`, "error");
    },
  });

  const archiveProjectMutation = trpc.project.archive.useMutation({
    onSuccess: () => refetchProject(),
    onError: (error) => showToast(`Failed to archive project: ${error.message}`, "error"),
  });

  const unarchiveProjectMutation = trpc.project.unarchive.useMutation({
    onSuccess: () => refetchProject(),
    onError: (error) => showToast(`Failed to unarchive project: ${error.message}`, "error"),
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 690);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- Interaction handlers ---
  const handleToggleBookmark = () => {
    if (!user || !project) {
      setAuthDialogMessage("Sign in to save projects to your personal collection.");
      setAuthDialogOpen(true);
      return;
    }
    const currentIsBookmarked =
      optimisticBookmark !== undefined ? optimisticBookmark : project.data.is_bookmarked;
    setOptimisticBookmark(!currentIsBookmarked);
    if (currentIsBookmarked) {
      unbookmarkMutation.mutate({ id_user: user.id, id_project: project.data.id });
    } else {
      bookmarkMutation.mutate({ id_user: user.id, id_project: project.data.id });
    }
  };

  const handleToggleLike = () => {
    if (!user || !project) {
      setAuthDialogMessage("Sign in to like projects and show your appreciation.");
      setAuthDialogOpen(true);
      return;
    }
    const currentIsLiked = optimisticLike !== undefined ? optimisticLike : project.data.is_liked;
    if (currentIsLiked) {
      unlikeMutation.mutate({ id_user: user.id, id_project: project.data.id });
    } else {
      likeMutation.mutate({ id_user: user.id, id_project: project.data.id });
    }
  };

  const handleConfirmDeleteProject = () => {
    if (!project || !user) return;
    deleteProjectMutation.mutate({ id: project.data.id, id_user: user.id });
  };
  const handleConfirmArchiveProject = () => {
    if (!project || !user) return;
    archiveProjectMutation.mutate({ id: project.data.id, id_user: user.id });
  };
  const handleConfirmUnarchiveProject = () => {
    if (!project || !user) return;
    unarchiveProjectMutation.mutate({ id: project.data.id, id_user: user.id });
  };

  // --- Render states ---
  if (!isUserLoaded || isLoading) {
    return (
      <>
        <Sidebar />
        <PageContainer title="Loading Project..." showBackButton={true}>
          <LoadingSpinner className="h-96" />
        </PageContainer>
      </>
    );
  }

  if (error || !project) {
    return (
      <>
        <Sidebar />
        <PageContainer title={error ? "Error" : "Project Not Found"} showBackButton={true}>
          <div className="p-8 text-center">
            <h2 className="text-xl font-bold mb-4">
              {error ? "Could not load project" : "Project not found"}
            </h2>
            <p>
              {error
                ? error.message
                : "The project you're looking for doesn't exist or has been removed."}
            </p>
            <button
              onClick={() => router.push("/")}
              className="mt-6 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-foreground transition-colors"
            >
              Go to Home
            </button>
          </div>
        </PageContainer>
      </>
    );
  }

  const isOwner = project.data.project_user.some(
    (pu) => pu.ownership === "OWNER" && pu.user.id === currentUserId,
  );

  const postCardData = {
    ...project,
    isBookmarked:
      optimisticBookmark !== undefined ? optimisticBookmark : !!project.data.is_bookmarked,
    isLiked: optimisticLike !== undefined ? optimisticLike : !!project.data.is_liked,
    onToggleBookmark: handleToggleBookmark,
    onToggleLike: handleToggleLike,
  };

  return (
    <>
      <Sidebar />
      <PageContainer title={project.data.title || "Project Details"} showBackButton={true}>
        {isOwner && (
          <div className="flex justify-end gap-2 mb-4 px-4 pt-4 md:px-0 md:pt-0">
            {project.data.is_archived ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsUnarchiveConfirmOpen(true)}
                disabled={unarchiveProjectMutation.isPending}
                className="border-slate-700 hover:bg-slate-700/80"
              >
                {unarchiveProjectMutation.isPending ? "Unarchiving..." : "Unarchive"}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsArchiveConfirmOpen(true)}
                disabled={archiveProjectMutation.isPending}
                className="border-slate-700 hover:bg-slate-700/80"
              >
                {archiveProjectMutation.isPending ? "Archiving..." : "Archive"}
              </Button>
            )}
            <Link href={`/project/${project.data.slug}/edit`}>
              <Button variant="outline" size="sm" className="border-slate-700 hover:bg-slate-700/80">
                Edit
              </Button>
            </Link>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsDeleteConfirmOpen(true)}
              disabled={deleteProjectMutation.isPending}
            >
              {deleteProjectMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        )}

        <div
          className={`overflow-hidden ${isMobile ? "bg-background" : "bg-card rounded-3xl border border-white/10"}`}
        >
          <div className="p-2">
            <PostCard {...postCardData} />
            <div className="my-1 border-t border-white/10 mx-4"></div>
            <div>
              <CommentSection projectId={project.data.id} currentUser={user} />
            </div>
          </div>
        </div>
      </PageContainer>

      <CustomAlertDialog
        isOpen={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        title="Delete Project"
        description="Are you sure you want to delete this project? This will also delete all associated comments and data. This action cannot be undone."
        onConfirm={handleConfirmDeleteProject}
        confirmText="Yes, Delete Project"
        confirmButtonVariant="destructive"
      />
      <CustomAlertDialog
        isOpen={isArchiveConfirmOpen}
        onOpenChange={setIsArchiveConfirmOpen}
        title="Archive Project"
        description="Are you sure you want to archive this project? It will be hidden from public view but can be unarchived later."
        onConfirm={handleConfirmArchiveProject}
        confirmText="Yes, Archive"
        confirmButtonVariant="default"
      />
      <CustomAlertDialog
        isOpen={isUnarchiveConfirmOpen}
        onOpenChange={setIsUnarchiveConfirmOpen}
        title="Unarchive Project"
        description="Are you sure you want to unarchive this project? It will become publicly visible again."
        onConfirm={handleConfirmUnarchiveProject}
        confirmText="Yes, Unarchive"
        confirmButtonVariant="default"
      />
      <AuthPromptDialog
        isOpen={authDialogOpen}
        onClose={() => setAuthDialogOpen(false)}
        message={authDialogMessage}
      />
    </>
  );
}
