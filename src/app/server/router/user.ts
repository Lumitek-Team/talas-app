import { protectedProcedure, router } from "../trpc";
import prisma from "@/lib/prisma";
import {
	FollowingType,
	FollowerType,
	ProjectWithInteractionsType,
	RequestCollabType,
	SelectCollabType,
	UserProjectsCondition,
} from "@/lib/type";
import { retryConnect } from "@/lib/utils";
import { Notification } from "@prisma/client";
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
			const existingUser = await retryConnect(() =>
				prisma.user.findFirst({
					where: {
						OR: [{ id: input.id }, { email: input.email }],
					},
				})
			);

			let username = input.email.split("@")[0];

			// Pastikan username unik
			if (!existingUser) {
				let unique = false;
				let candidate = username;
				while (!unique) {
					const userWithUsername = await retryConnect(() =>
						prisma.user.findFirst({
							where: { username: candidate },
							select: { id: true },
						})
					);
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
					const user = await retryConnect(() =>
						prisma.user.create({
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
						})
					);

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
				// The original error message here was incorrect
				throw new Error("Error syncing user: " + error);
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
				const data = await retryConnect(() =>
					prisma.user.findMany({
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
					})
				);

				return {
					success: true,
					message: "Successfully get all users",
					data,
				};
			} catch (error) {
				throw new Error("Error fetching user: " + error);
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
				const data = await retryConnect(() =>
					prisma.user.findUnique({
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
					})
				);

				return {
					success: true,
					message: "Successfully get user",
					data,
				};
			} catch (error) {
				throw new Error("Error fetching user: " + error);
			}
		}),

	getByUsername: protectedProcedure
		.input(
			z.object({
				username: z.string(),
			})
		)
		.query(async ({ input }) => {
			try {
				const data = await retryConnect(() =>
					prisma.user.findFirst({
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
					})
				);

				return {
					success: true,
					message: "Successfully get user",
					data,
				};
			} catch (error) {
				throw new Error("Error fetching user: " + error);
			}
		}),

	getAllFollower: protectedProcedure
		.input(
			z.object({
				id_following: z.string(),
				limit: z.number().optional(),
				offset: z.number().optional(),
			})
		)
		.query(async ({ input }) => {
			try {
				const followers: FollowerType[] = await retryConnect(() =>
					prisma.follow.findMany({
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
					})
				);

				const data = followers.map((follow) => ({
					...follow.follower,
				}));

				return {
					success: true,
					message: "Successfully get all followers",
					data,
				};
			} catch (error) {
				throw new Error("Error fetching followers: " + error);
			}
		}),

	getAllFollowing: protectedProcedure
		.input(
			z.object({
				id_follower: z.string(),
				limit: z.number().optional(),
				offset: z.number().optional(),
			})
		)
		.query(async ({ input }) => {
			try {
				const followings: FollowingType[] = await retryConnect(() =>
					prisma.follow.findMany({
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
					})
				);

				const data = followings.map((follow) => ({
					...follow.following,
				}));

				return {
					success: true,
					message: "Successfully get all followings",
					data,
				};
			} catch (error) {
				throw new Error("Error fetching followings: " + error);
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
				const data = await retryConnect(() =>
					prisma.user.findFirst({
						where: {
							OR: [{ id: input.id }, { username: input.username }],
						},
						select: {
							photo_profile: true,
						},
					})
				);

				return {
					success: true,
					message: "Successfully get photo profile",
					data,
				};
			} catch (error) {
				throw new Error("Error fetching photoProfile: " + error);
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
		.mutation(async ({ input }) => {
			try {
				// Cek jika username ingin diubah, pastikan unik
				if (input.data.username) {
					const existing = await retryConnect(() =>
						prisma.user.findFirst({
							where: {
								username: input.data.username,
								id: { not: input.id },
							},
							select: { id: true },
						})
					);
					if (existing) {
						throw new Error("Username sudah digunakan oleh pengguna lain.");
					}
				}

				await retryConnect(() =>
					prisma.user.update({
						where: {
							id: input.id,
						},
						data: {
							...input.data,
						},
					})
				);

				const updatedUser = await retryConnect(() =>
					prisma.user.findUnique({
						where: {
							id: input.id,
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
					})
				);

				return {
					success: true,
					message: "Successfully updated user",
					data: updatedUser,
				};
			} catch (error) {
				throw new Error("Error updating user: " + error);
			}
		}),

	// use infinite query
	getBookmarked: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				id_user: z.string().optional(),
				limit: z.number().min(1).max(100).nullish(),
				cursor: z.string().nullish(),
			})
		)
		.query(async ({ input }) => {
			const limit = input.limit ?? 12;
			const { cursor } = input;
			try {
				const bookmarks = await retryConnect(() =>
					prisma.bookmark.findMany({
						where: {
							id_user: input.id,
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
							},
							created_at: true,
						},
					})
				);

				const hasNextPage = bookmarks.length > limit;
				const items = hasNextPage ? bookmarks.slice(0, -1) : bookmarks;

				return {
					items,
					nextCursor: hasNextPage ? items[items.length - 1].id : null,
				};
			} catch (error) {
				throw new Error("Error fetching bookmarks: " + error);
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
				const data: SelectCollabType[] = await retryConnect(() =>
					prisma.user.findMany({
						where: {
							id: { not: input.id_user }, // exclude self
							OR: [
								{ username: { contains: input.query } },
								{ name: { contains: input.query } },
							],
						},
						select: {
							id: true,
							name: true,
							username: true,
							photo_profile: true,
						},
					})
				);
				return {
					success: true,
					message: "Successfully get options for collaborator",
					data,
				};
			} catch (error) {
				throw new Error("Error fetching user: " + error);
			}
		}),

	getNotification: protectedProcedure
		.input(
			z.object({
				id_user: z.string(),
				limit: z.number().min(1).max(100).nullish(),
				cursor: z.string().nullish(),
			})
		)
		.query(async ({ input }) => {
			const limit = input.limit ?? 12;
			const { cursor } = input;

			const now = new Date();
			const oneMonthAgo = new Date();
			oneMonthAgo.setMonth(now.getMonth() - 1);

			try {
				const notifications: Notification[] = await retryConnect(() =>
					prisma.notification.findMany({
						where: {
							id_user: input.id_user,
							created_at: {
								gte: oneMonthAgo,
								lte: now,
							},
						},
						take: limit + 1,
						cursor: cursor ? { id: cursor } : undefined,
						orderBy: {
							created_at: "desc",
						},
					})
				);

				const hasNextPage = notifications.length > limit;
				const items = hasNextPage ? notifications.slice(0, -1) : notifications;
				return {
					items,
					nextCursor: hasNextPage ? items[items.length - 1].id : null,
				};
			} catch (error) {
				throw new Error("Error fetching notifications: " + error); // Fixed error message
			}
		}),

	getRequestCollab: protectedProcedure
		.input(z.string())
		.query(async ({ input }) => {
			try {
				const requests: RequestCollabType[] = await retryConnect(() =>
					prisma.projectUser.findMany({
						where: {
							id_user: input,
							collabStatus: "PENDING",
						},
						select: {
							id: true,
							created_at: true, // Ensure created_at is selected
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
										where: {
											id_user: { not: input },
											ownership: "OWNER",
										},
										select: {
											user: {
												select: {
													username: true,
													name: true,
													photo_profile: true,
												},
											},
										},
									},
								},
							},
						},
						orderBy: {
							created_at: "desc",
						},
					})
				);
				return {
					success: true,
					message: "Successfully get request collaboration",
					data: requests,
				};
			} catch (error) {
				throw new Error("Error fetching user: " + error);
			}
		}),

	getAllProjects: protectedProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(100).nullish(),
				cursor: z.string().nullish(),
				id_user: z.string().optional(),
				excludePinned: z.boolean().optional(),
			})
		)
		.query(async ({ input }) => {
			const limit = input.limit ?? 50;
			const { cursor, id_user, excludePinned } = input;

			try {
				const where: UserProjectsCondition = {
					is_archived: false,
					project_user: {
						some: {
							id_user: id_user,
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

				if (excludePinned && id_user) {
					where.pinProject = {
						none: { id_user: id_user },
					};
				}

				const projects = await retryConnect(() =>
					prisma.project.findMany({
						where,
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

				// Add is_bookmarked property
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
					message: "Successfully get all projects in user",
					data: ProjectWithInteractionsType,
					nextCursor,
				};
			} catch (error) {
				throw new Error("Error fetching projects: " + error);
			}
		}),

	getPinnedProjects: protectedProcedure
		.input(
			z.object({
				id_user: z.string(),
			})
		)
		.query(async ({ input }) => {
			const { id_user } = input;
			try {
				const pinnedProjects = await retryConnect(() =>
					prisma.project.findMany({
						where: {
							pinProject: {
								some: { id_user: id_user },
							},
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
								},
								orderBy: {
									created_at: "asc",
								},
							},
							bookmarks: {
								where: { id_user: id_user },
								select: { id: true },
							},
							LikeProject: {
								where: { id_user: id_user },
								select: { id: true },
							},
						},
						orderBy: {
							created_at: "desc",
						},
					})
				);

				const data = pinnedProjects.map((p: ProjectWithInteractionsType) => ({
					...p,
					is_bookmarked: p.bookmarks && p.bookmarks.length > 0,
					is_liked: p.LikeProject && p.LikeProject.length > 0,
				}));

				return {
					success: true,
					message: "Successfully get pinned projects",
					data,
				};
			} catch (error) {
				throw new Error("Error fetching pinned projects: " + error);
			}
		}),
});

export type UserRouter = typeof userRouter;
