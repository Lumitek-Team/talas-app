import { protectedProcedure, router } from "../trpc";
import prisma from "@/lib/prisma";
import { retryConnect } from "@/lib/utils";
import { z } from "zod";
import slugify from "slugify";

export const projectRouter = router({
	getOne: protectedProcedure
	.input(
		z.object({
			id: z.string(),
			id_user: z.string(),
		})
	).query(async ({ input }) => {
		try {
			const project = await retryConnect(() => 
				prisma.project.findFirst({
					where: {
						OR: [
							{ id: input.id },
							{ slug: input.id },
						],
						AND: [
							{
								OR: [
									{ is_archived: false },
									{ is_archived: true, project_user: { some: { id_user: input.id_user } } },
								],
							},
						],
					},
					select: {
						title: true,
						slug: true,
						content: true,
						image1: true,
						image2: true,
						image3: true,
						image4: true,
						image5: true,
						video: true,
						count_likes: true,
						count_comments: true,
						is_archived: true,
						created_at: true,
						updated_at: true,
						category: {
							select: {
								id: true,
								title: true,
								slug: true,
							},
						},
						project_user: {
							select: {
								user: {
									select: {
										name: true,
										username: true,
										photo_profile: true,
									},
								},
							},
						},
					},
				})
			);

			return project;
		} catch (error) {
			throw new Error("Error fetching project: " + error);
		}
	}),

	checkSlug: protectedProcedure
	.input(z.string())
	.query(async ({ input }) => {
		try {
			const project = await retryConnect(() =>
				prisma.project.findFirst({
					where: {
						slug: input,
					},
				})
			);

			return project ? true : false;
		} catch (error) {
			throw new Error("Error checking slug: " + error);
		}
	}),

	create: protectedProcedure
		.input(
			z.object({
				id_user: z.string(),
				id_category: z.string(),
				title: z.string(),
				content: z.string().min(1),
				is_archived: z.boolean().default(false),
				image1: z.any().optional(),
				image2: z.any().optional(),
				image3: z.any().optional(),
				image4: z.any().optional(),
				image5: z.any().optional(),
				video: z.any().optional(),
			})
		)
		.mutation(async ({ input }) => {
			let slug = slugify(input.title, {
				lower: true,
				strict: true,
			});

			const existingSlug = await retryConnect(() =>
				prisma.project.findFirst({
					where: {
						slug: slug,
					},
				})
			);

			if (existingSlug) {
				slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
			}

			try {
				const newProject = await retryConnect(() =>
					prisma.project.create({
						data: {
							id_category: input.id_category,
							title: input.title,
							slug: slug,
							is_archived: input.is_archived,
							content: input.content,
							image1: input.image1,
							image2: input.image2,
							image3: input.image3,
							image4: input.image4,
							image5: input.image5,
							video: input.video,
						},
					})
				);

				await retryConnect(() =>
					prisma.projectUser.create({
						data: {
							id_user: input.id_user,
							id_project: newProject.id,
						},
					})
				);

				await retryConnect(() =>
					prisma.category.update({
						where: {
							id: input.id_category,
						},
						data: {
							count_projects: {
								increment: 1,
							},
						},
					})
				);

				await retryConnect(() =>
					prisma.count_summary.update({
						where: {
							id_user: input.id_user,
						},
						data: {
							count_project: {
								increment: 1,
							},
						},
					})
				);

				return newProject;
			} catch (error) {
				throw new Error("Error creating project: " + error);
			}
		}),
});

export type UserRouter = typeof projectRouter;
