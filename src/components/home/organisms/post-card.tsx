"use client";

import { PostHeader } from "../molecules/post-header";
import { PostActions } from "../molecules/post-actions";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Github, Figma } from "lucide-react";

interface PostCardProps {
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
  likes: number;
  comments: number;
  count_likes?: number;
  count_comments?: number;
  link_figma?: string;
  link_github?: string;
  initialLiked?: boolean;
}

export function PostCard({
  id,
  slug,
  title,
  username,
  userRole,
  avatarSrc,
  timestamp,
  content,
  images = [],
  image1,
  image2,
  image3,
  image4,
  image5,
  likes,
  comments,
  count_likes,
  count_comments,
  link_figma,
  link_github,
  initialLiked = false,
}: PostCardProps) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(likes || count_likes || 0);
  const [isMobile, setIsMobile] = useState(false);

  // Combine images from both formats (legacy and new API format)
  const allImages = [...images];
  if (image1) allImages.push(image1);
  if (image2) allImages.push(image2);
  if (image3) allImages.push(image3);
  if (image4) allImages.push(image4);
  if (image5) allImages.push(image5);

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

  const displayTitle = title || (content ? content.split('\n')[0] : '');
  const displayContent = title ? content : (content ? content.split('\n').slice(1).join('\n') : '');

  return (
    <div className={`p-4 ${isMobile ? 'bg-background' : ''}`}>
      <PostHeader
        username={username}
        userRole={userRole}
        avatarSrc={avatarSrc}
        timestamp={timestamp}
      />
      
      <div className="mb-6">
        <h2 className="text-lg font-bold">{displayTitle}</h2>
        <p className="text-white text-sm whitespace-pre-line">
          {displayContent}
        </p>
        
        {/* External Links Section */}
        {(link_figma || link_github) && (
          <div className="flex gap-3 mt-3">
            {link_figma && (
              <Link 
                href={link_figma} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <Figma size={16} className="w-4 h-4" />
                <span>Figma</span>
              </Link>
            )}
            
            {link_github && (
              <Link 
                href={link_github} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <Github size={16} className="w-4 h-4" />
                <span>GitHub</span>
              </Link>
            )}
          </div>
        )}
      </div>
      
      {allImages.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {allImages.map((image, index) => (
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
          comments={comments || count_comments || 0}
          onLike={handleLike}
          onComment={() => {}}
          onShare={() => {}}
          isLiked={isLiked}
        />
      </div>
    </div>
  );
}