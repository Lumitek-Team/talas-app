import { protectedProcedure, router } from "../trpc";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { retryConnect } from "@/lib/utils";
import { ProjectWithInteractionsType, UserSearchType } from "@/lib/type";
import { Prisma } from "@prisma/client";

export const searchRouter = router({
	search: protectedProcedure
		.input(
			z.object({
				search: z.string().max(100).optional(),
				type: z.enum(["PROJECT", "USER", "CATEGORY"]),
				category: z.string().optional(),
				limit: z.number().min(1).max(100).nullish(),
				cursor: z.string().nullish(),
				id_user: z.string(),
			})
		)
		.query(async ({ input }) => {
			const limit = input.limit ?? 50;
			const { cursor, id_user } = input;

			try {
				switch (input.type) {
					case "PROJECT":
						let category;
						if (input.category && input.category !== "__all__") {
							category = await retryConnect(() =>
								prisma.category.findUnique({
									where: { slug: input.category },
									select: { id: true, title: true, slug: true },
								})
							);
						}

						const projectWhere: Prisma.ProjectWhereInput = {
							is_archived: false,
						};

						// Handle search and category logic
						if (input.search && input.search !== "__all__") {
							projectWhere.title = {
								contains: input.search,
								mode: "insensitive",
							};
						}
						if (category?.id) {
							projectWhere.id_category = category.id;
						}

						const projects = await retryConnect(() =>
							prisma.project.findMany({
								where: projectWhere,
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
						if (projects.length > limit) {
							const nextItem = projects.pop();
							nextCursor = nextItem!.id;
						}

						const ProjectWithInteractionsType = projects.map(
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
							success: true,
							message: "Successfully get projects",
							data: ProjectWithInteractionsType,
							nextCursor,
						};

					case "USER":
						// search boleh kosong/null, jika kosong return []
						if (!input.search) {
							return {
								success: true,
								message: "No search query provided",
								data: [],
								nextCursor: undefined,
							};
						}
						const users: UserSearchType[] = await retryConnect(() =>
							prisma.user.findMany({
								where: {
									OR: [
										{
											name: {
												contains: input.search,
												mode: "insensitive",
											},
										},
										{
											username: {
												contains: input.search,
												mode: "insensitive",
											},
										},
									],
								},
								select: {
									name: true,
									username: true,
									photo_profile: true,
									github: true,
									instagram: true,
									linkedin: true,
									gender: true,
									count_summary: {
										select: {
											count_project: true,
											count_follower: true,
											count_following: true,
										},
									},
								},
								orderBy: [
									{ count_summary: { count_project: "desc" } },
									{ count_summary: { count_follower: "desc" } },
									{ count_summary: { count_following: "desc" } },
								],
								take: limit + 1,
								cursor: cursor ? { id: cursor } : undefined,
							})
						);

						let nextUserCursor: typeof cursor | undefined = undefined;
						if (users.length > limit) {
							const nextItem = users.pop();
							nextUserCursor = nextItem!.username;
						}

						return {
							success: true,
							message: "Successfully get users",
							data: users,
							nextCursor: nextUserCursor,
						};

					case "CATEGORY":
						// search boleh kosong/null, jika kosong return []
						if (!input.search) {
							return {
								success: true,
								message: "No search query provided",
								data: [],
								nextCursor: undefined,
							};
						}
						const categories = await retryConnect(() =>
							prisma.category.findMany({
								where: {
									title: {
										contains: input.search,
										mode: "insensitive",
									},
								},
								select: {
									id: true,
									title: true,
									slug: true,
									count_projects: true,
								},
								orderBy: {
									created_at: "desc",
								},
								take: limit + 1,
								cursor: cursor ? { id: cursor } : undefined,
							})
						);
						let nextCategoryCursor: typeof cursor | undefined = undefined;
						if (categories.length > limit) {
							const nextItem = categories.pop();
							nextCategoryCursor = nextItem!.id;
						}
						return {
							success: true,
							message: "Successfully get categories",
							data: categories,
							nextCursor: nextCategoryCursor,
						};

					default:
						throw new TRPCError({
							code: "BAD_REQUEST",
							message: `Search type ${input.type} is not supported`,
						});
				}
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: `Failed to search: ${
						error instanceof Error ? error.message : "Unknown error"
					}`,
				});
			}
		}),
});

export type SearchRouter = typeof searchRouter;