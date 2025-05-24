"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { PageContainer } from "@/components/ui/page-container";
import { PostCard } from "@/components/home/organisms/post-card";
import { CommentSection } from "@/components/project/comment-section";
import { trpc } from "@/app/_trpc/client";
import { useDevAuth } from "@/lib/dev-auth-context";
import { PostSkeleton } from '@/components/project/skeleton';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useDevAuth();
  const projectId = params.id as string;
  const [isMobile, setIsMobile] = useState(false);
  
  // Fetch project using tRPC
  const { data: project, isLoading, error } = trpc.project.getOne.useQuery({
    id: projectId,
    id_user: user.id
  }, {
    enabled: !!projectId && !!user.id,
  });
  
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
          <div className="space-y-4 p-4">
            <PostSkeleton />
          </div>
        </PageContainer>
      </>
    );
  }

  // Handle error state
  if (error || !project) {
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

  // Transform project data for PostCard
  const primaryUser = project.project_user[0]?.user;
  const postCardProps = {
    id: project.id,
    slug: project.slug,
    title: project.title,
    username: primaryUser?.username || 'Unknown User',
    userRole: 'Developer',
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
    link_figma: project.link_figma,
    link_github: project.link_github,
    category: project.category,
    is_bookmarked: project.is_bookmarked
  };

  return (
    <>
      <Sidebar />
      <PageContainer title="Project Details" showBackButton={true}>
        <div className={`overflow-hidden ${isMobile ? 'bg-background' : 'bg-card rounded-3xl border border-white/10'}`}>
          <div className="p-4">
            <PostCard {...postCardProps} />
            
            {/* Separator line */}
            <div className="my-1 border-t border-white/10"></div>

            {/* Comment Section */}
            <CommentSection projectId={project.id} />
          </div>
        </div>
      </PageContainer>
    </>
  );
}