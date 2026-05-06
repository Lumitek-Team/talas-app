import { ProjectOneType } from "@/lib/type";

/**
 * Standardizes the transformation of project data for UI components.
 * Consolidates optimistic update logic to ensure consistency across feeds.
 */
export const transformProjectToPost = (
  project: ProjectOneType,
  optimisticLikes: Record<string, boolean> = {},
  optimisticBookmarks: Record<string, boolean> = {},
) => {
  const isLiked =
    optimisticLikes[project.id] !== undefined
      ? optimisticLikes[project.id]
      : project.is_liked;

  const isBookmarked =
    optimisticBookmarks[project.id] !== undefined
      ? optimisticBookmarks[project.id]
      : project.is_bookmarked;

  return {
    ...project,
    is_bookmarked: !!isBookmarked,
    is_liked: !!isLiked,
  };
};
