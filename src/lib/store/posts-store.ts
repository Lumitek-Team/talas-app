import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define the Post type
export interface Post {
  id: string;
  slug?: string;
  title?: string;
  username: string;
  userRole: string;
  avatarSrc: string;
  timestamp: string;
  content: string;
  images?: string[];
  image1?: string;
  image2?: string;
  image3?: string;
  image4?: string;
  image5?: string;
  video?: string;
  likes: number;
  comments: number;
  count_likes?: number;
  count_comments?: number;
  link_figma?: string;
  link_github?: string;
  created_at?: string;
  updated_at?: string | null;
  is_liked?: boolean;
  is_bookmarked?: boolean;
  category?: {
    slug: string;
    title: string;
  };
  users?: {
    username: string;
    name: string;
    photo_profile: string;
  }[];
}

// Define the store state
interface PostsState {
  posts: Post[];
  savedPostIds: string[];
  
  // Actions that will be easy to replace with API calls later
  toggleSavePost: (postId: string) => void;
  isPostSaved: (postId: string) => boolean;
  getSavedPosts: () => Post[];
  
  // Add a new method to add posts
  addPost: (post: Post) => void;
  
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
    content: "Next-Gen Portfolio Website\n A modern, sleek portfolio website built with React and Tailwind CSS. Featuring dark mode, smooth animations, and a fully responsive layout.\n🔧 Tech Stack: React, Tailwind CSS, Framer Motion",
    images: ["/img/dummy/photo-project-dummy.png", "/img/dummy/photo-project-dummy2.jpeg", "/img/dummy/photo-project-dummy3.jpg"],
    likes: 12,
    comments: 18,
    link_figma: "https://figma.com/file/example-portfolio",
    link_github: "https://github.com/hanna/portfolio-website",
    category: {
      slug: "web-development",
      title: "Web Development"
    }
  },
  {
    id: "2",
    username: "Hanna",
    userRole: "Fullstack Developer",
    avatarSrc: "/img/dummy/profile-photo-dummy.jpg",
    timestamp: "3 hrs",
    content: "Next-Gen Portfolio Website\nA modern, sleek portfolio website built with React and Tailwind CSS. Featuring dark mode, smooth animations, and a fully responsive layout.\n🔧 Tech Stack: React, Tailwind CSS, Framer Motion",
    images: ["/img/dummy/photo-project-dummy.png", "/img/dummy/photo-project-dummy2.jpeg", "/img/dummy/photo-project-dummy3.jpg"],
    likes: 8,
    comments: 5,
    link_github: "https://github.com/hanna/portfolio-website",
    category: {
      slug: "mobile-development",
      title: "Mobile Development"
    }
  },
  {
    id: "3",
    username: "Hanna",
    userRole: "Fullstack Developer",
    avatarSrc: "/img/dummy/profile-photo-dummy.jpg",
    timestamp: "3 hrs",
    content: "Next-Gen Portfolio Website\nA modern, sleek portfolio website built with React and Tailwind CSS. Featuring dark mode, smooth animations, and a fully responsive layout.\n🔧 Tech Stack: React, Tailwind CSS, Framer Motion",
    images: ["/img/dummy/photo-project-dummy.png", "/img/dummy/photo-project-dummy2.jpeg", "/img/dummy/photo-project-dummy3.jpg"],
    likes: 8,
    comments: 5,
    link_figma: "https://figma.com/file/example-portfolio-v2",
    category: {
      slug: "ui-design",
      title: "UI Design"
    }
  },
  {
    id: "4",
    username: "Hanna",
    userRole: "Fullstack Developer",
    avatarSrc: "/img/dummy/profile-photo-dummy.jpg",
    timestamp: "3 hrs",
    content: "Next-Gen Portfolio Website\nA modern, sleek portfolio website built with React and Tailwind CSS. Featuring dark mode, smooth animations, and a fully responsive layout.\n🔧 Tech Stack: React, Tailwind CSS, Framer Motion",
    images: ["/img/dummy/photo-project-dummy.png", "/img/dummy/photo-project-dummy2.jpeg", "/img/dummy/photo-project-dummy3.jpg"],
    likes: 8,
    comments: 5,
    link_figma: "https://figma.com/file/dashboard-design",
    link_github: "https://github.com/hanna/dashboard-project",
    category: {
      slug: "dashboard",
      title: "Dashboard"
    }
  },
  {
    id: "5",
    username: "Hanna",
    userRole: "Fullstack Developer",
    avatarSrc: "/img/dummy/profile-photo-dummy.jpg",
    timestamp: "3 hrs",
    content: "Next-Gen Portfolio Website\nA modern, sleek portfolio website built with React and Tailwind CSS. Featuring dark mode, smooth animations, and a fully responsive layout.\n🔧 Tech Stack: React, Tailwind CSS, Framer Motion",
    images: ["/img/dummy/photo-project-dummy.png", "/img/dummy/photo-project-dummy2.jpeg", "/img/dummy/photo-project-dummy3.jpg"],
    likes: 8,
    comments: 5,
    category: {
      slug: "frontend",
      title: "Frontend"
    }
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
      
      // Add a new post to the store
      addPost: (post: Post) => {
        set(state => ({
          posts: [post, ...state.posts]
        }));
      },
      
      // Future API integration functions
      savePost: async (postId: string) => {
        // This is a placeholder for future API integration
        console.log(`Post ${postId} saved - API call would happen here`);
      },
      
      unsavePost: async (postId: string) => {
        // This is a placeholder for future API integration
        console.log(`Post ${postId} unsaved - API call would happen here`);
      }
    }),
    {
      name: 'posts-storage', // name for the persisted storage
      partialize: (state) => ({ savedPostIds: state.savedPostIds }), // only persist savedPostIds
    }
  )
);