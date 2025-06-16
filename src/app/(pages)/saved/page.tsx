// app/saved/page.tsx

"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { PostCard } from "@/components/home/organisms/post-card";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { PageContainer } from "@/components/ui/page-container";
import { LoadingSpinner } from "@/components/ui/loading";
import { useState, useEffect, useCallback, useMemo } from "react";
import { trpc } from "@/app/_trpc/client";
import { ProjectOneType, BookmarkType } from "@/lib/type";
import { useUser } from "@clerk/nextjs";
import { getPublicUrl } from "@/lib/utils";
import { redirect } from "next/navigation";
import { CustomAlertDialog } from "@/components/ui/custom-alert-dialog"; // Import dialog

// Transform bookmarked item data to PostCard props (remains the same)
const transformSavedItemToPostCardProps = (
  bookmarkItem: BookmarkType,
  optimisticBookmarks: Record<string, boolean>
) => {
  const project = bookmarkItem.project;
  const primaryUser = project.project_user && project.project_user[0]?.user;

  const isBookmarked = optimisticBookmarks[project.id] !== undefined
    ? optimisticBookmarks[project.id]
    : true;

  let resolvedAvatarSrc: string;
  if (primaryUser?.photo_profile) {
    if (primaryUser.photo_profile.startsWith('http')) {
      resolvedAvatarSrc = primaryUser.photo_profile;
    } else {
      resolvedAvatarSrc = getPublicUrl(primaryUser.photo_profile);
    }
  } else {
    resolvedAvatarSrc = '/img/dummy/profile-photo-dummy.jpg';
  }

  return {
    id: project.id,
    slug: project.slug,
    title: project.title,
    username: primaryUser?.username || 'Unknown User',
    userRole: 'Developer',
    avatarSrc: resolvedAvatarSrc,
    timestamp: project.created_at, // Pass raw date string

    content: "",
    likes: 0,
    comments: 0,
    link_figma: undefined,
    link_github: undefined,
    category: undefined,
    isLiked: false,

    image1: project.image1 ? getPublicUrl(project.image1) : undefined,
    image2: project.image2 ? getPublicUrl(project.image2) : undefined,
    image3: project.image3 ? getPublicUrl(project.image3) : undefined,
    image4: project.image4 ? getPublicUrl(project.image4) : undefined,
    image5: project.image5 ? getPublicUrl(project.image5) : undefined,
    
    isBookmarked: isBookmarked,
  };
};

export default function SavedProjectsPage() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const [isMobile, setIsMobile] = useState(false);
  const [allPosts, setAllPosts] = useState<ReturnType<typeof transformSavedItemToPostCardProps>[]>([]);
  const [optimisticBookmarks, setOptimisticBookmarks] = useState<Record<string, boolean>>({});

  // State for confirmation dialog
  const [isUnsaveConfirmOpen, setIsUnsaveConfirmOpen] = useState(false);
  const [projectToUnsaveId, setProjectToUnsaveId] = useState<string | null>(null);

  const utils = trpc.useUtils();
  const currentUserIdSaved = user?.id || "";

  const queryClientKeyUserGetBookmarked = useMemo(() => ({
    id: currentUserIdSaved,
    limit: 10
  }), [currentUserIdSaved]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = trpc.user.getBookmarked.useInfiniteQuery(
    { id: currentUserIdSaved, limit: 10 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: !!user && isUserLoaded,
      refetchOnWindowFocus: false,
    }
  );

  const unbookmarkMutation = trpc.bookmark.delete.useMutation({
    onMutate: async (variables) => {
      await utils.user.getBookmarked.cancel(queryClientKeyUserGetBookmarked);
      const previousQueryData = utils.user.getBookmarked.getInfiniteData(queryClientKeyUserGetBookmarked);
      utils.user.getBookmarked.setInfiniteData(queryClientKeyUserGetBookmarked, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map(page => ({
            ...page,
            items: page.items.filter((item: BookmarkType) => item.project.id !== variables.id_project),
          })),
        };
      });
      return { previousQueryData };
    },
    onError: (err, variables, context) => {
      setOptimisticBookmarks((prev) => ({ ...prev, [variables.id_project]: true }));
      if (context?.previousQueryData) {
        utils.user.getBookmarked.setInfiniteData(queryClientKeyUserGetBookmarked, context.previousQueryData);
      }
    },
    onSettled: (data, error, variables) => {
      utils.user.getBookmarked.invalidate(queryClientKeyUserGetBookmarked);
      if (user?.id) {
        // Invalidate project.getOne if the user navigates to a project detail page
        // that was just unbookmarked, to reflect the change.
        if (variables?.id_project) {
            utils.project.getOne.invalidate({ id: variables.id_project, id_user: user.id });
        }
        // Also invalidate feeds page if it shows bookmark status directly
        utils.project.getAll.invalidate({ limit: 15, id_user: user.id });
      }
    },
  });

  useEffect(() => {
    if (data?.pages) {
      const transformedPosts = data.pages
        .flatMap(page => page.items as BookmarkType[])
        .map(item => transformSavedItemToPostCardProps(item, optimisticBookmarks));
      setAllPosts(transformedPosts);
    }
  }, [data, optimisticBookmarks]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 690);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - 1000 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handleFabClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Opens the confirmation dialog
  const promptUnsave = (projectId: string) => {
    setProjectToUnsaveId(projectId);
    setIsUnsaveConfirmOpen(true);
  };

  // Called when user confirms unsave action in the dialog
  const handleConfirmUnsave = () => {
    if (!user || !projectToUnsaveId) return;
    setOptimisticBookmarks((prev) => ({ ...prev, [projectToUnsaveId]: false }));
    unbookmarkMutation.mutate(
      { id_user: user.id, id_project: projectToUnsaveId }
    );
    setProjectToUnsaveId(null); // Reset
  };

  const handleToggleLikeDisabled = () => {
    // This function is passed to PostCard but won't be used in 'saved-page' context
    // as the like button won't be visible.
  };

  // Add this line to define trulySavedPosts
  const trulySavedPosts = allPosts.filter(post => 
    optimisticBookmarks[post.id] !== undefined ? optimisticBookmarks[post.id] : post.isBookmarked
  );

  // Always render the layout structure
  return (
    <>
      <Sidebar activeItem="Saved projects" />
      <PageContainer title="Saved Projects">
        <div className={`overflow-hidden ${isMobile ? 'bg-background' : ''}`}>
          
          {/* Show loading when user is not loaded or when initially loading data */}
          {(!isUserLoaded || (isLoading && trulySavedPosts.length === 0)) && (
            <LoadingSpinner />
          )}
          
          {/* Show sign-in message when user is loaded but not authenticated */}
          {isUserLoaded && !user && (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Please sign in to view your saved projects.</p>
            </div>
          )}
          
          {/* Show error state */}
          {isUserLoaded && user && isError && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-red-500 mb-2">Error Loading Saved Projects</h3>
                <p className="text-muted-foreground">
                  {error?.message || 'Failed to load saved projects. Please try again later.'}
                </p>
              </div>
            </div>
          )}
          
          {/* Show posts when user is loaded, authenticated, and data is available */}
          {isUserLoaded && user && !isError && trulySavedPosts.length > 0 && trulySavedPosts.map((post) => (
            <div key={post.id} className={`${isMobile ? 'border-b border-white/10 p-1' : 'bg-card rounded-3xl border border-white/10 mb-4'}`}>
              <PostCard
                {...post}
                displayContext="saved-page"
                onToggleBookmark={() => promptUnsave(post.id)}
                onToggleLike={handleToggleLikeDisabled}
              />
            </div>
          ))}
          
          {/* Show pagination loading */}
          {isFetchingNextPage && (
            <LoadingSpinner className="h-32" />
          )}
          
          {/* Show end of results message */}
          {isUserLoaded && user && !isError && !hasNextPage && !isLoading && trulySavedPosts.length > 0 && !isFetchingNextPage && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No more saved projects</p>
            </div>
          )}
          
          {/* Show empty state */}
          {isUserLoaded && user && !isError && !isLoading && !isFetchingNextPage && trulySavedPosts.length === 0 && (
            <div className="text-center py-16">
              <h3 className="text-lg font-semibold mb-2">No Saved Projects</h3>
              <p className="text-muted-foreground">You haven't bookmarked any projects yet.</p>
            </div>
          )}
        </div>
      </PageContainer>

      <FloatingActionButton onClick={handleFabClick} />

      {/* Confirmation Dialog for Unsave */}
      <CustomAlertDialog
        isOpen={isUnsaveConfirmOpen}
        onOpenChange={setIsUnsaveConfirmOpen}
        title="Unsave Project"
        description="Are you sure you want to unsave this project?"
        onConfirm={handleConfirmUnsave} // This will call unbookmarkMutation
        confirmText="Yes, Unsave"
        confirmButtonVariant="destructive" // "destructive" or "default" as preferred
      />
    </>
  );
}