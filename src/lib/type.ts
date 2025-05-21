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
