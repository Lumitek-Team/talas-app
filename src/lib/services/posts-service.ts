// This service layer will make it easy to swap out client-side state with API calls

import { usePostsStore, Post } from "@/lib/store/posts-store";

// Interface for the posts service
export interface PostsService {
  getPosts: () => Promise<Post[]>;
  getSavedPosts: () => Promise<Post[]>;
  savePost: (postId: string) => Promise<void>;
  unsavePost: (postId: string) => Promise<void>;
  isPostSaved: (postId: string) => Promise<boolean>;
}

// Client-side implementation using our store
export const clientPostsService: PostsService = {
  getPosts: async () => {
    // Currently just returns posts from the store
    return usePostsStore.getState().posts;
  },
  
  getSavedPosts: async () => {
    // Currently just returns saved posts from the store
    return usePostsStore.getState().getSavedPosts();
  },
  
  savePost: async (postId: string) => {
    // Currently just toggles the saved state in the store
    const isAlreadySaved = usePostsStore.getState().isPostSaved(postId);
    if (!isAlreadySaved) {
      usePostsStore.getState().toggleSavePost(postId);
    }
  },
  
  unsavePost: async (postId: string) => {
    // Currently just toggles the saved state in the store
    const isAlreadySaved = usePostsStore.getState().isPostSaved(postId);
    if (isAlreadySaved) {
      usePostsStore.getState().toggleSavePost(postId);
    }
  },
  
  isPostSaved: async (postId: string) => {
    // Currently just checks the saved state in the store
    return usePostsStore.getState().isPostSaved(postId);
  }
};

// Future API implementation (commented out for now)
/*
export const apiPostsService: PostsService = {
  getPosts: async () => {
    const response = await fetch('/api/posts');
    if (!response.ok) throw new Error('Failed to fetch posts');
    return response.json();
  },
  
  getSavedPosts: async () => {
    const response = await fetch('/api/saved');
    if (!response.ok) throw new Error('Failed to fetch saved posts');
    return response.json();
  },
  
  savePost: async (postId: string) => {
    const response = await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId })
    });
    if (!response.ok) throw new Error('Failed to save post');
  },
  
  unsavePost: async (postId: string) => {
    const response = await fetch(`/api/save/${postId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to unsave post');
  },
  
  isPostSaved: async (postId: string) => {
    const response = await fetch(`/api/save/check/${postId}`);
    if (!response.ok) throw new Error('Failed to check saved status');
    const data = await response.json();
    return data.isSaved;
  }
};
*/

// Export the current implementation
// To switch to API calls later, just change this to export apiPostsService
export const postsService = clientPostsService;