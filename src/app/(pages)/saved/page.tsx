"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { PostCard } from "@/components/home/organisms/post-card";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { PageContainer } from "@/components/ui/page-container";
import { useState, useEffect, useMemo } from "react";
import { usePostsStore } from "@/lib/store/posts-store";

export default function SavedProjectsPage() {
  // Use the getSavedPosts function from the store
  const getSavedPosts = usePostsStore(state => state.getSavedPosts);
  
  // Call the function once and memoize the result
  const savedPosts = useMemo(() => getSavedPosts(), [getSavedPosts]);
  
  const [isMobile, setIsMobile] = useState(false);

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

  // DEVELOPMENT ONLY - Bypass authentication
  // In production, this would check for authentication and redirect if needed
  // Example:
  // const { user } = useAuth();
  // useEffect(() => {
  //   if (!user) router.push('/login');
  // }, [user, router]);
  // Comment: Authentication check disabled for development purposes

  return (
    <>
      <Sidebar activeItem="Saved projects" />
      <PageContainer title="Saved Projects">
        <div className={`overflow-hidden ${isMobile ? 'bg-background' : 'bg-card rounded-3xl border border-white/10'}`}>
          {savedPosts.length > 0 ? (
            savedPosts.map((post, index) => (
              <div key={post.id}>
                <PostCard {...post} />
                {index < savedPosts.length - 1 && (
                  <div className="border-t border-white/10"></div>
                )}
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <p>No saved projects yet.</p>
              <p className="text-sm mt-2">Projects you save will appear here.</p>
            </div>
          )}
        </div>
      </PageContainer>

      <FloatingActionButton onClick={() => window.location.href = "/"} />
    </>
  );
}