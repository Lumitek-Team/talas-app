// components/home/organisms/post-card.tsx (Refactored with date-fns)
"use client";

import { PostHeader } from "../molecules/post-header";
import { PostActions } from "../molecules/post-actions";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Github, Figma } from "lucide-react";
import { useRouter } from "next/navigation";
import { getPublicUrl } from "@/lib/utils";
import { formatDistanceToNow } from 'date-fns'; // Import date-fns function

interface PostCardProps {
  id: string;
  slug?: string;
  title?: string;
  username: string;
  userRole: string;
  avatarSrc: string;
  timestamp: string; // Expecting a date string (e.g., ISO string from project.created_at)
  content: string;
  images?: string[];
  image1?: string;
  image2?: string;
  image3?: string;
  image4?: string;
  image5?: string;
  likes: number;
  comments: number;
  link_figma?: string;
  link_github?: string;
  isLiked: boolean;
  isBookmarked: boolean;
  onToggleLike: () => void;
  onToggleBookmark: () => void;
  category?: {
    slug: string;
    title: string;
  };
}

export function PostCard({
  id,
  slug,
  title,
  username,
  userRole,
  avatarSrc,
  timestamp, // This is the raw date string now
  content,
  images = [],
  image1,
  image2,
  image3,
  image4,
  image5,
  likes,
  comments,
  link_figma,
  link_github,
  isLiked,
  isBookmarked,
  onToggleLike,
  onToggleBookmark,
  category,
}: PostCardProps) {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  const allDisplayImages = [...images];
  if (image1) allDisplayImages.push(image1);
  if (image2) allDisplayImages.push(image2);
  if (image3) allDisplayImages.push(image3);
  if (image4) allDisplayImages.push(image4);
  if (image5) allDisplayImages.push(image5);

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

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('a, button')) {
      return;
    }
    if (slug) {
      router.push(`/project/${slug}`);
    } else {
      router.push(`/project/${id}`);
    }
  };

  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (slug) {
        router.push(`/project/${slug}#comments`);
    } else {
        router.push(`/project/${id}#comments`);
    }
  };

  const displayTitle = title || (content ? content.split('\n')[0] : 'Untitled Project');
  const displayContent = title ? content : (content ? content.split('\n').slice(1).join('\n') : '');

  // Format the timestamp using date-fns
  let formattedTimestamp = 'just now'; // Default value
  if (timestamp) {
    try {
      formattedTimestamp = formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      console.error("Failed to format timestamp:", timestamp, error);
      // Fallback to the original string or a simple format if parsing fails
      formattedTimestamp = new Date(timestamp).toLocaleDateString(); // Or just keep original timestamp string
    }
  }

  return (
    <div
      className={`p-4 ${isMobile ? 'bg-background' : ''} cursor-pointer`}
      onClick={handleCardClick}
    >
      <PostHeader
        username={username}
        userRole={userRole}
        avatarSrc={avatarSrc}
        timestamp={formattedTimestamp} // Pass the formatted timestamp
      />

      <div className="mb-6">
        <h2 className="text-lg font-bold">{displayTitle}</h2>
        {category && (
          <Link
            href={`/feeds?category=${category.slug}`}
            onClick={(e) => e.stopPropagation()}
            className="text-sm text-muted-foreground hover:underline mb-3 inline-block"
          >
            {category.title}
          </Link>
        )}
        <p className="text-white text-sm whitespace-pre-line">
          {displayContent}
        </p>

        {(link_figma || link_github) && (
          <div className="flex gap-3 mt-3" onClick={e => e.stopPropagation()}>
            {link_figma && (
              <Link
                href={link_figma}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white transition-all duration-200 transform active:scale-90"
              >
                <Figma size={16} className="w-4 h-4 transition-transform duration-200" />
                <span>Figma</span>
              </Link>
            )}
            {link_github && (
              <Link
                href={link_github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white transition-all duration-200 transform active:scale-90"
              >
                <Github size={16} className="w-4 h-4 transition-transform duration-200" />
                <span>GitHub</span>
              </Link>
            )}
          </div>
        )}
      </div>

      {allDisplayImages.length > 0 && (
        <div
          className={`grid gap-2 mb-4 ${
            allDisplayImages.length === 1 ? 'grid-cols-1' :
            allDisplayImages.length === 2 ? 'grid-cols-2' :
            allDisplayImages.length === 3 ? 'grid-cols-3' :
            allDisplayImages.length === 4 ? 'grid-cols-2' : 'grid-cols-3'
          }`}
          onClick={e => e.stopPropagation()}
        >
          {allDisplayImages.slice(0, 5).map((imagePath, index) => {
            const imageUrl = imagePath.startsWith('http') ? imagePath : getPublicUrl(imagePath);
            return (
              <div
                key={index}
                className={`aspect-video bg-muted rounded-md overflow-hidden relative ${
                  (allDisplayImages.length === 3 && index === 0) ? 'md:col-span-3 row-span-2' : 
                  (allDisplayImages.length === 5 && index === 0) ? 'col-span-3 md:col-span-2 row-span-2' : 
                  (allDisplayImages.length === 5 && (index === 1 || index ===2)) ? 'col-span-1 md:col-span-1 row-span-1' :
                  (allDisplayImages.length > 3 && index > 0 && allDisplayImages.length % 2 !== 0 && index === allDisplayImages.length -1 ) ? 'col-span-2' : 
                  '' 
                } ${ isMobile && allDisplayImages.length > 2 && index === 0 ? 'col-span-full' : '' }`}
              >
                <Image
                  src={imageUrl}
                  alt={`${title || 'Project'} image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 690px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/img/dummy/project-photo-dummy.jpg'; 
                  }}
                />
              </div>
            );
          })}
        </div>
      )}

      <div className="pt-2" onClick={e => e.stopPropagation()}>
        <PostActions
          likes={likes} 
          comments={comments}
          onLikeToggle={onToggleLike}
          onComment={handleCommentClick}
          onShare={() => {
            const projectUrl = `${window.location.origin}/project/${slug || id}`;
            navigator.clipboard.writeText(projectUrl)
              .then(() => alert('Project link copied to clipboard!'))
              .catch(err => console.error('Failed to copy link: ', err));
          }}
          isLiked={isLiked} 
          isBookmarked={isBookmarked} 
          onBookmarkToggle={onToggleBookmark}
        />
      </div>
    </div>
  );
}