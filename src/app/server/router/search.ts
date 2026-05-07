import { publicProcedure, router } from "../trpc";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { ProjectOneType, ProjectWithInteractionsType, UserSearchType } from "@/lib/type";
import { toProjectOneDTO, toUserSearchDTO } from "@/lib/dto";
import { Prisma } from "@prisma/client";

export const searchRouter = router({
  search: publicProcedure
    .input(
      z.object({
        search: z.string().max(100).optional(),
        type: z.enum(["PROJECT", "USER", "CATEGORY"]),
        category: z.string().optional(),
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
        id_user: z.string().optional(), // kept for compatibility but should be ignored in favor of ctx.auth.userId
      }),
    )
    .query(async ({ input, ctx }) => {
      const limit = input.limit ?? 50;
      const { cursor } = input;
      const currentUserId = ctx.auth.userId;

		try {
			switch (input.type) {
				case "PROJECT": {
					const projectWhere: Prisma.ProjectWhereInput = {
            is_archived: false,
          };

				if (input.search && input.search !== "__all__") {
					projectWhere.title = {
						contains: input.search,
						mode: "insensitive",
					};
				}
				// Filter by category slug directly via relation — no extra round-trip needed
				if (input.category && input.category !== "__all__") {
					projectWhere.category = { slug: input.category };
				}

				const projects = await prisma.project.findMany({
					where: projectWhere,
					select: {
						id: true,
						id_category: true,
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
								collabStatus: true,
							},
							orderBy: {
								created_at: "asc",
							},
						},
						bookmarks: currentUserId
							? {
									where: { id_user: currentUserId },
									select: { id: true },
							  }
							: false,
						LikeProject: currentUserId
							? {
									where: { id_user: currentUserId },
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

				const projectItems: ProjectOneType[] = projects.map((p) =>
					toProjectOneDTO({
						...p,
						bookmarks: "bookmarks" in p ? (p.bookmarks as { id: string }[] | undefined) : undefined,
						LikeProject: "LikeProject" in p ? (p.LikeProject as { id: string }[] | undefined) : undefined,
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
						...u,
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
			if (error instanceof TRPCError) throw error;
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Error performing search: " + (error instanceof Error ? error.message : String(error)),
			});
		}
	}),

	getPopularPost: publicProcedure
		.input(
			z.object({
				id_user: z.string().optional(), // kept for compatibility but should be ignored in favor of ctx.auth.userId
			})
		)
		.query(async ({ ctx }) => {
			const currentUserId = ctx.auth.userId;
			try {
				// Fetch the most popular project for each category using 'distinct'
				// This is much more efficient than fetching all projects and filtering in memory.
				const projectsFromDb = await prisma.project.findMany({
					where: { is_archived: false },
					distinct: ["id_category"],
					orderBy: [
						{ id_category: "asc" },
						{ popularity_score: "desc" },
					],
					select: {
						id: true,
						id_category: true,
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
						bookmarks: currentUserId
							? {
									where: { id_user: currentUserId },
									select: { id: true },
							  }
							: false,
						LikeProject: currentUserId
							? {
									where: { id_user: currentUserId },
									select: { id: true },
							  }
							: false,
					},
				});

				const projectWithInteractionsItems: ProjectWithInteractionsType[] =
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
 					id_category: p.id_category ?? p.category.id,
 					is_archived: false,
 					is_bookmarked: currentUserId
 						? p.bookmarks && p.bookmarks.length > 0
 						: false,
 					is_liked: currentUserId
 						? p.LikeProject && p.LikeProject.length > 0
 						: false,
 				}));

        return {
          success: true,
          message: "Successfully get popular projects",
          data: projectWithInteractionsItems,
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
