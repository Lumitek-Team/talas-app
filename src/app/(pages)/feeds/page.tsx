"use client";

import { Sidebar } from "@/components/home/organisms/sidebar";
import { PostComposer } from "@/components/home/organisms/post-composer";
import { PostCard } from "@/components/home/organisms/post-card";
import { useState } from "react";

// Mock data for demonstration
const MOCK_POSTS = [
  {
    id: "1",
    username: "Hanna",
    userRole: "Fullstack Developer",
    avatarSrc: "/placeholder-avatar.png",
    timestamp: "3 hrs",
    content: "Next-Gen Portfolio Website\n\nA modern, sleek portfolio website built with React and Tailwind CSS. Featuring dark mode, smooth animations, and a fully responsive layout.\n🔧 Tech Stack: React, Tailwind CSS, Framer Motion\n📎 GitHub Repo: hanna.git\nExcited to share my latest project! Let me know what you think and feel free to drop feedback. Open for collaborations!",
    images: ["/placeholder-image-1.jpg", "/placeholder-image-2.jpg", "/placeholder-image-3.jpg"],
    likes: 12,
    comments: 18,
  },
  {
    id: "2",
    username: "Hanna",
    userRole: "Fullstack Developer",
    avatarSrc: "/placeholder-avatar.png",
    timestamp: "3 hrs",
    content: "Next-Gen Portfolio Website\n\nA modern, sleek portfolio website built with React and Tailwind CSS. Featuring dark mode, smooth animations, and a fully responsive layout.\n🔧 Tech Stack: React, Tailwind CSS, Framer Motion\n📎 GitHub Repo: hanna.git",
    likes: 8,
    comments: 5,
  }
];

export default function HomePage() {
  const [posts, setPosts] = useState(MOCK_POSTS);

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

  return (
    <div className="bg-background min-h-screen">
      <Sidebar />

      <main className="ml-[420px] max-w-[900px] mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Home</h1>

        <PostComposer
          avatarSrc="/placeholder-avatar.png"
          username="You"
          onSubmit={handleNewPost}
        />

        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              {...post}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
