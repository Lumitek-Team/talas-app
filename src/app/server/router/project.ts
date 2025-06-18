// src/app/server/router/project.ts

import { protectedProcedure, router } from "../trpc";
import prisma from "@/lib/prisma";
import { retryConnect, getPublicUrl } from "@/lib/utils";
import { z } from "zod";
import slugify from "slugify";
import {
	CommentsInProjectType,
	ProjectOnArchiveType,
	ProjectOneType,
	ProjectOnMutationType,
	ProjectWithInteractionsType,
} from "@/lib/type";
import { collabStatusType, ownershipType } from "@prisma/client";
import { deleteImages } from "@/lib/imageUtils";

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
											AND: [
												{ is_archived: true },
												{
													project_user: {
														some: {
															id_user: input.id_user,
															ownership: "OWNER",
														},
													},
												},
											],
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
									ownership: true,
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
							LikeProject: input.id_user
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
					is_liked: input.id_user
						? data.LikeProject && data.LikeProject.length > 0
						: false,
				};

				return {
					success: true,
					message: "Successfully get project",
					data: project,
				};
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
									ownership: true,
								},
								where: {
									OR: [
										{
											ownership: "OWNER",
										},
										{
											ownership: "COLLABORATOR",
											collabStatus: "ACCEPTED",
										},
									],
								},
								orderBy: {
									created_at: "asc",
								},
							},
							bookmarks: id_user
								? {
										where: { id_user: id_user },
										select: { id: true },
								  }
								: false,
							LikeProject: id_user
								? {
										where: { id_user: id_user },
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
				// Add is_bookmarked property
				const ProjectWithInteractionsType = projectsFromDb.map(
					(p: ProjectWithInteractionsType) => ({
						...p,
						is_bookmarked: id_user
							? p.bookmarks && p.bookmarks.length > 0
							: false,
						is_liked: id_user
							? p.LikeProject && p.LikeProject.length > 0
							: false,
					})
				);

				return {
					projects: ProjectWithInteractionsType,
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
							project_user: {
								some: {
									id_user: id_user,
									ownership: "OWNER",
								},
							},
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
					projects: projects,
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
				collaborators: z
					.array(
						z.object({
							id: z.string(),
							name: z.string(),
							username: z.string(),
							photo_profile: z.string().optional(),
						})
					)
					.optional(),
				link_figma: z.string().optional().nullable(),
				link_github: z.string().optional().nullable(),
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

			const imagesToGetUrl = [
				input.image1,
				input.image2,
				input.image3,
				input.image4,
				input.image5,
			];
			const imagesWithUrls: string[] = [];
			for (const image of imagesToGetUrl) {
				// getPublicUrl for all imagesToGetUrl
				if (image) {
					imagesWithUrls.push(await getPublicUrl(image));
				}
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
							image1: imagesWithUrls[0],
							image2: imagesWithUrls[1] || null,
							image3: imagesWithUrls[2] || null,
							image4: imagesWithUrls[3] || null,
							image5: imagesWithUrls[4] || null,
							video: input.video,
							link_figma: input.link_figma,
							link_github: input.link_github,
						},
					})
				);

				const ownerCollab = {
					id_user: input.id_user,
					id_project: newProject.id,
					ownership: ownershipType.OWNER,
					collabStatus: collabStatusType.ACCEPTED,
				};

				const collaboratorUsers = input.collaborators || [];

				const dataCollab = [
					ownerCollab,
					...collaboratorUsers.map((collab) => ({
						id_user: collab.id,
						id_project: newProject.id,
						ownership: ownershipType.COLLABORATOR,
						collabStatus: collabStatusType.PENDING,
					})),
				];

				if (dataCollab.length > 0) {
					await retryConnect(() =>
						prisma.projectUser.createMany({
							data: dataCollab,
						})
					);
				}

				await retryConnect(() =>
					prisma.$transaction([
						prisma.category.update({
							where: { id: input.id_category },
							data: { count_projects: { increment: 1 } },
						}),
						// FIX: Changed 'update' to 'upsert' for robustness.
						// This will now create the count_summary record if it doesn't exist.
						prisma.count_summary.upsert({
							where: { id_user: input.id_user },
							// This runs if the record IS found
							update: { count_project: { increment: 1 } },
							// This runs if the record is NOT found
							create: { id_user: input.id_user, count_project: 1 },
						}),
					])
				);

				return {
					success: true,
					message: "Successfully create project",
					data: newProject,
				};
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
				const existingProject: ProjectOnMutationType = await retryConnect(() =>
					prisma.project.findFirst({
						where: {
							id: input.id,
						},
						include: {
							project_user: {
								select: {
									id_user: true,
									ownership: true,
									collabStatus: true,
								},
							},
						},
					})
				);

				const ownerUser = existingProject?.project_user.find(
					(pu) => pu.ownership === "OWNER"
				);

				if (
					!existingProject ||
					!ownerUser ||
					ownerUser.id_user !== input.id_user
				) {
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

				return {
					success: true,
					message: "Successfully edit project",
					data: updatedProject,
				};
			} catch (error) {
				console.error("Error editing project:", error);
				throw new Error("Error editing project: " + (error as Error).message);
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
				const existingProject: ProjectOnMutationType = await retryConnect(() =>
					prisma.project.findFirst({
						where: {
							id: input.id,
						},
						include: {
							project_user: {
								select: {
									id_user: true,
									ownership: true,
									collabStatus: true,
								},
							},
						},
					})
				);

				const ownerUser = existingProject?.project_user.find(
					(pu) => pu.ownership === "OWNER"
				);

				if (
					!existingProject ||
					!ownerUser ||
					ownerUser.id_user !== input.id_user
				) {
					throw new Error("Project not found or access denied.");
				}

				const images = [
					existingProject.image1,
					existingProject.image2,
					existingProject.image3,
					existingProject.image4,
					existingProject.image5,
				].filter(Boolean) as string[];

				await deleteImages(images);

				await retryConnect(() =>
					prisma.$transaction([
						prisma.project.delete({
							where: { id: input.id },
						}),
						prisma.comment.deleteMany({
							where: { id_project: input.id },
						}),
						prisma.category.update({
							where: { id: existingProject.id_category },
							data: { count_projects: { decrement: 1 } },
						}),
						// FIX: Changed 'update' to 'updateMany' for resilience.
						// This will no longer throw an error if the count_summary record doesn't exist.
						prisma.count_summary.updateMany({
							where: { id_user: input.id_user },
							data: { count_project: { decrement: 1 } },
						}),
					])
				);

				return {
					success: true,
					message: "Successfully delete project",
				};
			} catch (error) {
				throw new Error("Error deleting project: " + error);
			}
		}),

	getComments: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				id_user: z.string().optional(), // Include id_user for is_liked
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
							count_like: true,
							user: {
								select: {
									id: true,
									name: true,
									username: true,
									photo_profile: true,
								},
							},
							LikeComment: input.id_user
								? {
										where: { id_user: input.id_user },
										select: { id: true },
								  }
								: false,
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
						is_liked: input.id_user
							? comment.LikeComment && comment.LikeComment.length > 0
							: false,
						children: commentMap[comment.id]?.children || [],
					};
					commentMap[comment.id] = commentWithChildren;

					if (comment.parent_id) {
						const parent = commentMap[comment.parent_id];
						if (parent) {
							parent.children.push(commentWithChildren);
							parent.reply_count = (parent.reply_count || 0) + 1;
						} else {
							commentMap[comment.parent_id] = {
								id: comment.parent_id,
								content: "",
								created_at: "",
								updated_at: "",
								parent_id: null,
								count_like: 0,
								is_liked: false,
								user: { id: "", name: "", username: "", photo_profile: null },
								children: [commentWithChildren],
								reply_count: 1,
							};
						}
					} else {
						commentWithChildren.reply_count =
							commentWithChildren.children.length;
						roots.push(commentWithChildren);
					}
				}

				return {
					success: true,
					message: "Successfully all comment in project",
					data: roots,
				};
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
				const existingProject: ProjectOnArchiveType = await retryConnect(() =>
					prisma.project.findFirst({
						where: {
							id: input.id,
						},
						select: {
							id: true,
							id_category: true,
							project_user: {
								select: {
									id_user: true,
									ownership: true,
								},
							},
						},
					})
				);

				const ownerUser = existingProject?.project_user.find(
					(pu) => pu.ownership === "OWNER"
				);

				if (
					!existingProject ||
					!ownerUser ||
					ownerUser.id_user !== input.id_user
				) {
					throw new Error("Project not found or access denied.");
				}

				const [project] = await retryConnect(() =>
					prisma.$transaction([
						prisma.project.update({
							where: { id: input.id },
							data: { is_archived: true },
						}),
						prisma.category.update({
							where: { id: existingProject.id_category },
							data: { count_projects: { decrement: 1 } },
						}),
						prisma.count_summary.updateMany({
							where: { id_user: input.id_user },
							data: { count_project: { decrement: 1 } },
						}),
					])
				);

				return {
					success: true,
					message: "Successfully archiving project",
					data: project,
				};
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
				const existingProject: ProjectOnArchiveType = await retryConnect(() =>
					prisma.project.findFirst({
						where: {
							id: input.id,
						},
						select: {
							id: true,
							id_category: true,
							project_user: {
								select: {
									id_user: true,
									ownership: true,
								},
							},
						},
					})
				);

				const ownerUser = existingProject?.project_user.find(
					(pu) => pu.ownership === "OWNER"
				);

				if (
					!existingProject ||
					!ownerUser ||
					ownerUser.id_user !== input.id_user
				) {
					throw new Error("Project not found or access denied.");
				}

				const [project] = await retryConnect(() =>
					prisma.$transaction([
						prisma.project.update({
							where: { id: input.id },
							data: { is_archived: false },
						}),
						prisma.category.update({
							where: { id: existingProject.id_category },
							data: { count_projects: { increment: 1 } },
						}),
						prisma.count_summary.updateMany({
							where: { id_user: input.id_user },
							data: { count_project: { increment: 1 } },
						}),
					])
				);

				return {
					success: true,
					message: "Successfully publishing project",
					data: project,
				};
			} catch (error) {
				throw new Error("Error unarchiving project: " + error);
			}
		}),
});

export type ProjectRouter = typeof projectRouter;
