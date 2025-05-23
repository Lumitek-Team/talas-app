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
<<<<<<< HEAD
			}))
=======
			})
		)
>>>>>>> dev
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
<<<<<<< HEAD
			z.object({
				limit: z.number().optional(),
				offset: z.number().optional(),
			}).optional()
		)
		.query(async ({ input }) => {
			try {
				
				const data =  await prisma.user.findMany({
=======
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
>>>>>>> dev
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
<<<<<<< HEAD
					}
				});
	
				return data;
			} catch (error) {
				throw new Error("Error fetching user: " + error)
=======
					},
				});

				return data;
			} catch (error) {
				throw new Error("Error fetching user: " + error);
>>>>>>> dev
			}
		}),

	getById: protectedProcedure
		.input(
			z.object({
<<<<<<< HEAD
				id: z.string()
=======
				id: z.string(),
>>>>>>> dev
			})
		)
		.query(async ({ input }) => {
			try {
<<<<<<< HEAD
				
				const data = await prisma.user.findUnique({
					where: {
						id: input.id
=======
				const data = await prisma.user.findUnique({
					where: {
						id: input.id,
>>>>>>> dev
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
<<<<<<< HEAD
					}
				})
	
				return data;
			} catch (error) {
				throw new Error("Error fetching user: " + error)
=======
					},
				});

				return data;
			} catch (error) {
				throw new Error("Error fetching user: " + error);
>>>>>>> dev
			}
		}),

	getByUsername: protectedProcedure
		.input(
			z.object({
<<<<<<< HEAD
				username: z.string()
=======
				username: z.string(),
>>>>>>> dev
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
<<<<<<< HEAD
					}
				})
	
				return data;
			} catch (error) {
				throw new Error("Error fetching user: " + error)
=======
					},
				});

				return data;
			} catch (error) {
				throw new Error("Error fetching user: " + error);
>>>>>>> dev
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
<<<<<<< HEAD
						id_following: input.id_following
=======
						id_following: input.id_following,
>>>>>>> dev
					},
					take: input.limit,
					skip: input.offset,
					select: {
						follower: {
							select: {
								username: true,
								name: true,
								photo_profile: true,
<<<<<<< HEAD
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
=======
							},
						},
					},
				});

				const data = followers.map((follow) => ({
					...follow.follower,
				}));

				return data;
			} catch (error) {
				throw new Error("Error fetching followers: " + error);
>>>>>>> dev
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
<<<<<<< HEAD
						id_follower: input.id_follower
=======
						id_follower: input.id_follower,
>>>>>>> dev
					},
					take: input.limit,
					skip: input.offset,
					select: {
						follower: {
							select: {
								username: true,
								name: true,
								photo_profile: true,
<<<<<<< HEAD
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
=======
							},
						},
					},
				});

				const data = followings.map((follow) => ({
					...follow.follower,
				}));

				return data;
			} catch (error) {
				throw new Error("Error fetching followings: " + error);
>>>>>>> dev
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
<<<<<<< HEAD
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
=======
					where: {
						OR: [{ id: input.id }, { username: input.username }],
					},
					select: {
						photo_profile: true,
					},
				});

				return data;
			} catch (error) {
				throw new Error("Error fetching photoProfile: " + error);
>>>>>>> dev
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
<<<<<<< HEAD
					gender: z.enum(['MALE', 'FEMALE']).optional(),
					email_contact: z.string().optional(),
				})
=======
					gender: z.enum(["MALE", "FEMALE"]).optional(),
					email_contact: z.string().optional(),
				}),
>>>>>>> dev
			})
		)
		.mutation(async ({ input }) => {
			try {
				await prisma.user.update({
					where: {
<<<<<<< HEAD
						id: input.id
					},
					data: input.data
				});
				
				const updatedUser = await prisma.user.findUnique({
					where: {
						id: input.id
=======
						id: input.id,
					},
					data: input.data,
				});

				const updatedUser = await prisma.user.findUnique({
					where: {
						id: input.id,
>>>>>>> dev
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
<<<<<<< HEAD
					}
				});
				
=======
					},
				});

>>>>>>> dev
				return updatedUser;
			} catch (error) {
				throw new Error("Error updating user: " + error);
			}
<<<<<<< HEAD
		})
=======
		}),

	// use infinite query
	getBookmarked: protectedProcedure
		.input(
			z.object({
				id: z.string(),
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
									image1: true,
									image2: true,
									image3: true,
									image4: true,
									image5: true,
									created_at: true,
									updated_at: true,
									project_user: {
										orderBy: { created_at: "asc" },
										take: 1,
										select: {
											user: {
												select: {
													id: true,
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
>>>>>>> dev
});

export type UserRouter = typeof userRouter;