import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define the Post type
export interface Post {
  id: string;
  username: string;
  userRole: string;
  avatarSrc: string;
  timestamp: string;
  content: string;
  images?: string[];
  likes: number;
  comments: number;
  initialLiked?: boolean;
}

// Define the store state
interface PostsState {
  posts: Post[];
  savedPostIds: string[];
  
  // Actions that will be easy to replace with API calls later
  toggleSavePost: (postId: string) => void;
  isPostSaved: (postId: string) => boolean;
  getSavedPosts: () => Post[];
  
  // Additional actions for future API integration
  savePost: (postId: string) => Promise<void>;
  unsavePost: (postId: string) => Promise<void>;
}

// Sample data for development
const samplePosts: Post[] = [
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

// Create the store with persistence
export const usePostsStore = create<PostsState>()(
  persist(
    (set, get) => ({
      posts: samplePosts,
      savedPostIds: [],
      
      // Toggle save/unsave
      toggleSavePost: (postId: string) => {
        const { savedPostIds } = get();
        const isCurrentlySaved = savedPostIds.includes(postId);
        
        if (isCurrentlySaved) {
          // If already saved, remove it (unsave)
          set({ 
            savedPostIds: savedPostIds.filter(id => id !== postId) 
          });
          
          // In the future, this could call an API
          // get().unsavePost(postId);
        } else {
          // If not saved, add it (save)
          set({ 
            savedPostIds: [...savedPostIds, postId] 
          });
          
          // In the future, this could call an API
          // get().savePost(postId);
        }
      },
      
      // Check if a post is saved
      isPostSaved: (postId: string) => {
        return get().savedPostIds.includes(postId);
      },
      
      // Get all saved posts
      getSavedPosts: () => {
        const { posts, savedPostIds } = get();
        return posts.filter(post => savedPostIds.includes(post.id));
      },
      
      // Future API integration functions
      savePost: async (postId: string) => {
        // This is a placeholder for future API integration
        // Example implementation:
        // const response = await fetch('/api/save', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ postId })
        // });
        // if (!response.ok) throw new Error('Failed to save post');
        console.log(`Post ${postId} saved - API call would happen here`);
      },
      
      unsavePost: async (postId: string) => {
        // This is a placeholder for future API integration
        // Example implementation:
        // const response = await fetch(`/api/save/${postId}`, {
        //   method: 'DELETE'
        // });
        // if (!response.ok) throw new Error('Failed to unsave post');
        console.log(`Post ${postId} unsaved - API call would happen here`);
      }
    }),
    {
      name: 'posts-storage', // name for the persisted storage
      partialize: (state) => ({ savedPostIds: state.savedPostIds }), // only persist savedPostIds
    }
  )
);