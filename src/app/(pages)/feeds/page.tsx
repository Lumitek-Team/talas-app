"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { PostComposer } from "@/components/home/organisms/post-composer";
import { PostCard } from "@/components/home/organisms/post-card";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { PageContainer } from "@/components/ui/page-container";
import { useState, useEffect, useCallback } from "react";
import { trpc } from "@/app/_trpc/client";
import { useDevAuth } from "@/lib/dev-auth-context";
import { ProjectWithBookmarks } from "@/lib/type";
import { PostSkeleton } from '@/components/project/skeleton';


// Transform backend data to PostCard props
const transformProjectToPost = (project: ProjectWithBookmarks & { is_bookmarked?: boolean }) => {
  const primaryUser = project.project_user[0]?.user;
  
  return {
    id: project.id,
    slug: project.slug,
    title: project.title,
    username: primaryUser?.username || 'Unknown User',
    userRole: 'Developer', // You might want to add role to your backend data
    avatarSrc: primaryUser?.photo_profile || '/img/dummy/profile-photo-dummy.jpg',
    timestamp: new Date(project.created_at).toLocaleDateString(),
    content: project.content,
    image1: project.image1,
    image2: project.image2,
    image3: project.image3,
    image4: project.image4,
    image5: project.image5,
    likes: project.count_likes,
    comments: project.count_comments,
    count_likes: project.count_likes,
    count_comments: project.count_comments,
    link_figma: project.link_figma,
    link_github: project.link_github,
    initialLiked: false, // You might want to add this to your backend
    category: project.category,
    is_bookmarked: project.is_bookmarked
  };
};

export default function HomePage() {
  const { user } = useDevAuth();
  const [showComposer, setShowComposer] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [allPosts, setAllPosts] = useState<ReturnType<typeof transformProjectToPost>[]>([]);

  // tRPC infinite query for projects
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error
  } = trpc.project.getAll.useInfiniteQuery(
    {
      limit: 15,
      id_user: user.id
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchOnWindowFocus: false,
    }
  );

  // Transform and flatten the paginated data
  useEffect(() => {
    if (data?.pages) {
      const transformedPosts = data.pages
        .flatMap(page => page.projects)
        .map(transformProjectToPost);
      setAllPosts(transformedPosts);
    }
  }, [data]);

  // Handle mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 690);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Infinite scroll implementation
  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop
      >= document.documentElement.offsetHeight - 1000 // Load when 1000px from bottom
      && hasNextPage
      && !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handleNewPost = (content: string) => {
    // This would typically create a new post via API
    // For now, just show an alert
    alert("New post created: " + content);
    // TODO: Implement post creation API call
    // trpc.project.create.mutate({ ... })
  };

  const handleFabClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Error state
  if (isError) {
    return (
      <>
        <Sidebar activeItem="Home" />
        <PageContainer title="Home">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-red-500 mb-2">Error Loading Posts</h3>
              <p className="text-muted-foreground">
                {error?.message || 'Failed to load posts. Please try again later.'}
              </p>
            </div>
          </div>
        </PageContainer>
      </>
    );
  }

  return (
    <>
      <Sidebar activeItem="Home" />
      <PageContainer title="Home">
        <div className={`overflow-hidden ${isMobile ? 'bg-background' : 'bg-card rounded-3xl border border-white/10'}`}>
          {!isMobile && (
            <PostComposer 
              avatarSrc={user.imageUrl}
              username={`${user.firstName} ${user.lastName}`}
              onSubmit={handleNewPost}
              className="border-b border-white/10"
            />
          )}
          
          {/* Loading state for initial load */}
          {isLoading && (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <PostSkeleton key={index} />
              ))}
            </div>
          )}
          
          {/* Posts list */}
          {allPosts.map((post, index) => (
            <div key={post.id}>
              <PostCard {...post} />
              {index < allPosts.length - 1 && (
                <div className="border-t border-white/10"></div>
              )}
            </div>
          ))}
          
          {/* Loading state for infinite scroll */}
          {isFetchingNextPage && (
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, index) => (
                <PostSkeleton key={`loading-${index}`} />
              ))}
            </div>
          )}
          
          {/* End of posts message */}
          {!hasNextPage && allPosts.length > 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">You've reached the end of the feed</p>
            </div>
          )}
          
          {/* Empty state */}
          {!isLoading && allPosts.length === 0 && (
            <div className="text-center py-16">
              <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
              <p className="text-muted-foreground">Be the first to share a project!</p>
            </div>
          )}
        </div>
      </PageContainer>

      <FloatingActionButton onClick={handleFabClick} />
    </>
  );
}
