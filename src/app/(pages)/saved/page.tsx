// app/saved/page.tsx (or your equivalent path)
"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { PostCard } from "@/components/home/organisms/post-card";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { PageContainer } from "@/components/ui/page-container";
import { useState, useEffect, useCallback, useMemo } from "react";
import { trpc } from "@/app/_trpc/client";
import { ProjectOneType, BookmarkType } from "@/lib/type"; // Using BookmarkType from your type.ts
import { PostSkeleton } from '@/components/project/skeleton';
import { useUser } from "@clerk/nextjs";
import { getPublicUrl } from "@/lib/utils";
import { redirect } from "next/navigation";

// Transform bookmarked item data to PostCard props
const transformSavedItemToPostCardProps = (
  bookmarkItem: BookmarkType,
  optimisticBookmarks: Record<string, boolean>
) => {
  const project = bookmarkItem.project; // This 'project' has limited fields as per BookmarkType
  const primaryUser = project.project_user && project.project_user[0]?.user;

  const isBookmarked = optimisticBookmarks[project.id] !== undefined
    ? optimisticBookmarks[project.id]
    : true; // Items on this page are bookmarked by default

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

  // Map fields from bookmarkItem.project and provide defaults for those not present
  return {
    id: project.id,
    slug: project.slug,
    title: project.title,
    username: primaryUser?.username || 'Unknown User',
    userRole: 'Developer', // Default
    avatarSrc: resolvedAvatarSrc,
    timestamp: new Date(project.created_at).toLocaleDateString(), // Assuming project.created_at is a valid date string or Date

    // Fields explicitly NOT in bookmarkItem.project as per your BookmarkType:
    content: "", // Default for PostCard
    likes: 0,      // Default for PostCard
    comments: 0,   // Default for PostCard
    link_figma: undefined, // Default for PostCard
    link_github: undefined,// Default for PostCard
    category: undefined,   // Default for PostCard
    isLiked: false,        // Default for PostCard (like status not fetched here)

    // Fields that ARE in bookmarkItem.project:
    image1: project.image1 ? getPublicUrl(project.image1) : undefined,
    image2: project.image2 ? getPublicUrl(project.image2) : undefined,
    image3: project.image3 ? getPublicUrl(project.image3) : undefined,
    image4: project.image4 ? getPublicUrl(project.image4) : undefined,
    image5: project.image5 ? getPublicUrl(project.image5) : undefined,
    
    isBookmarked: isBookmarked, // Crucial for this page's logic
  };
};

export default function SavedProjectsPage() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const [isMobile, setIsMobile] = useState(false);
  const [allPosts, setAllPosts] = useState<ReturnType<typeof transformSavedItemToPostCardProps>[]>([]);
  const [optimisticBookmarks, setOptimisticBookmarks] = useState<Record<string, boolean>>({});

  const utils = trpc.useUtils();
  const currentUserIdSaved = user?.id || "";

  const queryClientKeyUserGetBookmarked = useMemo(() => ({
    id: currentUserIdSaved,
    limit: 10 // Ensure this matches the limit used in useInfiniteQuery
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
    { id: currentUserIdSaved, limit: 10 }, // Parameters for the query
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
        utils.project.getAll.invalidate({ limit: 15, id_user: user.id });
      }
    },
  });

  useEffect(() => {
    if (data?.pages) {
      const transformedPosts = data.pages
        .flatMap(page => page.items as BookmarkType[]) // Casting to BookmarkType
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

  const handleUnbookmark = (projectId: string) => {
    if (!user) return;
    setOptimisticBookmarks((prev) => ({ ...prev, [projectId]: false }));
    unbookmarkMutation.mutate(
      { id_user: user.id, id_project: projectId }
    );
  };

  const handleToggleLikeDisabled = () => {
    // This button would ideally be disabled or not fully functional
    // if like status isn't available for saved items.
  };

  if (!isUserLoaded) {
    return (
        <> <Sidebar activeItem="Saved" /> <PageContainer title="Saved Projects"> <div className="space-y-4"> {Array.from({ length: 3 }).map((_, index) => ( <PostSkeleton key={`initial-skeleton-${index}`} /> ))} </div> </PageContainer> </>
    );
  }

  if (!user) {
    useEffect(() => {
        redirect("/sign-in");
    }, [user]);
    return (
        <> <Sidebar activeItem="Saved" /> <PageContainer title="Saved Projects"> <div className="flex items-center justify-center h-64"> <p className="text-muted-foreground">Please sign in to view your saved projects.</p> </div> </PageContainer> </>
    );
  }

  if (isError) {
    return (
      <> <Sidebar activeItem="Saved" /> <PageContainer title="Saved Projects"> <div className="flex items-center justify-center h-64"> <div className="text-center"> <h3 className="text-lg font-semibold text-red-500 mb-2">Error Loading Saved Projects</h3> <p className="text-muted-foreground"> {error?.message || 'Failed to load saved projects. Please try again later.'} </p> </div> </div> </PageContainer> </>
    );
  }

  const trulySavedPosts = allPosts.filter(post => post.isBookmarked);

  return (
    <>
      <Sidebar activeItem="Saved projects" />
      <PageContainer title="Saved Projects">
        <div className={`overflow-hidden ${isMobile ? 'bg-background' : ''}`}>
          
          {isLoading && trulySavedPosts.length === 0 && (
            <div className="space-y-4 p-4 md:p-0">
              {Array.from({ length: 3 }).map((_, index) => (
                <PostSkeleton key={`loading-skeleton-${index}`} />
              ))}
            </div>
          )}
          
          {trulySavedPosts.length > 0 && trulySavedPosts.map((post) => (
            <div key={post.id} className={`${isMobile ? '' : 'bg-card rounded-3xl border border-white/10 mb-4'}`}>
              <PostCard
                {...post}
                onToggleBookmark={() => handleUnbookmark(post.id)}
                onToggleLike={handleToggleLikeDisabled} // Like functionality is limited here
              />
            </div>
          ))}
          
          {isFetchingNextPage && (
            <div className="space-y-4 p-4 md:p-0">
              {Array.from({ length: 2 }).map((_, index) => (
                <PostSkeleton key={`loading-more-${index}`} />
              ))}
            </div>
          )}
          
          {!hasNextPage && !isLoading && trulySavedPosts.length > 0 && !isFetchingNextPage && ( // Added !isFetchingNextPage
            <div className="text-center py-8">
              <p className="text-muted-foreground">No more saved projects</p>
            </div>
          )}
          
          {!isLoading && !isFetchingNextPage && trulySavedPosts.length === 0 && (
            <div className="text-center py-16">
              <h3 className="text-lg font-semibold mb-2">No Saved Projects</h3>
              <p className="text-muted-foreground">You haven't bookmarked any projects yet.</p>
            </div>
          )}
        </div>
      </PageContainer>

      <FloatingActionButton onClick={handleFabClick} />
    </>
  );
}