"use client";

import { PostHeader } from "../molecules/post-header";
import { PostActions } from "../molecules/post-actions";
import Image from "next/image";
import { useState, useEffect } from "react";

interface PostCardProps {
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

export function PostCard({
  id,
  username,
  userRole,
  avatarSrc,
  timestamp,
  content,
  images = [],
  likes,
  comments,
  initialLiked = false,
}: PostCardProps) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(likes);
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

  const handleLike = () => {
    if (isLiked) {
      setLikeCount(prev => prev - 1);
    } else {
      setLikeCount(prev => prev + 1);
    }
    setIsLiked(!isLiked);
  };

  return (
    <div className={`p-4 ${isMobile ? 'bg-background' : ''}`}>
      <PostHeader
        username={username}
        userRole={userRole}
        avatarSrc={avatarSrc}
        timestamp={timestamp}
      />
      
      <div className="mb-6">
        <h2 className="text-lg font-bold">{content.split('\n')[0]}</h2>
        <p className="text-white text-sm whitespace-pre-line">
          {content.split('\n').slice(1).join('\n')}
        </p>
      </div>
      
      {images && images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {images.map((image, index) => (
            <div 
              key={index} 
              className="aspect-video bg-muted rounded-md overflow-hidden relative"
            >
              <Image
                src={image}
                alt={`Post image ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}
      
      <div className="pt-2">
        <PostActions
          postId={id}
          likes={likeCount}
          comments={comments}
          onLike={handleLike}
          onComment={() => {}}
          onShare={() => {}}
          isLiked={isLiked}
        />
      </div>
    </div>
  );
}