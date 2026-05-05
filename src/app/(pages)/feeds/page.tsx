// feeds/page.tsx
"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { PostComposer } from "@/components/home/organisms/post-composer";
import { PostCard } from "@/components/home/organisms/post-card";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { PageContainer } from "@/components/ui/page-container";
import { LoadingSpinner } from "@/components/ui/loading";
import { AuthPromptDialog } from "@/components/ui/auth-prompt-dialog";
import { useState, useEffect, useCallback, useMemo } from "react";
import { trpc } from "@/app/_trpc/client";
import { ProjectOneType } from "@/lib/type";
import { useUser } from "@clerk/nextjs";

// Transform backend data to PostCard props
const transformProjectToPost = (
  project: ProjectOneType,
  optimisticLikes: Record<string, boolean>,
  optimisticBookmarks: Record<string, boolean>,
) => {
  const isLiked =
    optimisticLikes[project.id] !== undefined
      ? optimisticLikes[project.id]
      : project.is_liked;

  const isBookmarked =
    optimisticBookmarks[project.id] !== undefined
      ? optimisticBookmarks[project.id]
      : project.is_bookmarked;

  const transformed: ProjectOneType = {
    ...project,
    is_bookmarked: isBookmarked,
    is_liked: isLiked,
  };

  return transformed;
};

export default function HomePage() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const [isMobile, setIsMobile] = useState(false);
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
  const currentUserIdFeeds = user?.id || undefined;
  const queryClientKeyProjectGetAll = useMemo(
    () => ({
      limit: 15,
      id_user: currentUserIdFeeds,
    }),
    [currentUserIdFeeds],
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

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 690);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const handleFabClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
          <LoadingSpinner />
        </PageContainer>
      </>
    );
  }

  if (isError) {
    return (
      <>
        {" "}
        <Sidebar activeItem="Home" />{" "}
        <PageContainer title="Home">
          {" "}
          <div className="flex items-center justify-center h-64">
            {" "}
            <div className="text-center">
              {" "}
              <h3 className="text-lg font-semibold text-red-500 mb-2">
                Error Loading Posts
              </h3>{" "}
              <p className="text-muted-foreground">
                {" "}
                {error?.message ||
                  "Failed to load posts. Please try again later."}{" "}
              </p>{" "}
            </div>{" "}
          </div>{" "}
        </PageContainer>{" "}
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
          {!isMobile && user && (
            <PostComposer
              avatarSrc={user.imageUrl || "/img/dummy/profile-photo-dummy.jpg"}
              username={user.fullName || user.username || "User"}
              className="border-b border-white/10"
            />
          )}

          {isLoadingPosts && allPosts.length === 0 && <LoadingSpinner />}

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

          {isFetchingNextPage && <LoadingSpinner className="h-32" />}

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

      <FloatingActionButton onClick={handleFabClick} />

      {/* Auth-prompt dialog — shown when guests attempt write actions */}
      <AuthPromptDialog
        isOpen={authDialogOpen}
        onClose={() => setAuthDialogOpen(false)}
        message={authDialogMessage}
      />
    </>
  );
}
