import type {
	ProjectOneType,
	ProjectWithInteractionsType,
	UserSearchType,
} from "@/lib/type";
import type { collabStatusType, ownershipType } from "@prisma/client";

export function toProjectWithInteractionsDTO(input: {
	id: string;
	id_category?: string | null;
	slug: string;
	title: string;
	content: string;
	is_archived?: boolean | null;
	image1: string | null;
	image2: string | null;
	image3: string | null;
	image4: string | null;
	image5: string | null;
	video: string | null;
	count_likes: number;
	count_comments: number;
	link_figma: string | null;
	link_github: string | null;
	created_at: Date;
	updated_at: Date;
	category: { id: string; title: string; slug: string };
	project_user: Array<{
		user: { id: string; name: string; username: string; photo_profile: string | null };
	}>;
	bookmarks?: Array<{ id: string }> | null;
	LikeProject?: Array<{ id: string }> | null;
	// computed flags
	is_bookmarked?: boolean;
	is_liked?: boolean;
}): ProjectWithInteractionsType {
	return {
		id: input.id,
		id_category: input.id_category ?? input.category.id,
		slug: input.slug,
		title: input.title,
		content: input.content,
		is_archived: input.is_archived ?? false,
		image1: input.image1 ?? undefined,
		image2: input.image2 ?? undefined,
		image3: input.image3 ?? undefined,
		image4: input.image4 ?? undefined,
		image5: input.image5 ?? undefined,
		video: input.video ?? undefined,
		count_likes: input.count_likes,
		count_comments: input.count_comments,
		link_figma: input.link_figma ?? "",
		link_github: input.link_github ?? "" ,
		created_at: input.created_at.toISOString(),
		updated_at: input.updated_at.toISOString(),
		category: input.category,
		project_user: input.project_user.map((pu) => ({
			user: {
				...pu.user,
				photo_profile: pu.user.photo_profile ?? undefined,
			},
		})),
		bookmarks: input.bookmarks ?? undefined,
		LikeProject: input.LikeProject ?? undefined,
		is_bookmarked: input.is_bookmarked ?? !!input.bookmarks?.length,
		is_liked: input.is_liked ?? !!input.LikeProject?.length,
	};
}

export function toProjectOneDTO(input: {
	id: string;
	id_category: string;
	slug: string;
	title: string;
	content: string;
	is_archived: boolean;
	image1: string | null;
	image2: string | null;
	image3: string | null;
	image4: string | null;
	image5: string | null;
	video: string | null;
	count_likes: number;
	count_comments: number;
	link_figma: string | null;
	link_github: string | null;
	created_at: Date;
	updated_at: Date;
	category: { id: string; title: string; slug: string };
	project_user: Array<{
		user: { id: string; name: string; username: string; photo_profile: string | null };
		ownership: ownershipType;
		collabStatus: collabStatusType;
	}>;
	bookmarks?: Array<{ id: string }> | null;
	LikeProject?: Array<{ id: string }> | null;
}): ProjectOneType {
	return {
		id: input.id,
		id_category: input.id_category,
		slug: input.slug,
		title: input.title,
		content: input.content,
		is_archived: input.is_archived,
		image1: input.image1 ?? undefined,
		image2: input.image2 ?? undefined,
		image3: input.image3 ?? undefined,
		image4: input.image4 ?? undefined,
		image5: input.image5 ?? undefined,
		video: input.video ?? undefined,
		count_likes: input.count_likes,
		count_comments: input.count_comments,
		link_figma: input.link_figma ?? "",
		link_github: input.link_github ?? "",
		created_at: input.created_at.toISOString(),
		updated_at: input.updated_at.toISOString(),
		category: input.category,
		project_user: input.project_user.map((pu) => ({
			user: {
				...pu.user,
				photo_profile: pu.user.photo_profile ?? undefined,
			},
			ownership: pu.ownership,
			collabStatus: pu.collabStatus,
		})),
		is_bookmarked: !!input.bookmarks?.length,
		is_liked: !!input.LikeProject?.length,
	};
}

export function toUserSearchDTO(input: {
	name: string | null;
	username: string;
	photo_profile: string | null;
	github: string | null;
	instagram: string | null;
	linkedin: string | null;
	gender: string | null;
	count_summary: {
		count_project: number;
		count_follower: number;
		count_following: number;
	};
}): UserSearchType {
	return {
		name: input.name ?? "",
		username: input.username,
		photo_profile: input.photo_profile ?? "",
		github: input.github ?? "",
		instagram: input.instagram ?? "",
		linkedin: input.linkedin ?? "",
		gender: input.gender ?? "",
		count_summary: input.count_summary,
	};
}
