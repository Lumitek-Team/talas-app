import { protectedProcedure, publicProcedure, router } from "../trpc";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import {
	FollowingType,
	FollowerType,
	ProjectOneType,
	RequestCollabType,
	SelectCollabType,
	UserProjectsCondition,
} from "@/lib/type";
import { toProjectOneDTO } from "@/lib/dto";
import { z } from "zod";

export const userRouter = router({
	syncWithSupabase: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string(),
				email: z.string().email(),
				auth_type: z.string(),
				photo_profile: z.string(),
			})
		)
		.mutation(async ({ input }) => {
			const existingUser = await prisma.user.findFirst({
				where: {
					OR: [{ id: input.id }, { email: input.email }],
				},
			});

			let username = input.email.split("@")[0];

			// Pastikan username unik
			if (!existingUser) {
				let unique = false;
				let candidate = username;
				while (!unique) {
					const userWithUsername = await prisma.user.findFirst({
						where: { username: candidate },
						select: { id: true },
					});
					if (!userWithUsername) {
						username = candidate;
						unique = true;
					} else {
						const randomDigits = Math.floor(100 + Math.random() * 900); // 3 digit
						candidate = `${username}-${randomDigits}`;
					}
				}
			}

			try {
				if (!existingUser) {
					// FIX: Use a nested create to make the User and their count_summary at the same time.
					const user = await prisma.user.create({
						data: {
							id: input.id,
							username: username,
							name: input.name,
							email: input.email,
							auth_type: input.auth_type,
							photo_profile: input.photo_profile,
							// This line creates the associated count_summary record automatically
							count_summary: {
								create: {},
							},
						},
					});

					return {
						success: true,
						message: "Successfully synced user with Supabase",
						data: user,
					};
				} else {
					// User already exists, no action needed
					return {
						success: true,
						message: "User already exists.",
						data: existingUser,
					};
				}
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error syncing user: " + (error instanceof Error ? error.message : String(error)),
				});
			}
		}),

	getAll: protectedProcedure
		.input(
			z
				.object({
					limit: z.number().optional(),
					offset: z.number().optional(),
				})
				.optional()
		)
		.query(async ({ input }) => {
			try {
				const data = await prisma.user.findMany({
					take: input?.limit,
					skip: input?.offset,
					select: {
						username: true,
						name: true,
						bio: true,
						photo_profile: true,
						instagram: true,
						linkedin: true,
						github: true,
						gender: true,
						email_contact: true,
					},
				});

				return {
					success: true,
					message: "Successfully get all users",
					data,
				};
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error fetching users: " + (error instanceof Error ? error.message : String(error)),
				});
			}
		}),

	getById: protectedProcedure
		.input(
			z.object({
				id: z.string(),
			})
		)
		.query(async ({ input }) => {
			try {
				const data = await prisma.user.findUnique({
					where: {
						id: input.id,
					},
					select: {
						id: true,
						username: true,
						name: true,
						bio: true,
						photo_profile: true,
						instagram: true,
						linkedin: true,
						github: true,
						gender: true,
						email_contact: true,
						count_summary: {
							select: {
								count_project: true,
								count_follower: true,
								count_following: true,
								all_notif_read: true,
							},
						},
					},
				});

				if (!data) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "User not found",
					});
				}

				return {
					success: true,
					message: "Successfully get user",
					data,
				};
			} catch (error) {
				if (error instanceof TRPCError) throw error;
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error fetching user: " + (error instanceof Error ? error.message : String(error)),
				});
			}
		}),

	getByUsername: publicProcedure
		.input(
			z.object({
				username: z.string(),
			})
		)
		.query(async ({ input }) => {
			try {
				const data = await prisma.user.findFirst({
					where: {
						username: input.username,
					},
					select: {
						id: true,
						username: true,
						name: true,
						bio: true,
						photo_profile: true,
						instagram: true,
						linkedin: true,
						github: true,
						gender: true,
						email_contact: true,
						count_summary: {
							select: {
								count_project: true,
								count_follower: true,
								count_following: true,
							},
						},
					},
				});

				if (!data) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "User not found",
					});
				}

				return {
					success: true,
					message: "Successfully get user",
					data,
				};
			} catch (error) {
				if (error instanceof TRPCError) throw error;
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error fetching user by username: " + (error instanceof Error ? error.message : String(error)),
				});
			}
		}),

	getAllFollower: publicProcedure
		.input(
			z.object({
				id_following: z.string(),
				limit: z.number().optional(),
				offset: z.number().optional(),
			})
		)
		.query(async ({ input }) => {
			try {
				const followers: FollowerType[] = await prisma.follow.findMany({
					where: {
						id_following: input.id_following,
					},
					take: input.limit,
					skip: input.offset,
					select: {
						follower: {
							select: {
								username: true,
								name: true,
								photo_profile: true,
							},
						},
					},
				});

				const data = followers.map((follow) => ({
					...follow.follower,
				}));

				return {
					success: true,
					message: "Successfully get all followers",
					data,
				};
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error fetching followers: " + (error instanceof Error ? error.message : String(error)),
				});
			}
		}),

	getAllFollowing: publicProcedure
		.input(
			z.object({
				id_follower: z.string(),
				limit: z.number().optional(),
				offset: z.number().optional(),
			})
		)
		.query(async ({ input }) => {
			try {
				const followings: FollowingType[] = await prisma.follow.findMany({
					where: {
						id_follower: input.id_follower,
					},
					take: input.limit,
					skip: input.offset,
					select: {
						following: {
							select: {
								username: true,
								name: true,
								photo_profile: true,
							},
						},
					},
				});

				const data = followings.map((follow) => ({
					...follow.following,
				}));

				return {
					success: true,
					message: "Successfully get all followings",
					data,
				};
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error fetching followings: " + (error instanceof Error ? error.message : String(error)),
				});
			}
		}),

	getPhotoProfile: protectedProcedure
		.input(
			z.object({
				id: z.string().optional(),
				username: z.string().optional(),
			})
		)
		.query(async ({ input }) => {
			try {
				const data = await prisma.user.findFirst({
					where: {
						OR: [{ id: input.id }, { username: input.username }],
					},
					select: {
						photo_profile: true,
					},
				});

				return {
					success: true,
					message: "Successfully get photo profile",
					data,
				};
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error fetching photo profile: " + (error instanceof Error ? error.message : String(error)),
				});
			}
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				data: z.object({
					username: z.string().optional(),
					name: z.string().optional(),
					bio: z.string().optional(),
					photo_profile: z.string().optional(),
					instagram: z.string().optional(),
					linkedin: z.string().optional(),
					github: z.string().optional(),
					gender: z.enum(["MALE", "FEMALE"]).nullish(),
					email_contact: z.string().optional(),
				}),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const performerId = (ctx.auth.userId ?? input.id).trim();
			const targetId = input.id.trim();

			if (performerId !== targetId) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You can only update your own profile",
				});
			}

			try {
				if (input.data.username) {
					const existing = await prisma.user.findFirst({
						where: {
							username: input.data.username,
							id: { not: targetId },
						},
						select: { id: true },
					});
					if (existing) {
						throw new TRPCError({
							code: "CONFLICT",
							message: "Username already in use",
						});
					}
				}

				const updatedUser = await prisma.user.update({
					where: { id: targetId },
					data: {
						...input.data,
					},
					select: {
						username: true,
						name: true,
						bio: true,
						photo_profile: true,
						instagram: true,
						linkedin: true,
						github: true,
						gender: true,
						email_contact: true,
						count_summary: {
							select: {
								count_project: true,
								count_follower: true,
								count_following: true,
								all_notif_read: true,
							},
						},
					},
				});

				return {
					success: true,
					message: "Successfully updated user",
					data: updatedUser,
				};
			} catch (error) {
				if (error instanceof TRPCError) throw error;
				if (error instanceof Prisma.PrismaClientKnownRequestError) {
					if (error.code === "P2025") {
						throw new TRPCError({
							code: "NOT_FOUND",
							message: "User not found",
						});
					}
				}
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error updating user: " + (error instanceof Error ? error.message : String(error)),
				});
			}
		}),

	getBookmarked: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				id_user: z.string().optional(), // kept for compatibility but ignored
				limit: z.number().min(1).max(100).nullish(),
				cursor: z.string().nullish(),
			})
		)
		.query(async ({ input, ctx }) => {
			const limit = input.limit ?? 12;
			const { cursor } = input;
			const currentUserId = ctx.auth.userId;
			const targetUserId = input.id;

			// Optional: Allow users to only see their own bookmarks if private,
			// but currently bookmarks seem public in this app's logic.
			// Let's keep it consistent with the existing implementation.

			try {
				const bookmarksFromDb = await prisma.bookmark.findMany({
					where: {
						id_user: targetUserId,
					},
					take: limit + 1,
					cursor: cursor ? { id: cursor } : undefined,
					orderBy: {
						created_at: "desc",
					},
					select: {
						id: true,
						id_user: true,
						project: {
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
						},
						created_at: true,
					},
				});

				const hasNextPage = bookmarksFromDb.length > limit;
				const itemsFromDb = hasNextPage ? bookmarksFromDb.slice(0, -1) : bookmarksFromDb;

				const items = itemsFromDb.map((b) => ({
					id: b.id,
					id_user: b.id_user,
					created_at: b.created_at.toISOString(),
					project: {
						...b.project,
						image1: b.project.image1 ?? undefined,
						image2: b.project.image2 ?? undefined,
						image3: b.project.image3 ?? undefined,
						image4: b.project.image4 ?? undefined,
						image5: b.project.image5 ?? undefined,
						created_at: b.project.created_at.toISOString(),
						updated_at: b.project.updated_at.toISOString(),
						project_user: b.project.project_user.map((pu) => ({
							user: {
								id: pu.user.id,
								username: pu.user.username,
								name: pu.user.name,
								photo_profile: pu.user.photo_profile ?? undefined,
							},
							ownership: pu.ownership,
							collabStatus: pu.collabStatus ?? "ACCEPTED",
						})),
					},
				}));

				return {
					items,
					nextCursor: hasNextPage ? items[items.length - 1].id : null,
				};
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error fetching bookmarks: " + (error instanceof Error ? error.message : String(error)),
				});
			}
		}),

	getSelectCollab: protectedProcedure
		.input(
			z.object({
				query: z.string(),
				id_user: z.string(),
			})
		)
		.query(async ({ input }) => {
			try {
				const data: SelectCollabType[] = (await prisma.user.findMany({
					where: {
						id: { not: input.id_user },
						OR: [
							{ username: { contains: input.query, mode: "insensitive" } },
							{ name: { contains: input.query, mode: "insensitive" } },
						],
					},
					select: {
						id: true,
						name: true,
						username: true,
						photo_profile: true,
					},
					take: 10,
				}))
					.map((u) => ({
						...u,
						photo_profile: u.photo_profile ?? undefined,
					}));

				return {
					success: true,
					message: "Successfully get options for collaborator",
					data,
				};
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error searching collaborators: " + (error instanceof Error ? error.message : String(error)),
				});
			}
		}),

	getNotification: protectedProcedure
		.input(
			z.object({
				id_user: z.string().optional(),
				limit: z.number().min(1).max(100).nullish(),
				cursor: z.string().nullish(),
			})
		)
		.query(async ({ input, ctx }) => {
			const limit = input.limit ?? 12;
			const { cursor } = input;
			const performerId = ctx.auth.userId ?? input.id_user;

			if (!performerId) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "User ID is required",
				});
			}

			// Trim both sides to handle trailing spaces from malformed frontend requests
			if (input.id_user && performerId.trim() !== input.id_user.trim()) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You can only view your own notifications",
				});
			}

			const now = new Date();
			const oneMonthAgo = new Date();
			oneMonthAgo.setMonth(now.getMonth() - 1);

			try {
				const notifications = await prisma.notification.findMany({
					where: {
						id_user: performerId.trim(),
						created_at: {
							gte: oneMonthAgo,
							lte: now,
						},
					},
					select: {
						id: true,
						title: true,
						is_read: true,
						type: true,
						created_at: true,
						id_user: true,
					},
					take: limit + 1,
					cursor: cursor ? { id: cursor } : undefined,
					orderBy: {
						created_at: "desc",
					},
				});

				const hasNextPage = notifications.length > limit;
				const items = hasNextPage ? notifications.slice(0, -1) : notifications;
				return {
					items,
					nextCursor: hasNextPage ? items[items.length - 1].id : null,
				};
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error fetching notifications: " + (error instanceof Error ? error.message : String(error)),
				});
			}
		}),

	getRequestCollab: protectedProcedure
		.input(z.string().optional())
		.query(async ({ input, ctx }) => {
			const performerId = ctx.auth.userId ?? input;
			
			if (!performerId) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "User ID is required",
				});
			}

			if (input && performerId.trim() !== input.trim()) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You can only view your own collaboration requests",
				});
			}

			try {
				const requestsFromDb = await prisma.projectUser.findMany({
					where: {
						id_user: performerId.trim(),
						collabStatus: "PENDING",
					},
					select: {
						id: true,
						created_at: true,
						project: {
							select: {
								id: true,
								title: true,
								slug: true,
								image1: true,
								image2: true,
								image3: true,
								image4: true,
								image5: true,
								project_user: {
									select: {
										user: {
											select: {
												username: true,
												name: true,
												photo_profile: true,
											},
										},
									},
									where: { ownership: "OWNER" },
								},
							},
						},
					},
				});

				const requests: RequestCollabType[] = requestsFromDb.map((r) => ({
						id: r.id,
						created_at: r.created_at.toISOString(),
						project: {
							id: r.project.id,
							title: r.project.title,
							slug: r.project.slug,
							image1: r.project.image1 ?? undefined,
							image2: r.project.image2 ?? undefined,
							image3: r.project.image3 ?? undefined,
							image4: r.project.image4 ?? undefined,
							image5: r.project.image5 ?? undefined,
							project_user: r.project.project_user.map((pu) => ({
								user: {
									username: pu.user.username,
									name: pu.user.name,
									photo_profile: pu.user.photo_profile ?? undefined,
								},
							})),
						},
					}));

				return {
					success: true,
					message: "Successfully fetched collaboration requests",
					data: requests,
				};
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error fetching collaboration requests: " + (error instanceof Error ? error.message : String(error)),
				});
			}
		}),

	getAllProjects: publicProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(100).nullish(),
				cursor: z.string().nullish(),
				id_user: z.string().optional(),
				excludePinned: z.boolean().optional(),
			}),
		)
		.query(async ({ input, ctx }) => {
			const limit = input.limit ?? 50;
			const { cursor, excludePinned } = input;
			const currentUserId = ctx.auth.userId;
			const targetUserId = input.id_user ?? currentUserId;

			if (!targetUserId) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "User ID is required",
				});
			}

			try {
				const where: UserProjectsCondition = {
					is_archived: currentUserId && currentUserId === targetUserId ? undefined : false,
					project_user: {
						some: {
							id_user: targetUserId,
							OR: [
								{ ownership: "OWNER" },
								{
									AND: [
										{ ownership: "COLLABORATOR" },
										{ collabStatus: "ACCEPTED" },
									],
								},
							],
						},
					},
				};

				if (excludePinned) {
					where.pinProject = {
						none: { id_user: targetUserId },
					};
				}

				const projectsFromDb = await prisma.project.findMany({
					where,
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
					cursor: cursor ? { id: cursor } : undefined,
				});

				let nextCursor: typeof cursor | undefined = undefined;
				if (projectsFromDb.length > limit) {
					const nextItem = projectsFromDb.pop();
					nextCursor = nextItem!.id;
				}

				const data: ProjectOneType[] = projectsFromDb.map((p) =>
					toProjectOneDTO({
						...p,
						bookmarks: "bookmarks" in p ? (p.bookmarks as { id: string }[] | undefined) : undefined,
						LikeProject: "LikeProject" in p ? (p.LikeProject as { id: string }[] | undefined) : undefined,
					}),
				);

				return {
					success: true,
					message: "Successfully fetched user projects",
					data,
					nextCursor,
				};
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error fetching user projects: " + (error instanceof Error ? error.message : String(error)),
				});
			}
		}),

	getPinnedProjects: publicProcedure
		.input(
			z.object({
				id_user: z.string().optional(),
			})
		)
		.query(async ({ input, ctx }) => {
			const currentUserId = ctx.auth.userId;
			const targetUserId = input.id_user ?? currentUserId;
			
			if (!targetUserId) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "User ID is required",
				});
			}

			try {
				const pinnedProjectsFromDb = await prisma.project.findMany({
					where: {
						pinProject: {
							some: { id_user: targetUserId },
						},
						is_archived: currentUserId && currentUserId === targetUserId ? undefined : false,
					},
					select: {
						id: true,
						id_category: true,
						slug: true,
						title: true,
						content: true,
						is_archived: true,
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
 						bookmarks: currentUserId ? {
 							where: { id_user: currentUserId },
 							select: { id: true },
 						} : false,
 						LikeProject: currentUserId ? {
 							where: { id_user: currentUserId },
 							select: { id: true },
 						} : false,
 					},
 					orderBy: {
 						created_at: "desc",
 					},
 				});

				const data: ProjectOneType[] = pinnedProjectsFromDb.map((p) =>
					toProjectOneDTO({
						...p,
						bookmarks: "bookmarks" in p ? (p.bookmarks as { id: string }[] | undefined) : undefined,
						LikeProject: "LikeProject" in p ? (p.LikeProject as { id: string }[] | undefined) : undefined,
					}),
				);

				return {
					success: true,
					message: "Successfully fetched pinned projects",
					data,
				};
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error fetching pinned projects: " + (error instanceof Error ? error.message : String(error)),
				});
			}
		}),
});

export type UserRouter = typeof userRouter;
