"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { PostComposer } from "@/components/home/organisms/post-composer";
import { PostCard } from "@/components/home/organisms/post-card";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { PageContainer } from "@/components/ui/page-container";
import { useState, useEffect } from "react";
import { usePostsStore, Post } from "@/lib/store/posts-store";

export default function HomePage() {
  const posts = usePostsStore(state => state.posts);
  const [showComposer, setShowComposer] = useState(false);
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

  const handleNewPost = (content: string) => {
    // This would typically update the store in a real implementation
    const newPost: Post = {
      id: Date.now().toString(),
      username: "You",
      userRole: "Developer",
      avatarSrc: "/placeholder-avatar.png",
      timestamp: "Just now",
      content,
      likes: 0,
      comments: 0,
    };

    // For now, we're just showing how it would work
    alert("New post created: " + content);
  };

  const handleFabClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Sidebar activeItem="Home" />
      <PageContainer title="Home">
        <div className={`overflow-hidden ${isMobile ? 'bg-background' : 'bg-card rounded-3xl border border-white/10'}`}>
          {!isMobile && (
            <PostComposer 
              avatarSrc="/img/dummy/profile-photo-dummy.jpg"
              username="You"
              onSubmit={handleNewPost}
              className="border-b border-white/10"
            />
          )}
          
          {posts.map((post, index) => (
            <div key={post.id}>
              <PostCard {...post} />
              {index < posts.length - 1 && (
                <div className="border-t border-white/10"></div>
              )}
            </div>
          ))}
        </div>
      </PageContainer>

      <FloatingActionButton/>
    </>
  );
}