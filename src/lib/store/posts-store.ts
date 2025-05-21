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
    content: "Next-Gen Portfolio Website\n\nA modern, sleek portfolio website built with React and Tailwind CSS. Featuring dark mode, smooth animations, and a fully responsive layout.\n🔧 Tech Stack: React, Tailwind CSS, Framer Motion Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    images: ["/img/dummy/photo-project-dummy.png", "/img/dummy/photo-project-dummy2.jpeg", "/img/dummy/photo-project-dummy3.jpg"],
    likes: 12,
    comments: 18,
    link_figma: "https://figma.com/file/example-portfolio",
    link_github: "https://github.com/hanna/portfolio-website",
  },
  {
    id: "2",
    username: "Hanna",
    userRole: "Fullstack Developer",
    avatarSrc: "/img/dummy/profile-photo-dummy.jpg",
    timestamp: "3 hrs",
    content: "Next-Gen Portfolio Website\n\nA modern, sleek portfolio website built with React and Tailwind CSS. Featuring dark mode, smooth animations, and a fully responsive layout.\n🔧 Tech Stack: React, Tailwind CSS, Framer Motion",
    images: ["/img/dummy/photo-project-dummy.png", "/img/dummy/photo-project-dummy2.jpeg", "/img/dummy/photo-project-dummy3.jpg"],
    likes: 8,
    comments: 5,
    link_github: "https://github.com/hanna/portfolio-website",
  },
  {
    id: "3",
    username: "Hanna",
    userRole: "Fullstack Developer",
    avatarSrc: "/img/dummy/profile-photo-dummy.jpg",
    timestamp: "3 hrs",
    content: "Next-Gen Portfolio Website\n\nA modern, sleek portfolio website built with React and Tailwind CSS. Featuring dark mode, smooth animations, and a fully responsive layout.\n🔧 Tech Stack: React, Tailwind CSS, Framer Motion",
    images: ["/img/dummy/photo-project-dummy.png", "/img/dummy/photo-project-dummy2.jpeg", "/img/dummy/photo-project-dummy3.jpg"],
    likes: 8,
    comments: 5,
    link_figma: "https://figma.com/file/example-portfolio-v2",
  },
  {
    id: "4",
    username: "Hanna",
    userRole: "Fullstack Developer",
    avatarSrc: "/img/dummy/profile-photo-dummy.jpg",
    timestamp: "3 hrs",
    content: "Next-Gen Portfolio Website\n\nA modern, sleek portfolio website built with React and Tailwind CSS. Featuring dark mode, smooth animations, and a fully responsive layout.\n🔧 Tech Stack: React, Tailwind CSS, Framer Motion",
    images: ["/img/dummy/photo-project-dummy.png", "/img/dummy/photo-project-dummy2.jpeg", "/img/dummy/photo-project-dummy3.jpg"],
    likes: 8,
    comments: 5,
    link_figma: "https://figma.com/file/dashboard-design",
    link_github: "https://github.com/hanna/dashboard-project",
  },
  {
    id: "5",
    username: "Hanna",
    userRole: "Fullstack Developer",
    avatarSrc: "/img/dummy/profile-photo-dummy.jpg",
    timestamp: "3 hrs",
    content: "Next-Gen Portfolio Website\n\nA modern, sleek portfolio website built with React and Tailwind CSS. Featuring dark mode, smooth animations, and a fully responsive layout.\n🔧 Tech Stack: React, Tailwind CSS, Framer Motion",
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

// Initial posts data
const initialPosts: Post[] = [
  {
    id: "01JT81VVECPTOY46HAAWSWEX1",
    slug: "project-slug-1",
    title: "Project Title 1",
    username: "John Doe",
    userRole: "UI/UX Designer",
    avatarSrc: "/img/dummy/profile-photo-dummy.jpg",
    timestamp: "2 hours ago",
    content: "This is the content of project 1.",
    image1: "https://example.com/image1.jpg",
    image2: "https://example.com/image2.jpg",
    image3: "https://example.com/image3.jpg",
    count_likes: 10,
    count_comments: 5,
    likes: 10,
    comments: 5,
    link_figma: "https://example.com/linkfigma",
    link_github: "https://example.com/linkgithub",
    created_at: "2025-05-01T12:00:00.000Z",
    is_liked: false,
    is_bookmarked: false,
    category: {
      slug: "category-slug-1",
      title: "Category Title 1"
    },
    users: [
      {
        username: "user-name-1",
        name: "User Name 1",
        photo_profile: "https://example.com/photo_profile1.jpg"
      }
    ]
  },
  {
    id: "02",
    username: "Jane Smith",
    userRole: "Frontend Developer",
    avatarSrc: "/img/dummy/profile-photo-dummy.jpg",
    timestamp: "5 hours ago",
    content: "React Component Library\nI've created a reusable component library for React applications with TypeScript support. Check it out!",
    images: ["/img/dummy/post-image-1.jpg", "/img/dummy/post-image-2.jpg"],
    likes: 24,
    comments: 8,
    link_github: "https://github.com/example/react-components",
  },
  {
    id: "03",
    username: "Alex Johnson",
    userRole: "Full Stack Developer",
    avatarSrc: "/img/dummy/profile-photo-dummy.jpg",
    timestamp: "1 day ago",
    content: "E-commerce Dashboard\nJust finished this admin dashboard for an e-commerce platform. It includes analytics, order management, and inventory tracking.",
    images: ["/img/dummy/post-image-3.jpg"],
    likes: 42,
    comments: 15,
    link_figma: "https://figma.com/file/example-dashboard",
    link_github: "https://github.com/example/ecommerce-dashboard",
  },
  // Add more mock posts as needed
];