"use client";

import { PostHeader } from "../molecules/post-header";
import { PostActions } from "../molecules/post-actions";
import Image from "next/image";
import { useState } from "react";

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
  initialSaved?: boolean;
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
  initialSaved = false,
}: PostCardProps) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [likeCount, setLikeCount] = useState(likes);

  const handleLike = () => {
    if (isLiked) {
      setLikeCount(prev => prev - 1);
    } else {
      setLikeCount(prev => prev + 1);
    }
    setIsLiked(!isLiked);
  };

  return (
    <div className="p-4">
      <PostHeader
        username={username}
        userRole={userRole}
        avatarSrc={avatarSrc}
        timestamp={timestamp}
      />
      
      <div className="mb-6"> {/* Changed from mb-2 to mb-6 to increase gap */}
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
      
      <PostActions
        likes={likeCount}
        comments={comments}
        onLike={handleLike}
        onComment={() => {}}
        onSave={() => setIsSaved(!isSaved)}
        onShare={() => {}}
        isLiked={isLiked}
        isSaved={isSaved}
      />
    </div>
  );
}