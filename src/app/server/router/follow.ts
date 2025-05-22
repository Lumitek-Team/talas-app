import { protectedProcedure, router } from "../trpc";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const followRouter = router({
	// Follow a user
	following: protectedProcedure
		.input(
			z.object({
				id_follower: z.string(),
				id_following: z.string(),
			})
		)
		.mutation(async ({ input }) => {
			try {
				// Check if users exist
				const [follower, following, existingFollow] = await Promise.all([
					prisma.user.findUnique({
						where: { id: input.id_follower },
					}),
					prisma.user.findUnique({
						where: { id: input.id_following },
					}),
					prisma.follow.findFirst({
						where: {
							id_follower: input.id_follower,
							id_following: input.id_following,
						},
					}),
				]);

				if (!follower || !following) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "One or both users not found",
					});
				}

				if (existingFollow) {
					throw new TRPCError({
						code: "CONFLICT",
						message: "Already following this user",
					});
				}

				// Ambil username follower untuk notifikasi
				const followerUsername = follower.username;

				const [follow, , ,] = await prisma.$transaction([
					prisma.follow.create({
						data: {
							id_follower: input.id_follower,
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
						where: { id_user: input.id_follower },
						data: {
							count_following: {
								increment: 1,
							},
						},
					}),
					// Notifikasi follow
					prisma.notification.create({
						data: {
							id_user: input.id_following,
							title: `${followerUsername} following you`,
							is_read: false,
							type: "FOLLOW",
						},
					}),
				]);

				return {
					success: true,
					message: "Successfully followed user",
					data: follow,
				};
			} catch (error) {
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
				id_follower: z.string(),
				id_following: z.string(),
			})
		)
		.mutation(async ({ input }) => {
			try {
				// Check if the follow relationship exists
				const follow = await prisma.follow.findFirst({
					where: {
						id_follower: input.id_follower,
						id_following: input.id_following,
					},
				});

				if (!follow) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Follow relationship not found",
					});
				}

				const [, ,] = await prisma.$transaction([
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
						where: { id_user: input.id_follower },
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
});

export type FollowRouter = typeof followRouter;
