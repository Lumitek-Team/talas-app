import { protectedProcedure, publicProcedure, router } from "../trpc";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { currentUser } from "@clerk/nextjs/server";

export const followRouter = router({
	// DEBUG: Test reachability
	ping: publicProcedure.query(() => {
		return "pong";
	}),

	// Follow a user
	following: protectedProcedure
		.input(
			z.object({
				id_follower: z.string().optional(),
				id_following: z.string(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			try {
				const actorId = ctx.auth.userId ?? input.id_follower;
				console.log(`[Follow] Actor: ${actorId}, Target: ${input.id_following}`);
				
				if (!actorId) {
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message: "User ID is required",
					});
				}

				// 1. SAFETY SYNC: Ensure the follower exists in our DB
				let follower = await prisma.user.findUnique({
					where: { id: actorId },
				});

				if (!follower) {
					console.log(`[Follow] Actor ${actorId} not in DB. Attempting auto-sync...`);
					const user = await currentUser();
					if (user && user.id === actorId) {
						let username = user.emailAddresses[0].emailAddress.split("@")[0];
						// Quick unique username logic
						const existingWithUsername = await prisma.user.findFirst({ where: { username } });
						if (existingWithUsername) username = `${username}-${Math.floor(100 + Math.random() * 900)}`;

						follower = await prisma.user.create({
							data: {
								id: actorId,
								username,
								name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || username,
								email: user.emailAddresses[0].emailAddress,
								auth_type: user.externalAccounts[0]?.provider || "clerk",
								photo_profile: user.imageUrl,
								count_summary: { create: {} },
							},
						});
						console.log(`[Follow] Auto-sync successful for ${actorId}`);
					}
				}

				const [following, existingFollow] = await Promise.all([
					prisma.user.findUnique({
						where: { id: input.id_following },
					}),
					prisma.follow.findFirst({
						where: {
							id_follower: actorId,
							id_following: input.id_following,
						},
					}),
				]);

				if (!follower) {
					console.error(`[Follow] Follower still not found: ${actorId}`);
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: `Follower user not found in DB (ID: ${actorId}). Your account record is missing.`,
					});
				}

				if (!following) {
					console.error(`[Follow] Target not found: ${input.id_following}`);
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: `Target user not found in DB (ID: ${input.id_following}).`,
					});
				}

				if (existingFollow) {
					throw new TRPCError({
						code: "CONFLICT",
						message: "Already following this user",
					});
				}

				// Ensure count_summary exists for both to avoid P2025 (Record to update not found)
				try {
					await Promise.all([
						prisma.count_summary.upsert({
							where: { id_user: actorId },
							update: {},
							create: { id_user: actorId }
						}),
						prisma.count_summary.upsert({
							where: { id_user: input.id_following },
							update: {},
							create: { id_user: input.id_following }
						})
					]);
				} catch (upsertError) {
					console.error(`[Follow] Upsert count_summary failed:`, upsertError);
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: `Failed to prepare counters: ${upsertError instanceof Error ? upsertError.message : 'Unknown error'}`
					});
				}

				// Ambil username follower untuk notifikasi
				const followerUsername = follower.username;

				const [follow] = await prisma.$transaction([
					prisma.follow.create({
						data: {
							id_follower: actorId,
							id_following: input.id_following,
						},
					}),

					prisma.count_summary.update({
						where: { id_user: input.id_following },
						data: {
							count_follower: {
								increment: 1,
							},
						},
					}),
					prisma.count_summary.update({
						where: { id_user: actorId },
						data: {
							count_following: {
								increment: 1,
							},
						},
					}),
					// Notifikasi follow (hanya jika tidak follow diri sendiri)
					...(actorId.trim() !== input.id_following.trim()
						? [
								prisma.notification.create({
									data: {
										id_user: input.id_following.trim(),
										title: `${followerUsername} following you`,
										is_read: false,
										type: "FOLLOW",
									},
								}),
						  ]
						: []),
				]);

				return {
					success: true,
					message: "Successfully followed user",
					data: follow,
				};
			} catch (error) {
				console.error(`[Follow] Mutation failed:`, error);
				if (error instanceof TRPCError) throw error;
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: `Failed to follow user: ${
						error instanceof Error ? error.message : "Unknown error"
					}`,
				});
			}
		}),

	// Unfollow a user
	unfollowing: protectedProcedure
		.input(
			z.object({
				id_follower: z.string().optional(),
				id_following: z.string(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			try {
				const actorId = ctx.auth.userId ?? input.id_follower;
				
				if (!actorId) {
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message: "User ID is required",
					});
				}

				// Check if the follow relationship exists
				const follow = await prisma.follow.findFirst({
					where: {
						id_follower: actorId,
						id_following: input.id_following,
					},
				});

				if (!follow) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Follow relationship not found",
					});
				}

				await prisma.$transaction([
					prisma.follow.delete({
						where: {
							id: follow.id,
						},
					}),

					// Update follower count for the followed user
					prisma.count_summary.update({
						where: { id_user: input.id_following },
						data: {
							count_follower: {
								decrement: 1,
							},
						},
					}),
					// Update following count for the follower
					prisma.count_summary.update({
						where: { id_user: actorId },
						data: {
							count_following: {
								decrement: 1,
							},
						},
					}),
				]);

				return {
					success: true,
					message: "Successfully unfollowed user",
				};
			} catch (error) {
				if (error instanceof TRPCError) throw error;
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: `Failed to unfollow user: ${
						error instanceof Error ? error.message : "Unknown error"
					}`,
				});
			}
		}),

	// Check isFollow?
	checkIsFollowing: protectedProcedure
		.input(
			z.object({
				id_follower: z.string().optional(),
				id_following: z.string(),
			})
		)
		.query(async ({ input, ctx }) => {
			const actorId = ctx.auth.userId ?? input.id_follower;
			
			if (!actorId) {
				return { isFollowing: false };
			}

			const follow = await prisma.follow.findFirst({
				where: {
					id_follower: actorId,
					id_following: input.id_following,
				},
			});

			return {
				isFollowing: !!follow,
			};
		}),
});

export type FollowRouter = typeof followRouter;
