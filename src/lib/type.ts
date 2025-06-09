import { collabStatusType, ownershipType } from "@prisma/client";

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
	user: {
		id: string;
		name: string;
		username: string;
		photo_profile: string | null;
	};
	children: CommentsInProjectType[];
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

export interface UserProjectsCondition {
	is_archived: boolean;
	project_user: {
		some: {
			id_user: string | undefined;
			OR: Array<
				| { ownership: "OWNER" }
				| {
						AND: [{ ownership: "COLLABORATOR" }, { collabStatus: "ACCEPTED" }];
				  }
			>;
		};
	};
	pinProject?: {
		none: { id_user: string };
	};
}