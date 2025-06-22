import { collabStatusType, ownershipType } from "@prisma/client";
import { getPublicUrl } from "./utils";

export interface ProjectWithInteractionsType {
	id: string;
	id_category: string;
	slug: string;
	title: string;
	content: string;
	is_archived: boolean;
	image1?: string;
	image2?: string;
	image3?: string;
	image4?: string;
	image5?: string;
	video?: string;
	count_likes: number;
	count_comments: number;
	link_figma: string;
	link_github: string;
	created_at: string;
	updated_at: string;
	category: {
		id: string;
		title: string;
		slug: string;
	};
	project_user: {
		user: {
			id: string;
			name: string;
			username: string;
			photo_profile?: string;
		};
	}[];
	bookmarks?: { id: string }[];
	LikeProject?: { id: string }[];
	is_bookmarked: boolean;
	is_liked: boolean;
}

export interface UserSearchType {
	name: string;
	username: string;
	photo_profile: string;
	github: string;
	instagram: string;
	linkedin: string;
	gender: string;
	count_summary: {
		count_project: number;
		count_follower: number;
		count_following: number;
	};
}

export interface ProjectWithBookmarks {
	id: string;
	id_category: string;
	slug: string;
	title: string;
	content: string;
	is_archived: boolean;
	image1?: string;
	image2?: string;
	image3?: string;
	image4?: string;
	image5?: string;
	video?: string;
	count_likes: number;
	count_comments: number;
	link_figma: string;
	link_github: string;
	created_at: string;
	updated_at: string;
	category: {
		id: string;
		title: string;
		slug: string;
	};
	project_user: {
		user: {
			id: string;
			name: string;
			username: string;
			photo_profile?: string;
		};
	}[];
	bookmarks?: { id: string }[];
	LikeProject?: { id: string }[];
}

export interface ProjectOneType {
	id: string;
	id_category: string;
	slug: string;
	title: string;
	content: string;
	is_archived: boolean;
	image1?: string;
	image2?: string;
	image3?: string;
	image4?: string;
	image5?: string;
	video?: string;
	count_likes: number;
	count_comments: number;
	link_figma: string;
	link_github: string;
	created_at: string;
	updated_at: string;
	is_bookmarked?: boolean;
	is_liked?: boolean;
	category: {
		id: string;
		title: string;
		slug: string;
	};
	project_user: {
		user: {
			id: string;
			name: string;
			username: string;
			photo_profile?: string;
		};
		ownership: ownershipType;
		collabStatus: collabStatusType;
	}[];
}

export interface ProjectOnMutationType {
	id: string;
	id_category: string;
	slug: string;
	title: string;
	content: string;
	is_archived: boolean;
	image1?: string;
	image2?: string;
	image3?: string;
	image4?: string;
	image5?: string;
	video?: string;
	link_github: string;
	link_figma: string;
	count_likes: number;
	count_comments: number;
	created_at: string;
	updated_at: string;
	project_user: {
		id_user: string;
		ownership: ownershipType;
		collabStatusType?: collabStatusType;
	}[];
}

export interface ProjectOnArchiveType {
	id: string;
	id_category: string;
	project_user: {
		id_user: string;
		ownership: string;
	}[];
}

export interface CategoryType {
	id: string;
	slug: string;
	title: string;
	count_projects: number;
}

export type CommentsInProjectType = {
	id: string;
	content: string;
	created_at: string;
	updated_at: string;
	parent_id: string | null;
	count_like: number;
	is_liked?: boolean; // Add is_liked property
	user: {
		id: string;
		name: string;
		username: string;
		photo_profile: string | null;
	};
	children: CommentsInProjectType[];
	reply_count?: number; // Add reply_count property
};

export type BookmarkType = {
	id: string;
	id_user: string;
	project: {
		id: string;
		title: string;
		slug: string;
		image1?: string;
		image2?: string;
		image3?: string;
		image4?: string;
		image5?: string;
		created_at: string;
		updated_at: string;
		project_user: {
			user: {
				id: string;
				username: string;
				name: string;
				photo_profile?: string;
			};
		}[];
	};
};

export interface FollowerType {
	follower: {
		username: string;
		name: string;
		photo_profile: string | null;
	};
}

export interface FollowingType {
	following: {
		username: string;
		name: string;
		photo_profile: string | null;
	};
}

export interface SelectCollabType {
	id: string;
	name: string;
	username: string;
	photo_profile?: string;
}

export interface RequestCollabType {
	id: string;
	project: {
		id: string;
		title: string;
		slug: string;
		image1?: string;
		image2?: string;
		image3?: string;
		image4?: string;
		image5?: string;
		project_user: {
			user: {
				username: string;
				name: string;
				photo_profile?: string | null;
			};
		}[];
	};
}

export interface UserSearchType {
	name: string;
	username: string;
	photo_profile: string;
	github: string;
	instagram: string;
	linkedin: string;
	gender: string;
	count_summary: {
		count_project: number;
		count_follower: number;
		count_following: number;
	};
}

export type PostCardDisplayType = {
  id: string;
  slug: string;
  title: string;
  username: string;
  userRole: string;
  avatarSrc: string;
  timestamp: string;
  content: string;
  image1?: string;
  image2?: string;
  image3?: string;
  image4?: string;
  image5?: string;
  likes: number;
  comments: number;
  link_figma: string;
  link_github: string;
  category: {
    id: string;
    title: string;
    slug: string;
  };
  isLiked: boolean;
  isBookmarked: boolean;
};

export const transformProjectToPost = (
  project: ProjectOneType,
  optimisticLikes: Record<string, boolean>,
  optimisticBookmarks: Record<string, boolean>
): PostCardDisplayType => {
  const primaryUser = project.project_user && project.project_user[0]?.user;

  const resolvedAvatarSrc = primaryUser?.photo_profile
    ? getPublicUrl(primaryUser.photo_profile)
    : "/img/dummy/profile-photo-dummy.jpg";

  const isLiked = optimisticLikes[project.id] !== undefined
    ? optimisticLikes[project.id]
    : project.is_liked || false;

  const isBookmarked = optimisticBookmarks[project.id] !== undefined
    ? optimisticBookmarks[project.id]
    : project.is_bookmarked || false;

  return {
    id: project.id,
    slug: project.slug,
    title: project.title,
    username: primaryUser?.username || "Unknown User",
    userRole: "Developer",
    avatarSrc: resolvedAvatarSrc,
    timestamp: project.created_at,
    content: project.content,
    image1: project.image1 ? getPublicUrl(project.image1) : undefined,
    image2: project.image2 ? getPublicUrl(project.image2) : undefined,
    image3: project.image3 ? getPublicUrl(project.image3) : undefined,
    image4: project.image4 ? getPublicUrl(project.image4) : undefined,
    image5: project.image5 ? getPublicUrl(project.image5) : undefined,
    likes: project.count_likes,
    comments: project.count_comments,
    link_figma: project.link_figma,
    link_github: project.link_github,
    category: project.category,
    isLiked,
    isBookmarked,
  };
};
