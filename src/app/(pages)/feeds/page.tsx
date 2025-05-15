"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { PostComposer } from "@/components/home/organisms/post-composer";
import { PostCard } from "@/components/home/organisms/post-card";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { PageContainer } from "@/components/ui/page-container";
import { useState } from "react";

// Mock data for demonstration
const MOCK_POSTS = [
  {
    id: "1",
    username: "Hanna",
    userRole: "Fullstack Developer",
    avatarSrc: "/img/dummy/profile-photo-dummy.jpg",
    timestamp: "3 hrs",
    content: "Next-Gen Portfolio Website\n\nA modern, sleek portfolio website built with React and Tailwind CSS. Featuring dark mode, smooth animations, and a fully responsive layout.\n🔧 Tech Stack: React, Tailwind CSS, Framer Motion\n📎 GitHub Repo: hanna.git\nExcited to share my latest project! Let me know what you think and feel free to drop feedback. Open for collaborations!",
    images: ["/img/dummy/photo-project-dummy.png", "/img/dummy/photo-project-dummy2.jpeg", "/img/dummy/photo-project-dummy3.jpg"],
    likes: 12,
    comments: 18,
  },
  {
    id: "2",
    username: "Hanna",
    userRole: "Fullstack Developer",
    avatarSrc: "/img/dummy/profile-photo-dummy.jpg",
    timestamp: "3 hrs",
    content: "Next-Gen Portfolio Website\n\nA modern, sleek portfolio website built with React and Tailwind CSS. Featuring dark mode, smooth animations, and a fully responsive layout.\n🔧 Tech Stack: React, Tailwind CSS, Framer Motion\n📎 GitHub Repo: hanna.git",
    images: ["/img/dummy/photo-project-dummy.png", "/img/dummy/photo-project-dummy2.jpeg", "/img/dummy/photo-project-dummy3.jpg"],
    likes: 8,
    comments: 5,
  },
  {
    id: "3",
    username: "Hanna",
    userRole: "Fullstack Developer",
    avatarSrc: "/img/dummy/profile-photo-dummy.jpg",
    timestamp: "3 hrs",
    content: "Next-Gen Portfolio Website\n\nA modern, sleek portfolio website built with React and Tailwind CSS. Featuring dark mode, smooth animations, and a fully responsive layout.\n🔧 Tech Stack: React, Tailwind CSS, Framer Motion\n📎 GitHub Repo: hanna.git",
    images: ["/img/dummy/photo-project-dummy.png", "/img/dummy/photo-project-dummy2.jpeg", "/img/dummy/photo-project-dummy3.jpg"],
    likes: 8,
    comments: 5,
  },
  {
    id: "4",
    username: "Hanna",
    userRole: "Fullstack Developer",
    avatarSrc: "/img/dummy/profile-photo-dummy.jpg",
    timestamp: "3 hrs",
    content: "Next-Gen Portfolio Website\n\nA modern, sleek portfolio website built with React and Tailwind CSS. Featuring dark mode, smooth animations, and a fully responsive layout.\n🔧 Tech Stack: React, Tailwind CSS, Framer Motion\n📎 GitHub Repo: hanna.git",
    images: ["/img/dummy/photo-project-dummy.png", "/img/dummy/photo-project-dummy2.jpeg", "/img/dummy/photo-project-dummy3.jpg"],
    likes: 8,
    comments: 5,
  },
  {
    id: "5",
    username: "Hanna",
    userRole: "Fullstack Developer",
    avatarSrc: "/img/dummy/profile-photo-dummy.jpg",
    timestamp: "3 hrs",
    content: "Next-Gen Portfolio Website\n\nA modern, sleek portfolio website built with React and Tailwind CSS. Featuring dark mode, smooth animations, and a fully responsive layout.\n🔧 Tech Stack: React, Tailwind CSS, Framer Motion\n📎 GitHub Repo: hanna.git",
    images: ["/img/dummy/photo-project-dummy.png", "/img/dummy/photo-project-dummy2.jpeg", "/img/dummy/photo-project-dummy3.jpg"],
    likes: 8,
    comments: 5,
  }
];

export default function HomePage() {
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [showComposer, setShowComposer] = useState(false);

  const handleNewPost = (content: string) => {
    const newPost = {
      id: Date.now().toString(),
      username: "You",
      userRole: "Developer",
      avatarSrc: "/placeholder-avatar.png",
      timestamp: "Just now",
      content,
      likes: 0,
      comments: 0,
    };

    setPosts([newPost, ...posts]);
  };

  const handleFabClick = () => {
    // You can implement different behaviors here:
    // 1. Scroll to the top where the composer is
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // 2. Or you could show a modal composer
    // setShowComposer(true);
  };

  return (
    <>
      <Sidebar activeItem="Home" />
      <PageContainer title="Home">
        {/* Continuous feed container with single card appearance */}
        <div className="bg-card rounded-3xl overflow-hidden border border-white/10">
          {/* Post composer integrated into the feed */}
          <PostComposer 
            avatarSrc="/img/dummy/profile-photo-dummy.jpg"
            username="You"
            onSubmit={handleNewPost}
            className="border-b border-white/10"
          />
          
          {/* Posts */}
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

      {/* Floating Action Button */}
      <FloatingActionButton onClick={handleFabClick} />
    </>
  );
}