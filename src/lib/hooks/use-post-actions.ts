import { useState, useCallback } from 'react';
import { usePostsStore } from '@/lib/store/posts-store';
import { postsService } from '@/lib/services/posts-service';

export function usePostActions(postId: string, initialLiked: boolean = false, initialLikes: number = 0) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikes);
  
  // Get save state from our store
  const isPostSaved = usePostsStore(state => state.isPostSaved(postId));
  const toggleSavePost = usePostsStore(state => state.toggleSavePost);

  // Handle like action
  const handleLike = useCallback(() => {
    if (isLiked) {
      setLikeCount(prev => prev - 1);
    } else {
      setLikeCount(prev => prev + 1);
    }
    setIsLiked(!isLiked);
    
    // In the future, this could call an API
    // Example: api.likePost(postId, !isLiked);
  }, [isLiked, postId]);

  // Handle save action
  const handleSave = useCallback(() => {
    toggleSavePost(postId);
    
    // This could be replaced with a direct API call in the future
    // Example: isPostSaved ? postsService.unsavePost(postId) : postsService.savePost(postId);
  }, [postId, toggleSavePost]);

  return {
    isLiked,
    likeCount,
    isPostSaved,
    handleLike,
    handleSave
  };
}