"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { Sidebar } from "@/components/layout/sidebar";
import { PageContainer } from "@/components/ui/page-container";
import { SearchInput } from "@/components/search/search-input";
import { FilterButton } from "@/components/search/filter-button";
import { CategorySelect } from "@/components/search/category-select";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { trpc } from "@/app/_trpc/client";
import { useUser } from "@clerk/nextjs";
import { cn, getPublicUrl } from "@/lib/utils";
import { ProjectOneType } from "@/lib/type";
import { PostCard } from "@/components/home/organisms/post-card";
import { PostSkeleton } from "@/components/project/skeleton";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";

type FilterType = "Project" | "Profile" | "Category";
type BackendFilterType = "PROJECT" | "USER" | "CATEGORY";

const formSchema = z.object({
  query: z.string().max(50).optional(),
  type: z.enum(['PROJECT', 'USER', 'CATEGORY']),
  category: z.string().nullish(),
});

const transformProjectToPost = (
  project: ProjectOneType,
  optimisticLikes: Record<string, boolean>,
  optimisticBookmarks: Record<string, boolean>
) => {
  const primaryUser = project.project_user && project.project_user[0]?.user;
  let resolvedAvatarSrc = primaryUser?.photo_profile ? getPublicUrl(primaryUser.photo_profile) : '/img/dummy/profile-photo-dummy.jpg';
  const isLiked = optimisticLikes[project.id] !== undefined ? optimisticLikes[project.id] : project.is_liked;
  const isBookmarked = optimisticBookmarks[project.id] !== undefined ? optimisticBookmarks[project.id] : project.is_bookmarked;
  return {
    id: project.id, slug: project.slug, title: project.title, username: primaryUser?.username || 'Unknown User', userRole: 'Developer', avatarSrc: resolvedAvatarSrc, timestamp: project.created_at, content: project.content,
    image1: project.image1 ? getPublicUrl(project.image1) : undefined, image2: project.image2 ? getPublicUrl(project.image2) : undefined, image3: project.image3 ? getPublicUrl(project.image3) : undefined, image4: project.image4 ? getPublicUrl(project.image4) : undefined, image5: project.image5 ? getPublicUrl(project.image5) : undefined,
    likes: project.count_likes, comments: project.count_comments, link_figma: project.link_figma, link_github: project.link_github, category: project.category, isLiked: !!isLiked, isBookmarked: !!isBookmarked,
  };
};

const ProfileAvatar = ({ src, alt, fallback }: { src?: string; alt?: string; fallback: string }) => {
  const [imageError, setImageError] = useState(false);
  const approvedHosts = ['img.clerk.com', 'your-supabase-hostname.co', 'lh3.googleusercontent.com', 'avatars.githubusercontent.com'];
  let useNextImage = false;
  if (src) {
    try {
      const url = new URL(src);
      if (approvedHosts.includes(url.hostname)) useNextImage = true;
    } catch (e) {
      useNextImage = true;
    }
  }
  return (
    <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-700 flex items-center justify-center flex-shrink-0">
      {src && !imageError ? (
        useNextImage ? (
          <Image src={src} alt={alt || "Avatar"} width={48} height={48} className="w-full h-full object-cover" onError={() => setImageError(true)} />
        ) : (
          <img src={src} alt={alt || "Avatar"} width={48} height={48} className="w-full h-full object-cover" onError={() => setImageError(true)} />
        )
      ) : (
        <span className="text-neutral-200 font-medium text-sm">{fallback}</span>
      )}
    </div>
  );
};

const CategoryProjectsView = ({ category, onBack, queryResult, handleToggleLike, handleToggleBookmark, optimisticLikes, optimisticBookmarks }: any) => {
  const { data, isLoading, isError, error, isFetchingNextPage, hasNextPage, fetchNextPage } = queryResult;
  const projects = useMemo(() => data?.pages.flatMap((page: any) => page.data) || [], [data]);
  const handleScroll = useCallback(() => {
    if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 200 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);
  return (
    <div>
      <div className="flex items-center justify-between p-4 border-b border-neutral-700/50">
        <button
          onClick={onBack}
          className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-700/30 hover:text-neutral-200"
          aria-label="Back to search results"
        >
          <ArrowLeftIcon className="h-5 w-5 cursor-pointer" />
        </button>
        <h3 className="flex-grow text-center text-l font-bold">
          <span className="text-primary">{category.title}</span>
        </h3>
        <div className="h-8 w-8" />
      </div>
      {isLoading && Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={`cat-view-skeleton-${i}`} />)}
      {isError && <div className="text-center py-8"><p className="text-red-400">Error: {error.message}</p></div>}
      {!isLoading && !isError && projects.length === 0 && (
        <div className="text-center py-8"><p className="text-muted-foreground">No projects found in this category.</p></div>
      )}
      <div>
        {projects.map((project: ProjectOneType) => {
            const post = transformProjectToPost(project, optimisticLikes, optimisticBookmarks);
            return (
                <div key={post.id} className="border-b border-white/10 last:border-b-0 p-1">
                    <PostCard {...post} onToggleBookmark={() => handleToggleBookmark(post.id, post.isBookmarked)} onToggleLike={() => handleToggleLike(post.id, post.isLiked)} />
                  </div>
            )
        })}
      </div>
      {isFetchingNextPage && <PostSkeleton />}
    </div>
  );
};


export default function SearchPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("Project");
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoaded } = useUser();
  const [viewingCategory, setViewingCategory] = useState<{ slug: string; title: string } | null>(null);
  const initialQuery = searchParams.get("query") || "";
  const initialType = (searchParams.get("type") || "PROJECT") as BackendFilterType;
  const initialCategory = searchParams.get("category") || "";
  const [committedValues, setCommittedValues] = useState<z.infer<typeof formSchema>>({
    type: initialType, query: initialQuery, category: initialCategory
  });
  const [optimisticBookmarks, setOptimisticBookmarks] = useState<Record<string, boolean>>({});
  const [optimisticLikes, setOptimisticLikes] = useState<Record<string, boolean>>({});
  const [displayablePosts, setDisplayablePosts] = useState<ReturnType<typeof transformProjectToPost>[]>([]);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { type: initialType, query: initialQuery, category: initialCategory }
  });
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const formValues = form.watch();
  const { data: categoryResponse, isLoading: isCategoryLoading } = trpc.category.getAll.useQuery(undefined);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 690);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  useEffect(() => {
    if (!viewingCategory) {
        const typeToFilter: Record<BackendFilterType, FilterType> = { "PROJECT": "Project", "USER": "Profile", "CATEGORY": "Category" };
        setActiveFilter(typeToFilter[formValues.type] || "Project");
    }
  }, [formValues.type, viewingCategory]);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const hasChanged = formValues.query !== committedValues.query || formValues.type !== committedValues.type || (formValues.category || "") !== (committedValues.category || "");
      if (hasChanged) {
        setCommittedValues({ type: formValues.type, query: formValues.query || "", category: formValues.category || "" });
        const params = new URLSearchParams();
        if (formValues.query) params.set("query", formValues.query);
        params.set("type", formValues.type);
        if (formValues.category && formValues.type === "PROJECT") params.set("category", formValues.category);
        router.replace(`?${params.toString()}`, { scroll: false });
      }
    }, 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) };
  }, [formValues, committedValues, router]);
  
  const queryInput = useMemo(() => {
    if (viewingCategory) {
      return { limit: 10, id_user: user?.id || "", type: 'PROJECT' as BackendFilterType, search: '__all__', category: viewingCategory.slug };
    }
    return { limit: 10, id_user: user?.id || "", type: committedValues.type, search: committedValues.query || undefined, category: committedValues.category || undefined };
  }, [viewingCategory, committedValues, user?.id]);

  const searchQuery = trpc.search.search.useInfiniteQuery(
    queryInput, {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: !!user?.id && ( !!viewingCategory || (!!committedValues.query && committedValues.query.trim().length > 0) ),
      refetchOnWindowFocus: false,
    }
  );

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch, error: searchError } = searchQuery;
  
  useEffect(() => {
    const projects = data?.pages.flatMap(page => page.data as ProjectOneType[]) || [];
    if (projects.length > 0 && (queryInput.type === 'PROJECT')) {
        const transformed = projects.map(project => transformProjectToPost(project, optimisticLikes, optimisticBookmarks));
        setDisplayablePosts(transformed);
    } else {
        setDisplayablePosts([]);
    }
  }, [data, queryInput.type, optimisticLikes, optimisticBookmarks]);
  
  const allRawResults = useMemo(() => data?.pages.flatMap(page => page.data || []) || [], [data]);
  
  // FUNCTIONALITY FIX: Add trpc utils and mutations from feeds page
  const utils = trpc.useUtils();

  const updateCache = (projectId: string, updates: Partial<ProjectOneType>) => {
    utils.search.search.setInfiniteData(queryInput, (oldData) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        pages: oldData.pages.map(page => ({
          ...page,
          data: page.data.map((p: any) =>
            p.id === projectId ? { ...p, ...updates } : p
          ),
        })),
      };
    });
  };

  const bookmarkMutation = trpc.bookmark.create.useMutation({
    onSuccess: () => refetch(),
  });
  
  const unbookmarkMutation = trpc.bookmark.delete.useMutation({
    onSuccess: () => refetch(),
  });
  
  const likeMutation = trpc.likeProject.like.useMutation({
    onSuccess: () => refetch(),
  });
  
  const unlikeMutation = trpc.likeProject.unlike.useMutation({
    onSuccess: () => refetch(),
  });
  
  // FUNCTIONALITY FIX: Implement the logic for the handlers
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

  const handleCreateProjectClick = () => router.push("/project/create");
  if (!isLoaded) { /* ... */ }
  if (!user) { /* ... */ }
  const showInitialPrompt = !committedValues.query || (committedValues.query.trim().length === 0);

  return (
    <>
      <Sidebar activeItem="Search" />
      <PageContainer title="Search">
        <div className={`overflow-hidden ${isMobile ? "bg-background" : "bg-card rounded-3xl border border-neutral-700/50"}`}>
          <div className={cn("p-4 border-b border-neutral-700/50", { 'hidden': !!viewingCategory })}>
              <SearchInput value={formValues.query || ''} onChange={(e) => form.setValue("query", e.target.value)} placeholder="Search projects, profiles, or categories..." />
              <div className="flex flex-col gap-y-3 sm:flex-row sm:items-center sm:justify-between mt-4">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-3">
                  <FilterButton label="Project" isActive={activeFilter === "Project"} onClick={() => form.setValue("type", "PROJECT")} />
                  <FilterButton label="Profile" isActive={activeFilter === "Profile"} onClick={() => form.setValue("type", "USER")} />
                  <FilterButton label="Category" isActive={activeFilter === "Category"} onClick={() => form.setValue("type", "CATEGORY")} />
                </div>
                {activeFilter === "Project" && (
                  <div className="w-full sm:w-auto sm:min-w-[200px] md:min-w-[220px]">
                    <CategorySelect categories={categoryResponse || []} value={formValues.category || ""} onChange={(e) => form.setValue("category", e.target.value)} disabled={isCategoryLoading} />
                  </div>
                )}
              </div>
          </div>
          <div className="min-h-[400px]">
            {viewingCategory ? (
                <CategoryProjectsView
                    category={viewingCategory}
                    onBack={() => setViewingCategory(null)}
                    queryResult={searchQuery}
                    handleToggleLike={handleToggleLike}
                    handleToggleBookmark={handleToggleBookmark}
                    optimisticLikes={optimisticLikes}
                    optimisticBookmarks={optimisticBookmarks}
                />
            ) : (
              <div>
                {showInitialPrompt ? <p className="text-neutral-400 p-4">Type a keyword to find: <span className="font-semibold text-neutral-200">{activeFilter}</span></p>
                  : isLoading ? <>{Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={`search-skeleton-${i}`} />)}</>
                  : searchError ? <div className="text-center py-8"><p className="text-red-400">Error: {searchError.message}</p></div>
                  : allRawResults.length === 0 ? <div className="text-center py-8"><p className="text-muted-foreground">No results found for "{committedValues.query}"</p></div>
                  : (
                    <div>
                      <p className="text-neutral-400 p-4">Showing results for: <span className="font-semibold text-neutral-200">"{committedValues.query}"</span></p>
                      
                      {activeFilter === 'Project' && committedValues.type === 'PROJECT' && displayablePosts.filter(Boolean).map(post => (
                          <div key={`project-${post.id}`} className="border-b border-white/10 last:border-b-0 p-1">
                              <PostCard {...post} onToggleBookmark={() => handleToggleBookmark(post.id, post.isBookmarked)} onToggleLike={() => handleToggleLike(post.id, post.isLiked)} />
                          </div>
                      ))}

                      {activeFilter === 'Profile' && committedValues.type === 'USER' && allRawResults.filter(Boolean).map((item: any) => (
                          <div key={`profile-${item.username}`} className="cursor-pointer border border-neutral-700/50 rounded-lg p-4 m-4 hover:bg-neutral-800/30 transition-colors">
                              <div className="flex items-center gap-4">
                                  <ProfileAvatar src={item.photo_profile ? getPublicUrl(item.photo_profile) : undefined} alt={item.name || item.username} fallback={item.name?.[0]?.toUpperCase() || "U"}/>
                                  <div className="flex-1">
                                      <Link href={`/user/${item.username}`} className="font-semibold text-neutral-200 hover:text-white">{item.name || item.username}</Link>
                                      <div className="text-sm text-neutral-400">@{item.username}</div>
                                  </div>
                              </div>
                          </div>
                      ))}

                      {activeFilter === 'Category' && committedValues.type === 'CATEGORY' && allRawResults.filter(Boolean).map((item: any) => (
                        <div key={`category-${item.id}`} className="border border-neutral-700/50 rounded-lg p-4 m-4 cursor-pointer hover:bg-neutral-800/30 transition-colors">
                          <button type="button" className="w-full text-left cursor-pointer" onClick={() => setViewingCategory({ slug: item.slug, title: item.title })}>
                            <h3 className="text-lg font-semibold text-neutral-200 hover:text-white">{item.title}</h3>
                            <p className="text-sm text-neutral-500 mt-1">{item.count_projects || 0} projects</p>
                          </button>
                        </div>
                      ))}

                      {isFetchingNextPage && <PostSkeleton />}
                    </div>
                  )
                }
              </div>
            )}
          </div>
        </div>
      </PageContainer>
      <FloatingActionButton onClick={handleCreateProjectClick} />
    </>
  );
}
