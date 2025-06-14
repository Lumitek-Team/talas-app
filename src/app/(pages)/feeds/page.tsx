// feeds/page.tsx
"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { PostComposer } from "@/components/home/organisms/post-composer";
import { PostCard } from "@/components/home/organisms/post-card";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { PageContainer } from "@/components/ui/page-container";
import { useState, useEffect, useCallback, useMemo } from "react";
import { trpc } from "@/app/_trpc/client";
import { ProjectOneType } from "@/lib/type";
import { PostSkeleton } from '@/components/project/skeleton';
import { useUser } from "@clerk/nextjs";
import { getPublicUrl } from "@/lib/utils";

// Transform backend data to PostCard props
const transformProjectToPost = (
  project: ProjectOneType,
  optimisticLikes: Record<string, boolean>,
  optimisticBookmarks: Record<string, boolean>
) => {
  const primaryUser = project.project_user && project.project_user[0]?.user;

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

  const isLiked = optimisticLikes[project.id] !== undefined
    ? optimisticLikes[project.id]
    : project.is_liked;

  const isBookmarked = optimisticBookmarks[project.id] !== undefined
    ? optimisticBookmarks[project.id]
    : project.is_bookmarked;

  return {
    id: project.id,
    slug: project.slug,
    title: project.title,
    username: primaryUser?.username || 'Unknown User',
    userRole: 'Developer',
    avatarSrc: resolvedAvatarSrc,
    timestamp: project.created_at, // MODIFIED: Pass the raw date string
    content: project.content,
    image1: project.image1 ? getPublicUrl(project.image1) : undefined,
    image2: project.image2 ? getPublicUrl(project.image2) : undefined,
    image3: project.image3 ? getPublicUrl(project.image3) : undefined,
    image4: project.image4 ? getPublicUrl(project.image4) : undefined,
    image5: project.image5 ? getPublicUrl(project.image5) : undefined,
    likes: project.count_likes,
    comments: project.count_comments,
    link_figma: project.link_figma,
    link_github: project.link_github,
    category: project.category,
    isLiked: !!isLiked,
    isBookmarked: !!isBookmarked,
  };
};

export default function HomePage() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const [isMobile, setIsMobile] = useState(false);
  const [allPosts, setAllPosts] = useState<ReturnType<typeof transformProjectToPost>[]>([]);
  const [optimisticBookmarks, setOptimisticBookmarks] = useState<Record<string, boolean>>({});
  const [optimisticLikes, setOptimisticLikes] = useState<Record<string, boolean>>({});

  const utils = trpc.useUtils();
  const currentUserIdFeeds = user?.id || "";
  const queryClientKeyProjectGetAll = useMemo(() => ({
    limit: 15,
    id_user: currentUserIdFeeds
  }), [currentUserIdFeeds]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingPosts,
    isError,
    error,
  } = trpc.project.getAll.useInfiniteQuery(
    queryClientKeyProjectGetAll,
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: !!user && isUserLoaded,
      refetchOnWindowFocus: false,
    }
  );

  const bookmarkMutation = trpc.bookmark.create.useMutation({
    onMutate: async (variables) => {
      await utils.project.getAll.cancel(queryClientKeyProjectGetAll);
      const previousQueryData = utils.project.getAll.getInfiniteData(queryClientKeyProjectGetAll);
      utils.project.getAll.setInfiniteData(queryClientKeyProjectGetAll, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map(page => ({
            ...page,
            projects: page.projects.map((p: ProjectOneType) =>
              p.id === variables.id_project ? { ...p, is_bookmarked: true } : p
            ),
          })),
        };
      });
      return { previousQueryData };
    },
    onError: (err, variables, context) => {
      setOptimisticBookmarks((prev) => ({ ...prev, [variables.id_project]: false }));
      if (context?.previousQueryData) {
        utils.project.getAll.setInfiniteData(queryClientKeyProjectGetAll, context.previousQueryData);
      }
    },
    onSettled: (data, error, variables) => {
      utils.project.getAll.invalidate(queryClientKeyProjectGetAll);
      if (user?.id) {
        utils.user.getBookmarked.invalidate({ id: user.id });
      }
    },
  });

  const unbookmarkMutation = trpc.bookmark.delete.useMutation({
    onMutate: async (variables) => {
      await utils.project.getAll.cancel(queryClientKeyProjectGetAll);
      const previousQueryData = utils.project.getAll.getInfiniteData(queryClientKeyProjectGetAll);
      utils.project.getAll.setInfiniteData(queryClientKeyProjectGetAll, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map(page => ({
            ...page,
            projects: page.projects.map((p: ProjectOneType) =>
              p.id === variables.id_project ? { ...p, is_bookmarked: false } : p
            ),
          })),
        };
      });
      return { previousQueryData };
    },
    onError: (err, variables, context) => {
      setOptimisticBookmarks((prev) => ({ ...prev, [variables.id_project]: true }));
      if (context?.previousQueryData) {
        utils.project.getAll.setInfiniteData(queryClientKeyProjectGetAll, context.previousQueryData);
      }
    },
    onSettled: (data, error, variables) => {
      utils.project.getAll.invalidate(queryClientKeyProjectGetAll);
      if (user?.id) {
        utils.user.getBookmarked.invalidate({ id: user.id });
      }
    },
  });

  const likeMutation = trpc.likeProject.like.useMutation({
    onMutate: async (variables) => {
      await utils.project.getAll.cancel(queryClientKeyProjectGetAll);
      const previousQueryData = utils.project.getAll.getInfiniteData(queryClientKeyProjectGetAll);
      utils.project.getAll.setInfiniteData(queryClientKeyProjectGetAll, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map(page => ({
            ...page,
            projects: page.projects.map((p: ProjectOneType) =>
              p.id === variables.id_project ? { ...p, is_liked: true, count_likes: (p.count_likes || 0) + 1 } : p
            ),
          })),
        };
      });
      return { previousQueryData };
    },
    onError: (err, variables, context) => {
      // If the error is a CONFLICT, it means the post was already liked.
      // Set optimistic state to true (liked).
      if (err.data?.code === 'CONFLICT') {
        setOptimisticLikes((prev) => ({ ...prev, [variables.id_project]: true }));
        // Update the count if possible, or rely on onSettled to refetch
        utils.project.getAll.setInfiniteData(queryClientKeyProjectGetAll, (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map(page => ({
              ...page,
              projects: page.projects.map((p: ProjectOneType) =>
                p.id === variables.id_project ? { ...p, is_liked: true, count_likes: p.count_likes } : p // Ensure count isn't wrongly decremented
              ),
            })),
          };
        });
      } else {
        // For other errors, revert to previous state (not liked)
        setOptimisticLikes((prev) => ({ ...prev, [variables.id_project]: false }));
        if (context?.previousQueryData) {
          utils.project.getAll.setInfiniteData(queryClientKeyProjectGetAll, context.previousQueryData);
        }
      }
    },
    onSettled: (data, error, variables) => {
      utils.project.getAll.invalidate(queryClientKeyProjectGetAll);
    },
  });

  const unlikeMutation = trpc.likeProject.unlike.useMutation({
    onMutate: async (variables) => {
      await utils.project.getAll.cancel(queryClientKeyProjectGetAll);
      const previousQueryData = utils.project.getAll.getInfiniteData(queryClientKeyProjectGetAll);
      utils.project.getAll.setInfiniteData(queryClientKeyProjectGetAll, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map(page => ({
            ...page,
            projects: page.projects.map((p: ProjectOneType) =>
              p.id === variables.id_project ? { ...p, is_liked: false, count_likes: Math.max(0, (p.count_likes || 0) - 1) } : p
            ),
          })),
        };
      });
      return { previousQueryData };
    },
    onError: (err, variables, context) => {
      // If the error is NOT_FOUND, it means the post was already not liked.
      // Set optimistic state to false (not liked).
      if (err.data?.code === 'NOT_FOUND') {
        setOptimisticLikes((prev) => ({ ...prev, [variables.id_project]: false }));
        // Update the count if possible, or rely on onSettled to refetch
        utils.project.getAll.setInfiniteData(queryClientKeyProjectGetAll, (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map(page => ({
              ...page,
              projects: page.projects.map((p: ProjectOneType) =>
                p.id === variables.id_project ? { ...p, is_liked: false, count_likes: p.count_likes } : p // Ensure count isn't wrongly incremented
              ),
            })),
          };
        });
      } else {
        // For other errors, revert to previous state (liked)
        setOptimisticLikes((prev) => ({ ...prev, [variables.id_project]: true }));
        if (context?.previousQueryData) {
          utils.project.getAll.setInfiniteData(queryClientKeyProjectGetAll, context.previousQueryData);
        }
      }
    },
    onSettled: (data, error, variables) => {
      utils.project.getAll.invalidate(queryClientKeyProjectGetAll);
    },
  });

  useEffect(() => {
    if (data?.pages) {
      const transformedPosts = data.pages
        .flatMap(page => page.projects as ProjectOneType[])
        .map(project => transformProjectToPost(project, optimisticLikes, optimisticBookmarks));
      setAllPosts(transformedPosts);
    }
  }, [data, optimisticLikes, optimisticBookmarks]);

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

  const handleNewPost = (content: string) => {
    alert("New post created (mock): " + content);
  };

  const handleToggleBookmark = (projectId: string, currentIsBookmarked: boolean) => {
    if (!user) return;
    setOptimisticBookmarks((prev) => ({ ...prev, [projectId]: !currentIsBookmarked }));
    if (currentIsBookmarked) {
      unbookmarkMutation.mutate({ id_user: user.id, id_project: projectId });
    } else {
      bookmarkMutation.mutate({ id_user: user.id, id_project: projectId });
    }
  };

  const handleToggleLike = (projectId: string, currentIsLiked: boolean) => {
    if (!user) return;
    setOptimisticLikes((prev) => ({ ...prev, [projectId]: !currentIsLiked }));
    if (currentIsLiked) {
      unlikeMutation.mutate({ id_user: user.id, id_project: projectId });
    } else {
      likeMutation.mutate({ id_user: user.id, id_project: projectId });
    }
  };

  if (!isUserLoaded) { // Simplified initial loading check
    return (
      <> <Sidebar activeItem="Home" /> <PageContainer title="Home"> <div className="space-y-4 p-4 md:p-0"> {Array.from({ length: 3 }).map((_, index) => (<PostSkeleton key={`initial-skeleton-${index}`} />))} </div> </PageContainer> </>
    );
  }

  if (!user && isUserLoaded) {
    return (
      <> <Sidebar activeItem="Home" /> <PageContainer title="Home"> <div className="flex items-center justify-center h-64"> <div className="text-center"> <h3 className="text-lg font-semibold text-muted-foreground mb-2">Welcome to Feeds</h3> <p className="text-muted-foreground">Please sign in to view and interact with posts.</p> </div> </div> </PageContainer> </>
    );
  }

  if (isError) {
    return (
      <> <Sidebar activeItem="Home" /> <PageContainer title="Home"> <div className="flex items-center justify-center h-64"> <div className="text-center"> <h3 className="text-lg font-semibold text-red-500 mb-2">Error Loading Posts</h3> <p className="text-muted-foreground"> {error?.message || 'Failed to load posts. Please try again later.'} </p> </div> </div> </PageContainer> </>
    );
  }

  return (
    <>
      <Sidebar activeItem="Home" />
      <PageContainer title="Home">
        <div className={`overflow-hidden ${isMobile ? 'bg-background' : 'bg-card rounded-3xl border border-white/10'}`}>
          {!isMobile && user && (
            <PostComposer
              avatarSrc={user.imageUrl || '/img/dummy/profile-photo-dummy.jpg'}
              username={user.fullName || user.username || 'User'}
              className="border-b border-white/10"
            />
          )}

          {isLoadingPosts && allPosts.length === 0 && (
            <div className="space-y-4 p-4 md:p-0">
              {Array.from({ length: 3 }).map((_, index) => (
                <PostSkeleton key={`loading-skeleton-${index}`} />
              ))}
            </div>
          )}

          {allPosts.map((post) => (
            <div key={post.id} className="border-b border-white/10 p-1">
              <PostCard
                {...post}
                onToggleBookmark={() => handleToggleBookmark(post.id, post.isBookmarked)}
                onToggleLike={() => handleToggleLike(post.id, post.isLiked)}
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

          {!hasNextPage && allPosts.length > 0 && !isFetchingNextPage && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">You&#39;ve reached the end of the feed</p>
            </div>
          )}

          {!isLoadingPosts && !isFetchingNextPage && allPosts.length === 0 && hasNextPage !== false && (
            <div className="text-center py-16">
              <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
              <p className="text-muted-foreground">
                {user ? "Be the first to share a project!" : "Sign in to see the feed."}
              </p>
            </div>
          )}
        </div>
      </PageContainer>

      <FloatingActionButton onClick={handleFabClick} />
    </>
  );
}