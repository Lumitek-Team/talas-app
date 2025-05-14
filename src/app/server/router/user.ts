import { protectedProcedure, router } from "../trpc";
import prisma from "@/lib/prisma";
import { retryConnect } from "@/lib/utils";
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
			}))
		.mutation(async ({ input }) => {
			const existingUser = await retryConnect(() =>
				prisma.user.findFirst({
					where: {
						OR: [{ id: input.id }, { email: input.email }],
					},
				})
			);

			const username = input.email.split("@")[0];
			if (!existingUser) {
				return await prisma.user.create({
					data: {
						id: input.id,
						username: username,
						name: input.name,
						email: input.email,
						auth_type: input.auth_type,
						photo_profile: input.photo_profile,
					},
				});
			}
		}),

	getAll: protectedProcedure
		.input(
			z.object({
				limit: z.number().optional(),
				offset: z.number().optional(),
			}).optional()
		)
		.query(async ({ input }) => {
			try {
				
				const data =  await prisma.user.findMany({
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
					}
				});
	
				return data;
			} catch (error) {
				throw new Error("Error fetching user: " + error)
			}
		}),

	getById: protectedProcedure
		.input(
			z.object({
				id: z.string()
			})
		)
		.query(async ({ input }) => {
			try {
				
				const data = await prisma.user.findUnique({
					where: {
						id: input.id
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
					}
				})
	
				return data;
			} catch (error) {
				throw new Error("Error fetching user: " + error)
			}
		}),

	getByUsername: protectedProcedure
		.input(
			z.object({
				username: z.string()
			})
		)
		.query(async ({ input }) => {
			try {
				const data = await prisma.user.findFirst({
					where: {
						username: input.username,
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
							},
						},
					}
				})
	
				return data;
			} catch (error) {
				throw new Error("Error fetching user: " + error)
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
				const followers = await prisma.follow.findMany({
					where: {
						id_following: input.id_following
					},
					take: input.limit,
					skip: input.offset,
					select: {
						follower: {
							select: {
								username: true,
								name: true,
								photo_profile: true,
							}
						}
					}
				})

				const data = followers.map(follow => ({
					...follow.follower
				}))

				return data;
			} catch (error) {
				throw new Error("Error fetching followers: " + error)
			}
		}),

	
	updateFollowing: protectedProcedure
		.input(
			z.object({
				id_user: z.string(),
			})
		)
		.mutation(async ({ input }) => {
			try {
				const followingCount = await prisma.follow.count({
					where: {
						id_follower: input.id_user
					}
				})

				const updatedSummary = await prisma.count_summary.update({
					where: {
						id_user: input.id_user,
					},
					data: {
						count_following: followingCount,
					},
					select: {
						count_following: true,
					}
				})

				return updatedSummary
			} catch (error) {
				throw new Error("Error updating following: " + error)
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
				const followings = await prisma.follow.findMany({
					where: {
						id_follower: input.id_follower
					},
					take: input.limit,
					skip: input.offset,
					select: {
						follower: {
							select: {
								username: true,
								name: true,
								photo_profile: true,
							}
						}
					}
				})

				const data = followings.map(follow => ({
					...follow.follower
				}))

				return data;
			} catch (error) {
				throw new Error("Error fetching followings: " + error)
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
				})

				return data;
			} catch (error) {
				throw new Error("Error fetching photoProfile: " + error)
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
					gender: z.enum(['MALE', 'FEMALE']).optional(),
					email_contact: z.string().optional(),
				})
			})
		)
		.mutation(async ({ input }) => {
			try {
				await prisma.user.update({
					where: {
						id: input.id
					},
					data: input.data
				});
				
				const updatedUser = await prisma.user.findUnique({
					where: {
						id: input.id
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
					}
				});
				
				return updatedUser;
			} catch (error) {
				throw new Error("Error updating user: " + error);
			}
		})
});

export type UserRouter = typeof userRouter;
