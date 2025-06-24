// components/home/organisms/post-card.tsx

"use client";

import { PostHeader } from "../molecules/post-header";
import { PostActions } from "../molecules/post-actions";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Github, Figma } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from 'date-fns';
import { useToast } from "@/contexts/toast-context";
import { PostCardDisplayType, ProjectOneType } from "@/lib/type";
import { parse } from 'date-fns';

interface PostCardProps<T extends Partial<ProjectOneType> = ProjectOneType> {
  data: T;
  onToggleLike: () => void;
  onToggleBookmark: () => void;
  displayContext?: 'saved-page' | string;
}

export function PostCard<T extends Partial<ProjectOneType>>({
  data,
  onToggleLike,
  onToggleBookmark,
  displayContext,
}: PostCardProps<T>) {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const { showToast } = useToast(); // This should work now

  const allDisplayImages = [];
  if (data?.image1) allDisplayImages.push(data.image1);
  if (data?.image2) allDisplayImages.push(data.image2);
  if (data?.image3) allDisplayImages.push(data.image3);
  if (data?.image4) allDisplayImages.push(data.image4);
  if (data?.image5) allDisplayImages.push(data.image5);

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

  // const handleCardClick = (e: React.MouseEvent) => {
  //   const target = e.target as HTMLElement;
  //   // Prevents navigation if a link or button within the card is clicked
  //   if (target.closest('a, button, [data-prevent-card-click="true"]')) {
  //     return;
  //   }
  //   if (data.slug) {
  //     router.push(`/project/${data.slug}`);
  //   } else {
  //     router.push(`/project/${data.id}`);
  //   }
  // };

  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (data.slug) {
      router.push(`/project/${data.slug}#comments`);
    } else {
      router.push(`/project/${data.id}#comments`);
    }
  };

  let formattedTimestamp: string;

  if (data.created_at) {
    const parsedDate = new Date(data.created_at);
    if (!isNaN(parsedDate.getTime())) {
      formattedTimestamp = formatDistanceToNow(parsedDate, { addSuffix: true });
    } else {
      formattedTimestamp = 'Invalid date';
    }
  } else {
    formattedTimestamp = 'Unknown time';
  }


  const postActionsVariant = displayContext === 'saved-page' ? 'bookmark-only' : 'full';

  const handleShare = () => {
    const projectUrl = `${window.location.origin}/project/${data.slug || data.id}`;
    navigator.clipboard.writeText(projectUrl)
      .then(() => {
        showToast('Project link copied to clipboard!', 'success');
      })
      .catch(err => {
        console.error('Failed to copy link: ', err);
        showToast('Failed to copy link', 'error');
      });
  };

  // find user where ownership is 'OWNER'
  const ownerObj =
    data.project_user?.find(user => user.ownership === 'OWNER') ??
    data.project_user?.[0];
  const owner = ownerObj?.user;
  return (
    <div
      className={`p-4 ${isMobile ? 'bg-background' : ''}`}
    >
      <PostHeader
        username={owner ? owner.name : 'Unknown User'}
        countCollaborators={data.project_user && data.project_user.length - 1}
        userRole={owner ? owner.username : 'UnknownUser'}
        avatarSrc={owner && owner.photo_profile ? owner.photo_profile : '/img/dummy/avatar-dummy.jpg'}
        timestamp={formattedTimestamp}
      />

      <div className="mb-6">
        {/* This div acts as a block-level container for the title link */}
        <div>
          <Link
            href={`/project/${data.slug || data.id}`}
            onClick={(e) => e.stopPropagation()}
            data-prevent-card-click="true"
          >
            <h2 className="text-lg font-bold hover:text-primary transition-colors duration-200 inline-block">
              {data.title}
            </h2>
          </Link>
        </div>
        {data.category && (
          // Ensure the category is also a block-level element
          <p className="text-sm text-muted-foreground mb-3">
            {data.category.title}
          </p>
        )}
        <p className="text-white text-sm whitespace-pre-line">
          {data.content}
        </p>

        {(data.link_figma || data.link_github) && (
          <div className="flex gap-3 mt-3" onClick={e => e.stopPropagation()} data-prevent-card-click="true">
            {data.link_figma && (
              <Link
                href={data.link_figma}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white transition-all duration-200 transform active:scale-90"
              >
                <Figma size={16} className="w-4 h-4 transition-transform duration-200" />
                <span>Figma</span>
              </Link>
            )}
            {data.link_github && (
              <Link
                href={data.link_github}
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
          className={`grid gap-2 mb-4 ${allDisplayImages.length === 1 ? 'grid-cols-1' :
            allDisplayImages.length === 2 ? 'grid-cols-2' :
              allDisplayImages.length === 3 ? 'grid-cols-3' :
                allDisplayImages.length === 4 ? 'grid-cols-2' : 'grid-cols-3'
            }`}
          onClick={e => e.stopPropagation()} // Prevent card click
          data-prevent-card-click="true"
        >
          {allDisplayImages.slice(0, 5).map((imagePath, index) => {
            return (
              <div
                key={index}
                className={`aspect-video bg-muted rounded-md overflow-hidden relative ${(allDisplayImages.length === 3 && index === 0) ? 'md:col-span-3 row-span-2' :
                  (allDisplayImages.length === 5 && index === 0) ? 'col-span-3 md:col-span-2 row-span-2' :
                    (allDisplayImages.length === 5 && (index === 1 || index === 2)) ? 'col-span-1 md:col-span-1 row-span-1' :
                      (allDisplayImages.length > 3 && index > 0 && allDisplayImages.length % 2 !== 0 && index === allDisplayImages.length - 1) ? 'col-span-2' :
                        ''
                  } ${isMobile && allDisplayImages.length > 2 && index === 0 ? 'col-span-full' : ''}`}
              >
                <Image
                  src={imagePath}
                  alt={`${data.title || 'Project'} image ${index + 1}`}
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

      <div className="pt-2" onClick={e => e.stopPropagation()} data-prevent-card-click="true">
        <PostActions
          likes={data.count_likes ?? 0}
          comments={data.count_comments ?? 0}
          onLikeToggle={onToggleLike}
          onComment={handleCommentClick}
          onShare={handleShare}
          isLiked={data.is_liked ?? false}
          isBookmarked={
            displayContext === 'saved-page' ? true : (data.is_bookmarked ?? false)
          }
          onBookmarkToggle={onToggleBookmark}
          variant={postActionsVariant}
        />
      </div>
    </div>
  );
}