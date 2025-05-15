import { protectedProcedure, router } from "../trpc";
import prisma from "@/lib/prisma";
import { retryConnect, deleteImage } from "@/lib/utils";
import { z } from "zod";
import slugify from "slugify";
import { getTrpcCaller } from "@/app/_trpc/server";
import { CommentsInProjectType } from "@/lib/type";

export const projectRouter = router({
	getOne: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				id_user: z.string(),
			})
		)
		.query(async ({ input }) => {
			try {
				const project = await retryConnect(() =>
					prisma.project.findFirst({
						where: {
							OR: [{ id: input.id }, { slug: input.id }],
							AND: [
								{
									OR: [
										{ is_archived: false },
										{
											is_archived: true,
											project_user: { some: { id_user: input.id_user } },
										},
									],
								},
							],
						},
						select: {
							id: true,
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
							link_figma: true,
							link_github: true,
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
											id: true,
											name: true,
											username: true,
											photo_profile: true,
										},
									},
								},
								orderBy: {
									created_at: "asc",
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

	getAll: protectedProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(100).nullish(),
				cursor: z.string().nullish(),
			})
		)
		.query(async ({ input }) => {
			const limit = input.limit ?? 50;
			const { cursor } = input;

			try {
				const projects = await retryConnect(() =>
					prisma.project.findMany({
						where: {
							is_archived: false,
						},
						select: {
							id: true,
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
							link_figma: true,
							link_github: true,
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
											id: true,
											name: true,
											username: true,
											photo_profile: true,
										},
									},
								},
								orderBy: {
									created_at: "asc",
								},
							},
						},
						orderBy: {
							created_at: "desc",
						},
						take: limit + 1,
						cursor: cursor ? { id: cursor } : undefined,
					})
				);
				let nextCursor: typeof cursor | undefined = undefined;

				if (projects.length > limit) {
					const nextItem = projects.pop();
					nextCursor = nextItem!.id;
				}

				return {
					projects,
					nextCursor,
				};
			} catch (error) {
				throw new Error("Error fetching projects: " + error);
			}
		}),

	checkSlug: protectedProcedure.input(z.string()).query(async ({ input }) => {
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
				link_figma: z.string().optional(),
				link_github: z.string().optional(),
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
							link_figma: input.link_figma,
							link_github: input.link_github,
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

	edit: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				id_user: z.string(),
				id_category: z.string().optional(),
				title: z.string().optional(),
				content: z.string().optional(),
				link_figma: z.string().optional(),
				link_github: z.string().optional(),
			})
		)
		.mutation(async ({ input }) => {
			try {
				const existingProject = await retryConnect(() =>
					prisma.project.findFirst({
						where: {
							id: input.id,
							project_user: {
								some: { id_user: input.id_user },
							},
						},
					})
				);

				if (!existingProject) {
					throw new Error("Project not found or access denied.");
				}

				let updatedSlug = existingProject.slug;
				if (input.title && input.title !== existingProject.title) {
					updatedSlug = slugify(input.title, {
						lower: true,
						strict: true,
					});

					const existingSlug = await retryConnect(() =>
						prisma.project.findFirst({
							where: {
								slug: updatedSlug,
								NOT: { id: input.id },
							},
						})
					);

					if (existingSlug) {
						updatedSlug = `${updatedSlug}-${Math.floor(Math.random() * 1000)}`;
					}
				}

				if (
					input.id_category &&
					input.id_category !== existingProject.id_category
				) {
					await retryConnect(() =>
						prisma.$transaction([
							prisma.category.update({
								where: { id: existingProject.id_category },
								data: { count_projects: { decrement: 1 } },
							}),
							prisma.category.update({
								where: { id: input.id_category },
								data: { count_projects: { increment: 1 } },
							}),
						])
					);
				}

				const updatedProject = await retryConnect(() =>
					prisma.project.update({
						where: { id: input.id },
						data: {
							id_category: input.id_category ?? existingProject.id_category,
							title: input.title ?? existingProject.title,
							slug: updatedSlug,
							content: input.content ?? existingProject.content,
							link_figma: input.link_figma ?? existingProject.link_figma,
							link_github: input.link_github ?? existingProject.link_github,
						},
					})
				);

				return updatedProject;
			} catch (error) {
				throw new Error("Error editing project: " + error);
			}
		}),
	delete: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				id_user: z.string(),
			})
		)
		.mutation(async ({ input }) => {
			try {
				const existingProject = await (
					await getTrpcCaller()
				).project.getOne({
					id: input.id,
					id_user: input.id_user,
				});

				if (!existingProject) {
					throw new Error("Project not found.");
				}
				if (existingProject.project_user[0].user.id !== input.id_user) {
					throw new Error("Project access denied.");
				}

				// delete all images in this project from storage
				const images = [
					existingProject.image1,
					existingProject.image2,
					existingProject.image3,
					existingProject.image4,
					existingProject.image5,
				].filter(Boolean);

				for (const imagePath of images) {
					await deleteImage(imagePath);
				}

				await retryConnect(() =>
					prisma.$transaction([
						prisma.project.delete({
							where: { id: input.id },
						}),
						prisma.comment.deleteMany({
							where: { id_project: input.id },
						}),
						prisma.category.update({
							where: { id: existingProject.category.id }, // Ensure id_category is valid
							data: { count_projects: { decrement: 1 } },
						}),
						prisma.count_summary.update({
							where: { id_user: input.id_user },
							data: { count_project: { decrement: 1 } },
						}),
					])
				);
			} catch (error) {
				throw new Error("Error deleting project: " + error);
			}
		}),

	getComments: protectedProcedure
		.input(
			z.object({
				id: z.string(),
			})
		)
		.query(async ({ input }) => {
			try {
				const comments = await retryConnect(() =>
					prisma.comment.findMany({
						where: {
							id_project: input.id,
						},
						select: {
							id: true,
							content: true,
							created_at: true,
							updated_at: true,
							parent_id: true,
							user: {
								select: {
									id: true,
									name: true,
									username: true,
									photo_profile: true,
								},
							},
						},
						orderBy: {
							created_at: "desc",
						},
					})
				);

				const commentMap: Record<string, CommentsInProjectType> = {};
				const roots: CommentsInProjectType[] = [];

				for (const comment of comments) {
					const commentWithChildren: CommentsInProjectType = {
						...comment,
						children: commentMap[comment.id]?.children || [],
					};
					commentMap[comment.id] = commentWithChildren;

					if (comment.parent_id) {
						const parent = commentMap[comment.parent_id];
						if (parent) {
							parent.children.push(commentWithChildren);
						} else {
							commentMap[comment.parent_id] = {
								id: comment.parent_id,
								content: "",
								created_at: "",
								updated_at: "",
								parent_id: null,
								user: {
									id: "",
									name: "",
									username: "",
									photo_profile: null,
								},
								children: [commentWithChildren],
							};
						}
					} else {
						roots.push(commentWithChildren);
					}
				}

				return roots;
			} catch (error) {
				throw new Error("Error fetching comments: " + error);
			}
		}),
});

export type UserRouter = typeof projectRouter;
