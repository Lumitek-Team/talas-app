"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Sidebar } from "@/components/layout/sidebar";
import { PageContainer } from "@/components/ui/page-container";
import { PostHeader } from "@/components/home/molecules/post-header";
import { PostActions } from "@/components/home/molecules/post-actions";
import { usePostsStore } from "@/lib/store/posts-store";
import { Github, Figma } from "lucide-react";
import { CommentSection } from "@/components/project/comment-section";
import { usePostActions } from "@/lib/hooks/use-post-actions";
import { PostCard } from "@/components/home/organisms/post-card";

// Custom hook for fetching project by ID
function useProjectById(projectId: string) {
  const posts = usePostsStore(state => state.posts);
  const project = posts.find(post => post.id === projectId);
  
  return {
    project,
    isLoading: false,
    error: project ? null : new Error("Project not found")
  };
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const [isMobile, setIsMobile] = useState(false);
  
  // Use the custom hook to fetch project data
  const { project, isLoading, error } = useProjectById(projectId);
  
  // Get post actions from the hook
  const { isLiked, likeCount, isPostSaved, handleLike, handleSave } = 
    usePostActions(projectId, false, project?.likes || project?.count_likes || 0);

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

  // Handle loading state
  if (isLoading) {
    return (
      <>
        <Sidebar />
        <PageContainer title="Loading..." showBackButton={true}>
          <div className="p-8 text-center">
            <h2 className="text-xl font-bold mb-4">Loading project details...</h2>
          </div>
        </PageContainer>
      </>
    );
  }

  // Handle case where project is not found
  if (!project) {
    return (
      <>
        <Sidebar />
        <PageContainer title="Project Not Found" showBackButton={true}>
          <div className="p-8 text-center">
            <h2 className="text-xl font-bold mb-4">Project not found</h2>
            <p>The project you're looking for doesn't exist or has been removed.</p>
            <button 
              onClick={() => router.push('/')}
              className="mt-6 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-foreground transition-colors"
            >
              Go to Home
            </button>
          </div>
        </PageContainer>
      </>
    );
  }

  // Prepare images array
  const allImages = [...(project.images || [])];
  if (project.image1) allImages.push(project.image1);
  if (project.image2) allImages.push(project.image2);
  if (project.image3) allImages.push(project.image3);
  if (project.image4) allImages.push(project.image4);
  if (project.image5) allImages.push(project.image5);

  // Format content
  const displayTitle = project.title || (project.content ? project.content.split('\n')[0] : '');
  const displayContent = project.title ? project.content : (project.content ? project.content.split('\n').slice(1).join('\n') : '');

  return (
    <>
      <Sidebar />
      <PageContainer title="Project Details" showBackButton={true}>
        <div className={`overflow-hidden ${isMobile ? 'bg-background' : 'bg-card rounded-3xl border border-white/10'}`}>
          <div className="p-4">
            <PostCard
              id={project.id}
              title={displayTitle}
              content={displayContent}
              username={project.username}
              userRole={project.userRole}
              avatarSrc={project.avatarSrc}
              timestamp={project.timestamp}
              images={allImages}
              likes={likeCount}
              comments={project.comments || project.count_comments || 0}
              link_figma={project.link_figma}
              link_github={project.link_github}
              category={project.category}
              // Disable click navigation since we're already on the detail page
              onComment={() => {}}
            />
            
            {/* Separator line */}
            <div className="my-1 border-t border-white/10"></div>

            {/* Comment Section remains below */}
            <CommentSection projectId={project.id} />
          </div>
        </div>
      </PageContainer>
    </>
  );
}