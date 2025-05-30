// app/project/[id]/page.tsx (Refactored with Owner Actions)
"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { PageContainer } from "@/components/ui/page-container";
import { PostCard } from "@/components/home/organisms/post-card";
import { CommentSection } from "@/components/project/comment-section";
import { trpc } from "@/app/_trpc/client";
import { useUser } from "@clerk/nextjs";
import { PostSkeleton } from '@/components/project/skeleton';
import { getPublicUrl } from "@/lib/utils";
import { ProjectOneType } from "@/lib/type";
import { Button } from "@/components/ui/button"; // Added
import Link from "next/link"; // Added
import { CustomAlertDialog } from "@/components/ui/custom-alert-dialog"; // Added

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoaded: isUserLoaded } = useUser();
  const projectId = params.id as string; // Assuming slug or ID is passed as 'id'
  const [isMobile, setIsMobile] = useState(false);

  const [optimisticLike, setOptimisticLike] = useState<boolean | undefined>(undefined);
  const [optimisticBookmark, setOptimisticBookmark] = useState<boolean | undefined>(undefined);

  // State for confirmation dialogs
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false);
  const [isUnarchiveConfirmOpen, setIsUnarchiveConfirmOpen] = useState(false);

  const utils = trpc.useUtils();
  const currentUserId = user?.id || "";

  const queryClientKeyProjectGetOne = useMemo(() => ({
    id: projectId, // Use projectId which could be slug or ID
    id_user: currentUserId,
  }), [projectId, currentUserId]);

  const { data: project, isLoading, error, refetch: refetchProject } = trpc.project.getOne.useQuery(
    queryClientKeyProjectGetOne,
    {
      enabled: !!projectId && isUserLoaded && (!!user || !currentUserId),
      onSuccess: (data) => {
        if (data) {
          // This condition should now correctly initialize optimisticLike
          if (optimisticLike === undefined) setOptimisticLike(data.is_liked);
          if (optimisticBookmark === undefined) setOptimisticBookmark(data.is_bookmarked);
        }
      }
    }
  );

  // Project mutations (like, bookmark - from previous refactor)
  const bookmarkMutation = trpc.bookmark.create.useMutation({
    onMutate: async () => { /* ... */ await utils.project.getOne.cancel(queryClientKeyProjectGetOne); const previousProjectData = utils.project.getOne.getData(queryClientKeyProjectGetOne); utils.project.getOne.setData(queryClientKeyProjectGetOne, (oldData) => oldData ? { ...oldData, is_bookmarked: true } : undefined ); return { previousProjectData }; },
    onError: (err, variables, context) => { setOptimisticBookmark(false); if (context?.previousProjectData) utils.project.getOne.setData(queryClientKeyProjectGetOne, context.previousProjectData); },
    onSettled: () => { utils.project.getOne.invalidate(queryClientKeyProjectGetOne); if(user?.id) utils.user.getBookmarked.invalidate({ id: user.id }); },
  });
  const unbookmarkMutation = trpc.bookmark.delete.useMutation({
    onMutate: async () => { /* ... */ await utils.project.getOne.cancel(queryClientKeyProjectGetOne); const previousProjectData = utils.project.getOne.getData(queryClientKeyProjectGetOne); utils.project.getOne.setData(queryClientKeyProjectGetOne, (oldData) => oldData ? { ...oldData, is_bookmarked: false } : undefined ); return { previousProjectData }; },
    onError: (err, variables, context) => { setOptimisticBookmark(true); if (context?.previousProjectData) utils.project.getOne.setData(queryClientKeyProjectGetOne, context.previousProjectData); },
    onSettled: () => { utils.project.getOne.invalidate(queryClientKeyProjectGetOne); if(user?.id) utils.user.getBookmarked.invalidate({ id: user.id }); },
  });
  const likeMutation = trpc.likeProject.like.useMutation({
    onMutate: async () => { 
        await utils.project.getOne.cancel(queryClientKeyProjectGetOne); 
        const previousProjectData = utils.project.getOne.getData(queryClientKeyProjectGetOne); 
        utils.project.getOne.setData(queryClientKeyProjectGetOne, (oldData) => 
            oldData ? { ...oldData, is_liked: true, count_likes: (oldData.count_likes || 0) + 1 } : undefined 
        ); 
        setOptimisticLike(true); // Explicitly set optimistic state here too
        return { previousProjectData }; 
    },
    onError: (err: any, variables, context) => { 
        // Revert optimistic update
        setOptimisticLike(false); 
        if (context?.previousProjectData) { 
            utils.project.getOne.setData(queryClientKeyProjectGetOne, context.previousProjectData); 
        }
        // Handle specific error for already liked (Conflict)
        if (err.data?.code === 'CONFLICT') {
            // Ensure UI reflects server state: it IS liked
            utils.project.getOne.setData(queryClientKeyProjectGetOne, (oldData) => 
                oldData ? { ...oldData, is_liked: true } : undefined 
            );
            setOptimisticLike(true);
        }
    },
    onSettled: () => utils.project.getOne.invalidate(queryClientKeyProjectGetOne),
  });

  const unlikeMutation = trpc.likeProject.unlike.useMutation({
    onMutate: async () => { 
        await utils.project.getOne.cancel(queryClientKeyProjectGetOne); 
        const previousProjectData = utils.project.getOne.getData(queryClientKeyProjectGetOne); 
        utils.project.getOne.setData(queryClientKeyProjectGetOne, (oldData) => 
            oldData ? { ...oldData, is_liked: false, count_likes: Math.max(0, (oldData.count_likes || 0) - 1) } : undefined 
        ); 
        setOptimisticLike(false); // Explicitly set optimistic state here too
        return { previousProjectData }; 
    },
    onError: (err: any, variables, context) => { 
        // Revert optimistic update
        setOptimisticLike(true); 
        if (context?.previousProjectData) { 
            utils.project.getOne.setData(queryClientKeyProjectGetOne, context.previousProjectData); 
        }
        // Handle specific error for not liked (Not Found)
        if (err.data?.code === 'NOT_FOUND') {
             // Ensure UI reflects server state: it is NOT liked
            utils.project.getOne.setData(queryClientKeyProjectGetOne, (oldData) => 
                oldData ? { ...oldData, is_liked: false } : undefined 
            );
            setOptimisticLike(false);
        }
    },
    onSettled: () => utils.project.getOne.invalidate(queryClientKeyProjectGetOne),
  });

  // Owner action mutations (Delete, Archive, Unarchive)
  const deleteProjectMutation = trpc.project.delete.useMutation({
    onSuccess: () => {
      utils.project.getAll.invalidate(); // Invalidate feeds page
      router.push("/feeds"); // Or user's profile page
      // Add success toast
    },
    onError: (error) => {
      console.error("Failed to delete project:", error);
      alert(`Failed to delete project: ${error.message}`); // Replace with toast
    },
  });

  const archiveProjectMutation = trpc.project.archive.useMutation({
    onSuccess: () => {
      refetchProject(); // Refetch current project details
      // Add success toast
    },
    onError: (error) => {
      console.error("Failed to archive project:", error);
      alert(`Failed to archive project: ${error.message}`); // Replace with toast
    },
  });

  const unarchiveProjectMutation = trpc.project.unarchive.useMutation({
    onSuccess: () => {
      refetchProject(); // Refetch current project details
      // Add success toast
    },
    onError: (error) => {
      console.error("Failed to unarchive project:", error);
      alert(`Failed to unarchive project: ${error.message}`); // Replace with toast
    },
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 690);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleToggleBookmark = () => { /* ... as before ... */ if (!user || !project) return; const currentIsBookmarked = optimisticBookmark !== undefined ? optimisticBookmark : project.is_bookmarked; setOptimisticBookmark(!currentIsBookmarked); if (currentIsBookmarked) { unbookmarkMutation.mutate({ id_user: user.id, id_project: project.id }); } else { bookmarkMutation.mutate({ id_user: user.id, id_project: project.id }); } };
  const handleToggleLike = () => { 
    if (!user || !project) return;
    // Optimistic update is now more robustly handled in onMutate and onError
    const currentIsLiked = optimisticLike !== undefined ? optimisticLike : project.is_liked;
    // No need to call setOptimisticLike here directly if mutations handle it well
    if (currentIsLiked) {
      unlikeMutation.mutate({ id_user: user.id, id_project: project.id });
    } else {
      likeMutation.mutate({ id_user: user.id, id_project: project.id });
    }
  };
  
  // Handlers for owner actions
  const handleConfirmDeleteProject = () => {
    if (!project || !user) return;
    deleteProjectMutation.mutate({ id: project.id, id_user: user.id });
  };
  const handleConfirmArchiveProject = () => {
    if (!project || !user) return;
    archiveProjectMutation.mutate({ id: project.id, id_user: user.id });
  };
  const handleConfirmUnarchiveProject = () => {
    if (!project || !user) return;
    unarchiveProjectMutation.mutate({ id: project.id, id_user: user.id });
  };

  if (!isUserLoaded || (currentUserId && !user)) { /* ... loading user ... */ return <><Sidebar /><PageContainer title="Loading User..." showBackButton={true}><div className="space-y-4 p-4"><PostSkeleton /></div></PageContainer></>; }
  if (isLoading) { /* ... loading project ... */  return <><Sidebar /><PageContainer title="Loading Project..." showBackButton={true}><div className="space-y-4 p-4"><PostSkeleton /></div></PageContainer></>; }
  if (error || !project) { /* ... error or not found ... */ return <><Sidebar /><PageContainer title={error ? "Error" : "Project Not Found"} showBackButton={true}><div className="p-8 text-center"><h2 className="text-xl font-bold mb-4">{error ? "Could not load project" : "Project not found"}</h2><p>{error ? error.message : "The project you're looking for doesn't exist or has been removed."}</p><button onClick={() => router.push('/')} className="mt-6 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-foreground transition-colors">Go to Home</button></div></PageContainer></>; }

  const primaryProjectUser = project.project_user && project.project_user[0]?.user;
  const isOwner = user && primaryProjectUser && user.id === primaryProjectUser.id;

  const postCardData = { /* ... as before ... */
    id: project.id, slug: project.slug, title: project.title,
    username: primaryProjectUser?.username || 'Unknown User', userRole: 'Developer',
    avatarSrc: getPublicUrl(primaryProjectUser?.photo_profile) || '/img/dummy/profile-photo-dummy.jpg',
    timestamp: project.created_at, // Pass raw date string
    content: project.content,
    image1: project.image1 ? getPublicUrl(project.image1) : undefined,
    image2: project.image2 ? getPublicUrl(project.image2) : undefined,
    image3: project.image3 ? getPublicUrl(project.image3) : undefined,
    image4: project.image4 ? getPublicUrl(project.image4) : undefined,
    image5: project.image5 ? getPublicUrl(project.image5) : undefined,
    likes: project.count_likes, comments: project.count_comments,
    link_figma: project.link_figma, link_github: project.link_github,
    category: project.category,
    isBookmarked: optimisticBookmark !== undefined ? optimisticBookmark : !!project.is_bookmarked,
    isLiked: optimisticLike !== undefined ? optimisticLike : !!project?.is_liked, // Ensure project.is_liked is used as fallback
    onToggleBookmark: handleToggleBookmark,
    onToggleLike: handleToggleLike,
  };

  return (
    <>
      <Sidebar />
      <PageContainer title={project.title || "Project Details"} showBackButton={true}>
        {/* Owner Actions Section */}
        {isOwner && (
          <div className="flex justify-end gap-2 mb-4 px-4 pt-4 md:px-0 md:pt-0">
            {project.is_archived ? (
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
            <Link href={`/project/${project.slug}/edit`}> {/* Assuming edit page uses slug */}
              <Button variant="outline" size="sm" className="border-slate-700 hover:bg-slate-700/80">Edit</Button>
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

        <div className={`overflow-hidden ${isMobile ? 'bg-background' : 'bg-card rounded-3xl border border-white/10'}`}>
          <div className={isOwner && !isMobile ? "p-2" : "p-4"}> {/* Adjust padding if owner actions are present */}
            <PostCard {...postCardData} />
            <div className="my-1 border-t border-white/10 mx-4"></div>
            <div>
                <CommentSection projectId={project.id} currentUser={user} />
            </div>
          </div>
        </div>
      </PageContainer>

      {/* Confirmation Dialogs */}
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
    </>
  );
}