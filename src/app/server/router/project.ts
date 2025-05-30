// lib/trpc/routes/project.ts (or your actual path)
import { protectedProcedure, router } from "../trpc";
import prisma from "@/lib/prisma";
import { retryConnect, deleteImage } from "@/lib/utils";
import { z } from "zod";
import slugify from "slugify";
import { getTrpcCaller } from "@/app/_trpc/server";
import {
	CommentsInProjectType,
	ProjectOneType,
	ProjectWithBookmarks,
} from "@/lib/type";

export const projectRouter = router({
	getOne: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				id_user: z.string(), // id_user is used for checking bookmark and like status
			})
		)
		.query(async ({ input }) => {
			try {
				const data = await retryConnect(() =>
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
							bookmarks: input.id_user
								? {
										where: { id_user: input.id_user },
										select: { id: true },
								  }
								: false,
							LikeProject: input.id_user // Add this to select LikeProject relation
								? {
										where: { id_user: input.id_user },
										select: { id: true },
								  }
								: false,
						},
					})
				);

				if (!data) return null;

				const project: ProjectOneType = {
					...data,
					is_bookmarked: input.id_user
						? data.bookmarks && data.bookmarks.length > 0
						: false,
					is_liked: input.id_user // Calculate is_liked based on LikeProject
						? data.LikeProject && data.LikeProject.length > 0
						: false,
				};

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
				id_user: z.string().optional(), 
			})
		)
		.query(async ({ input }) => {
			const limit = input.limit ?? 50;
			const { cursor, id_user } = input;

			try {
				const projectsFromDb = await retryConnect(() =>
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
							bookmarks: id_user
								? {
										where: { id_user },
										select: { id: true },
									}
								: false,
									LikeProject: id_user // Add this section
										? {
												where: { id_user },
												select: { id: true },
											}
										: false,
						},
						orderBy: {
							created_at: "desc",
						},
						take: limit + 1,
						cursor: cursor ? { id: cursor } : undefined,
					})
				);

				let nextCursor: typeof cursor | undefined = undefined;

				if (projectsFromDb.length > limit) {
					const nextItem = projectsFromDb.pop();
					nextCursor = nextItem!.id;
				}

				const projects = projectsFromDb.map(
					(p: any) => ({
						...p,
						is_bookmarked: id_user
							? p.bookmarks && p.bookmarks.length > 0
							: false,
                        is_liked: id_user // Add this logic
                            ? p.LikeProject && p.LikeProject.length > 0
                            : false,
					})
				);

				return {
					projects: projects as ProjectOneType[], // Cast to ensure type safety if ProjectOneType includes is_liked
					nextCursor,
				};
			} catch (error) {
				throw new Error("Error fetching projects: " + error);
			}
		}),

	getArchived: protectedProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(100).nullish(),
				cursor: z.string().nullish(),
				id_user: z.string().optional(),
			})
		)
		.query(async ({ input }) => {
			const limit = input.limit ?? 50;
			const { cursor, id_user } = input;

			try {
				const projects = await retryConnect(() =>
					prisma.project.findMany({
						where: {
							is_archived: true,
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

				const filteredProjects = id_user
					? projects.filter(
							(p: ProjectOneType) => // Assuming ProjectOneType matches this structure
								p.project_user.length > 0 &&
								p.project_user[0].user.id === id_user
					  )
					: projects;

				let nextCursor: typeof cursor | undefined = undefined;

				if (filteredProjects.length > limit) {
					const nextItem = filteredProjects.pop();
					nextCursor = nextItem!.id;
				}

				return {
					projects: filteredProjects,
					nextCursor,
				};
			} catch (error) {
				throw new Error("Error fetching archived projects: " + error);
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
				// MODIFICATION: Added .url() for consistency and .nullable() to accept null
				link_figma: z.string().url().optional().nullable(), 
				link_github: z.string().url().optional().nullable(),
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
							link_figma: input.link_figma, // Prisma handles null correctly here
							link_github: input.link_github, // Prisma handles null correctly here
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
				link_figma: z.string().url().optional().nullable(),
				link_github: z.string().url().optional().nullable(),
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
					const slugCheck = await retryConnect(() =>
						prisma.project.findFirst({
							where: {
								slug: updatedSlug,
								NOT: { id: input.id },
							},
						})
					);
					if (slugCheck) {
						updatedSlug = `${updatedSlug}-${Math.floor(Math.random() * 1000)}`;
					}
				}

				if (input.id_category && input.id_category !== existingProject.id_category) {
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
				
				const updateData: {
					id_category?: string;
					title?: string;
					slug: string; 
					content?: string;
					link_figma?: string | null;
					link_github?: string | null;
				} = {
					slug: updatedSlug,
				};

				if (input.id_category !== undefined) {
					updateData.id_category = input.id_category;
				}
				if (input.title !== undefined) {
					updateData.title = input.title;
				}
				if (input.content !== undefined) {
					updateData.content = input.content;
				}
				if (input.link_figma !== undefined) {
					updateData.link_figma = input.link_figma;
				}
				if (input.link_github !== undefined) {
					updateData.link_github = input.link_github;
				}

				const updatedProject = await retryConnect(() =>
					prisma.project.update({
						where: { id: input.id },
						data: updateData,
					})
				);

				return updatedProject;
			} catch (error) {
				console.error("Error editing project:", error);
				throw new Error("Error editing project: " + error.message);
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
				
				if (!existingProject.project_user || existingProject.project_user.length === 0 || existingProject.project_user[0].user.id !== input.id_user) {
					throw new Error("Project access denied for deletion.");
				}

				const images = [
					existingProject.image1,
					existingProject.image2,
					existingProject.image3,
					existingProject.image4,
					existingProject.image5,
				].filter(Boolean) as string[]; 

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
							where: { id: existingProject.category.id },
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
							// This case handles children whose parents might not be in the current fetched batch
							// or creates a placeholder if strictly needed.
							// For a flat list processed into a tree, ensure all comments are fetched.
							commentMap[comment.parent_id] = {
								id: comment.parent_id,
								content: "", // Placeholder
								created_at: "", // Placeholder
								updated_at: "", // Placeholder
								parent_id: null, // Placeholder
								user: { id: "", name: "", username: "", photo_profile: null }, // Placeholder
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

	archive: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				id_user: z.string(),
			})
		)
		.mutation(async ({ input }) => {
			try {
				const existingProject = await retryConnect(() =>
					prisma.project.findFirst({
						where: {
							id: input.id,
						},
						select: {
							id: true,
							project_user: {
								select: {
									id_user: true,
								},
								orderBy: {
									created_at: "asc",
								},
								take: 1,
							},
						},
					})
				);

				if (
					!existingProject ||
					!existingProject.project_user.length ||
					existingProject.project_user[0].id_user !== input.id_user
				) {
					throw new Error("Project not found or access denied.");
				}

				await retryConnect(() =>
					prisma.project.update({
						where: { id: input.id },
						data: { is_archived: true },
					})
				);
			} catch (error) {
				throw new Error("Error archiving project: " + error);
			}
		}),
	unarchive: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				id_user: z.string(),
			})
		)
		.mutation(async ({ input }) => {
			try {
				const existingProject = await retryConnect(() =>
					prisma.project.findFirst({
						where: {
							id: input.id,
						},
						select: {
							id: true,
							project_user: {
								select: {
									id_user: true,
								},
								orderBy: {
									created_at: "asc",
								},
								take: 1,
							},
						},
					})
				);

				if (
					!existingProject ||
					!existingProject.project_user.length ||
					existingProject.project_user[0].id_user !== input.id_user
				) {
					throw new Error("Project not found or access denied.");
				}

				await retryConnect(() =>
					prisma.project.update({
						where: { id: input.id },
						data: { is_archived: false },
					})
				);
			} catch (error) {
				throw new Error("Error unarchiving project: " + error);
			}
		}),
});

// The export type should match the router name for consistency
export type ProjectRouter = typeof projectRouter; // Changed from UserRouter to ProjectRouter