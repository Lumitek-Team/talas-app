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
}

export interface CategoryType {
	id: string;
	slug: string;
	title: string;
	count_projects: number;
}
