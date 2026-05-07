// feeds/page.tsx
"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { PostComposer } from "@/components/home/organisms/post-composer";
import { PostCard } from "@/components/home/organisms/post-card";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/ui/page-container";
import { ProjectCardSkeleton } from "@/components/project/project-card-skeleton";
import { AuthPromptDialog } from "@/components/ui/auth-prompt-dialog";
import { useState, useEffect, useCallback, useMemo } from "react";
import { trpc } from "@/app/_trpc/client";
import { ProjectOneType } from "@/lib/type";
import { useUser } from "@clerk/nextjs";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { transformProjectToPost } from "@/lib/project-utils";


export default function HomePage() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const isMobile = useIsMobile(690);
  const [allPosts, setAllPosts] = useState<
    ReturnType<typeof transformProjectToPost>[]
  >([]);
  const [optimisticBookmarks, setOptimisticBookmarks] = useState<
    Record<string, boolean>
  >({});
  const [optimisticLikes, setOptimisticLikes] = useState<
    Record<string, boolean>
  >({});

  // Auth-prompt dialog state (for guests)
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authDialogMessage, setAuthDialogMessage] = useState<
    string | undefined
  >(undefined);

  const utils = trpc.useUtils();

  const queryClientKeyProjectGetAll = useMemo(
    () => ({
      limit: 15,
    }),
    [],
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingPosts,
    isError,
    error,
  } = trpc.project.getAll.useInfiniteQuery(queryClientKeyProjectGetAll, {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    // Guests can browse feeds — no auth required
    enabled: isUserLoaded,
    staleTime: 60 * 1000, // Cache duration: 1 minute
    refetchOnWindowFocus: false,
  });

  const bookmarkMutation = trpc.bookmark.create.useMutation({
    onMutate: async (variables) => {
      await utils.project.getAll.cancel(queryClientKeyProjectGetAll);
      const previousQueryData = utils.project.getAll.getInfiniteData(
        queryClientKeyProjectGetAll,
      );
      utils.project.getAll.setInfiniteData(
        queryClientKeyProjectGetAll,
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              projects: page.projects.map((p: ProjectOneType) =>
                p.id === variables.id_project
                  ? { ...p, is_bookmarked: true }
                  : p,
              ),
            })),
          };
        },
      );
      return { previousQueryData };
    },
    onError: (err, variables, context) => {
      setOptimisticBookmarks((prev) => ({
        ...prev,
        [variables.id_project]: false,
      }));
      if (context?.previousQueryData) {
        utils.project.getAll.setInfiniteData(
          queryClientKeyProjectGetAll,
          context.previousQueryData,
        );
      }
    },
    onSettled: () => {
      utils.project.getAll.invalidate(queryClientKeyProjectGetAll);
      if (user?.id) {
        utils.user.getBookmarked.invalidate({ id: user.id });
      }
    },
  });

  const unbookmarkMutation = trpc.bookmark.delete.useMutation({
    onMutate: async (variables) => {
      await utils.project.getAll.cancel(queryClientKeyProjectGetAll);
      const previousQueryData = utils.project.getAll.getInfiniteData(
        queryClientKeyProjectGetAll,
      );
      utils.project.getAll.setInfiniteData(
        queryClientKeyProjectGetAll,
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              projects: page.projects.map((p: ProjectOneType) =>
                p.id === variables.id_project
                  ? { ...p, is_bookmarked: false }
                  : p,
              ),
            })),
          };
        },
      );
      return { previousQueryData };
    },
    onError: (err, variables, context) => {
      setOptimisticBookmarks((prev) => ({
        ...prev,
        [variables.id_project]: true,
      }));
      if (context?.previousQueryData) {
        utils.project.getAll.setInfiniteData(
          queryClientKeyProjectGetAll,
          context.previousQueryData,
        );
      }
    },
    onSettled: () => {
      utils.project.getAll.invalidate(queryClientKeyProjectGetAll);
      if (user?.id) {
        utils.user.getBookmarked.invalidate({ id: user.id });
      }
    },
  });

  const likeMutation = trpc.likeProject.like.useMutation({
    onMutate: async (variables) => {
      await utils.project.getAll.cancel(queryClientKeyProjectGetAll);
      const previousQueryData = utils.project.getAll.getInfiniteData(
        queryClientKeyProjectGetAll,
      );
      utils.project.getAll.setInfiniteData(
        queryClientKeyProjectGetAll,
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              projects: page.projects.map((p: ProjectOneType) =>
                p.id === variables.id_project
                  ? {
                      ...p,
                      is_liked: true,
                      count_likes: (p.count_likes || 0) + 1,
                    }
                  : p,
              ),
            })),
          };
        },
      );
      return { previousQueryData };
    },
    onError: (err, variables, context) => {
      if (err.data?.code === "CONFLICT") {
        setOptimisticLikes((prev) => ({
          ...prev,
          [variables.id_project]: true,
        }));
        utils.project.getAll.setInfiniteData(
          queryClientKeyProjectGetAll,
          (oldData) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                projects: page.projects.map(
                  (p: ProjectOneType) =>
                    p.id === variables.id_project
                      ? { ...p, is_liked: true, count_likes: p.count_likes }
                      : p,
                ),
              })),
            };
          },
        );
      } else {
        setOptimisticLikes((prev) => ({
          ...prev,
          [variables.id_project]: false,
        }));
        if (context?.previousQueryData) {
          utils.project.getAll.setInfiniteData(
            queryClientKeyProjectGetAll,
            context.previousQueryData,
          );
        }
      }
    },
    onSettled: () => {
      utils.project.getAll.invalidate(queryClientKeyProjectGetAll);
    },
  });

  const unlikeMutation = trpc.likeProject.unlike.useMutation({
    onMutate: async (variables) => {
      await utils.project.getAll.cancel(queryClientKeyProjectGetAll);
      const previousQueryData = utils.project.getAll.getInfiniteData(
        queryClientKeyProjectGetAll,
      );
      utils.project.getAll.setInfiniteData(
        queryClientKeyProjectGetAll,
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              projects: page.projects.map((p: ProjectOneType) =>
                p.id === variables.id_project
                  ? {
                      ...p,
                      is_liked: false,
                      count_likes: Math.max(0, (p.count_likes || 0) - 1),
                    }
                  : p,
              ),
            })),
          };
        },
      );
      return { previousQueryData };
    },
    onError: (err, variables, context) => {
      if (err.data?.code === "NOT_FOUND") {
        setOptimisticLikes((prev) => ({
          ...prev,
          [variables.id_project]: false,
        }));
        utils.project.getAll.setInfiniteData(
          queryClientKeyProjectGetAll,
          (oldData) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                projects: page.projects.map(
                  (p: ProjectOneType) =>
                    p.id === variables.id_project
                      ? { ...p, is_liked: false, count_likes: p.count_likes }
                      : p,
                ),
              })),
            };
          },
        );
      } else {
        setOptimisticLikes((prev) => ({
          ...prev,
          [variables.id_project]: true,
        }));
        if (context?.previousQueryData) {
          utils.project.getAll.setInfiniteData(
            queryClientKeyProjectGetAll,
            context.previousQueryData,
          );
        }
      }
    },
    onSettled: () => {
      utils.project.getAll.invalidate(queryClientKeyProjectGetAll);
    },
  });

  useEffect(() => {
    if (data?.pages) {
      const transformedPosts = data.pages
        .flatMap((page) => page.projects as ProjectOneType[])
        .map((project) =>
          transformProjectToPost(project, optimisticLikes, optimisticBookmarks),
        );
      setAllPosts(transformedPosts);
    }
  }, [data, optimisticLikes, optimisticBookmarks]);


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
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);


  /** Show the auth-prompt dialog with an optional contextual message. */
  const showAuthPrompt = useCallback((message?: string) => {
    setAuthDialogMessage(message);
    setAuthDialogOpen(true);
  }, []);

  const handleToggleBookmark = (
    projectId: string,
    currentIsBookmarked: boolean,
  ) => {
    if (!user) {
      showAuthPrompt("Sign in to save projects to your personal collection.");
      return;
    }
    setOptimisticBookmarks((prev) => ({
      ...prev,
      [projectId]: !currentIsBookmarked,
    }));
    if (currentIsBookmarked) {
      unbookmarkMutation.mutate({ id_user: user.id, id_project: projectId });
    } else {
      bookmarkMutation.mutate({ id_user: user.id, id_project: projectId });
    }
  };

  const handleToggleLike = (projectId: string, currentIsLiked: boolean) => {
    if (!user) {
      showAuthPrompt("Sign in to like projects and show your appreciation.");
      return;
    }
    setOptimisticLikes((prev) => ({ ...prev, [projectId]: !currentIsLiked }));
    if (currentIsLiked) {
      unlikeMutation.mutate({ id_user: user.id, id_project: projectId });
    } else {
      likeMutation.mutate({ id_user: user.id, id_project: projectId });
    }
  };

  if (!isUserLoaded) {
    return (
      <>
        <Sidebar activeItem="Home" />
        <PageContainer title="Home">
          <div className="space-y-4">
            <ProjectCardSkeleton />
            <ProjectCardSkeleton />
            <ProjectCardSkeleton />
          </div>
        </PageContainer>
      </>
    );
  }

  if (isError) {
    const isDbError = error?.message?.toLowerCase().includes("prisma") || error?.message?.toLowerCase().includes("database");
    
    return (
      <>
        <Sidebar activeItem="Home" />
        <PageContainer title="Home">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="bg-red-500/10 p-6 rounded-full mb-6">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-red-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {isDbError ? "Connection Interrupted" : "Error Loading Posts"}
            </h3>
            <p className="text-muted-foreground mb-8 max-w-md">
              {isDbError 
                ? "We're having trouble reaching the database right now. This is usually temporary."
                : (error?.message || "Something went wrong while fetching the latest projects.")}
            </p>
            <Button 
              onClick={() => utils.project.getAll.invalidate()}
              className="px-8 py-2.5 bg-primary hover:bg-primary-foreground transition-all duration-200"
            >
              Try Again
            </Button>
          </div>
        </PageContainer>
      </>
    );
  }

  return (
    <>
      <Sidebar activeItem="Home" />
      <PageContainer title="Home">
        <div
          className={`overflow-hidden ${isMobile ? "bg-background" : "bg-card rounded-3xl border border-white/10"}`}
        >
          {!isMobile && (
            <PostComposer
              avatarSrc={user?.imageUrl || "/img/dummy/avatar-dummy.jpg"}
              username={user?.fullName || user?.username || "Guest"}
              className="border-b border-white/10"
            />
          )}

          {isLoadingPosts && allPosts.length === 0 && (
            <div className="space-y-4 p-1">
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
            </div>
          )}

          {allPosts.map((post) => (
            <div key={post.id} className="border-b border-white/10 p-1">
              <PostCard
                data={post}
                onToggleBookmark={() =>
                  handleToggleBookmark(post.id, post.is_bookmarked ?? false)
                }
                onToggleLike={() =>
                  handleToggleLike(post.id, post.is_liked ?? false)
                }
              />
            </div>
          ))}

          {isFetchingNextPage && (
            <div className="p-1">
              <ProjectCardSkeleton />
            </div>
          )}

          {!hasNextPage && allPosts.length > 0 && !isFetchingNextPage && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                You&#39;ve reached the end of the feed
              </p>
            </div>
          )}

          {!isLoadingPosts &&
            !isFetchingNextPage &&
            allPosts.length === 0 &&
            hasNextPage !== false && (
              <div className="text-center py-16">
                <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                <p className="text-muted-foreground">
                  {user
                    ? "Be the first to share a project!"
                    : "Browse projects or sign in to interact."}
                </p>
              </div>
            )}
        </div>
      </PageContainer>

      <FloatingActionButton />

      {/* Auth-prompt dialog — shown when guests attempt write actions */}
      <AuthPromptDialog
        isOpen={authDialogOpen}
        onClose={() => setAuthDialogOpen(false)}
        message={authDialogMessage}
      />
    </>
  );
}
