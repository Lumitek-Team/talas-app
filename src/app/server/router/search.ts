import { protectedProcedure, router } from "../trpc";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { ProjectWithInteractionsType, UserSearchType } from "@/lib/type";
import { toProjectWithInteractionsDTO, toUserSearchDTO } from "@/lib/dto";
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
					case "PROJECT": {
						let category;
						if (input.category && input.category !== "__all__") {
							category = await prisma.category.findUnique({
								where: { slug: input.category },
								select: { id: true, title: true, slug: true },
							});
						}

						const projectWhere: Prisma.ProjectWhereInput = {
							is_archived: false,
						};

						if (input.search && input.search !== "__all__") {
							projectWhere.title = {
								contains: input.search,
								mode: "insensitive",
							};
						}
						if (category?.id) {
							projectWhere.id_category = category.id;
						}

						const projects = await prisma.project.findMany({
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
										ownership: true,
										collabStatus: true,
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
							skip: cursor ? 1 : 0,
							cursor: cursor ? { id: cursor } : undefined,
						});

						let nextCursor: typeof cursor | undefined = undefined;
						if (projects.length > limit) {
							const nextItem = projects.pop();
							nextCursor = nextItem!.id;
						}

						const projectItems: ProjectWithInteractionsType[] = projects.map((p) =>
							toProjectWithInteractionsDTO({
								...(p as unknown as Parameters<typeof toProjectWithInteractionsDTO>[0]),
								id_category: p.category.id,
								is_archived: false,
								is_bookmarked: id_user ? !!p.bookmarks?.length : false,
								is_liked: id_user ? !!p.LikeProject?.length : false,
							}),
						);

						return {
							success: true,
							message: "Successfully get projects",
							data: projectItems,
							nextCursor,
						};
					}

					case "USER": {
						if (!input.search) {
							return {
								success: true,
								message: "No search query provided",
								data: [],
								nextCursor: undefined,
							};
						}

						const users = await prisma.user.findMany({
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
								id: true,
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
							orderBy: [{ username: "asc" }],
							take: limit + 1,
							skip: cursor ? 1 : 0,
							cursor: cursor ? { id: cursor } : undefined,
						});

						let nextUserCursor: typeof cursor | undefined = undefined;
						if (users.length > limit) {
							const nextItem = users.pop();
							nextUserCursor = nextItem!.id;
						}

						const userItems: UserSearchType[] = users.map((u) =>
							toUserSearchDTO({
								...(u as unknown as Omit<Parameters<typeof toUserSearchDTO>[0], "count_summary">),
								count_summary: u.count_summary ?? {
									count_project: 0,
									count_follower: 0,
									count_following: 0,
								},
							}),
						);

						return {
							success: true,
							message: "Successfully get users",
							data: userItems,
							nextCursor: nextUserCursor,
						};
					}

					case "CATEGORY": {
						if (!input.search) {
							return {
								success: true,
								message: "No search query provided",
								data: [],
								nextCursor: undefined,
							};
						}

						const categories = await prisma.category.findMany({
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
							skip: cursor ? 1 : 0,
							cursor: cursor ? { id: cursor } : undefined,
						});
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
					}

					default:
						throw new TRPCError({
							code: "BAD_REQUEST",
							message: `Search type ${input.type} is not supported`,
						});
				}
			} catch (error) {
				throw error;
			}
		}),

	getPopularPost: protectedProcedure
		.input(
			z.object({
				id_user: z.string(),
			})
		)
		.query(async ({ input }: { input: { id_user: string } }) => {
			const { id_user } = input;
			try {
				const populars = await prisma.$queryRawUnsafe<
					{
						id: string;
						title: string;
						id_category: string;
						popularity_score: number;
						rank: number;
					}[]
				>(
					"SELECT * FROM ( SELECT id, title, id_category, popularity_score, RANK() OVER (PARTITION BY id_category ORDER BY popularity_score DESC) AS `rank` FROM project WHERE is_archived = false ) AS ranked_projects WHERE `rank` = 1;"
				);
				// Extract all popular project IDs
				const popularIds = populars.map((p) => p.id);

				// Fetch all projects with those IDs, including interactions
				const projectsFromDb = await prisma.project.findMany({
					where: {
						id: { in: popularIds },
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
								collabStatus: true,
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
				});

				const ProjectWithInteractionsType: ProjectWithInteractionsType[] =
					projectsFromDb.map((p) => ({
						...p,
						project_user: p.project_user.map((pu) => ({
							user: {
								...pu.user,
								photo_profile: pu.user.photo_profile ?? undefined,
							},
						})),
						image1: p.image1 ?? undefined,
						image2: p.image2 ?? undefined,
						image3: p.image3 ?? undefined,
						image4: p.image4 ?? undefined,
						image5: p.image5 ?? undefined,
						video: p.video ?? undefined,
						link_figma: p.link_figma ?? "",
						link_github: p.link_github ?? "",
						created_at: p.created_at.toISOString(),
						updated_at: p.updated_at.toISOString(),
						id_category: (p as { id_category?: string }).id_category ?? p.category.id,
						is_archived: false,
						is_bookmarked: id_user
							? p.bookmarks && p.bookmarks.length > 0
							: false,
						is_liked: id_user
							? p.LikeProject && p.LikeProject.length > 0
							: false,
					}));

				return {
					success: true,
					message: "Successfully get popular projects",
					data: ProjectWithInteractionsType,
				};
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: `Failed to get popular projects: ${
						error instanceof Error ? error.message : "Unknown error"
					}`,
				});
			}
		}),
});

export type SearchRouter = typeof searchRouter;
