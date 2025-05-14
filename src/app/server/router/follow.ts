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
                const [follower, following] = await Promise.all([
                    prisma.user.findUnique({
                        where: { id: input.id_follower },
                    }),
                    prisma.user.findUnique({
                        where: { id: input.id_following },
                    }),
                ]);

                if (!follower || !following) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "One or both users not found",
                    });
                }

                // Check if already following
                const existingFollow = await prisma.follow.findFirst({
                    where: {
                        id_follower: input.id_follower,
                        id_following: input.id_following,
                    },
                });

                if (existingFollow) {
                    throw new TRPCError({
                        code: "CONFLICT",
                        message: "Already following this user",
                    });
                }

                // Create follow relationship
                const follow = await prisma.follow.create({
                    data: {
                        id_follower: input.id_follower,
                        id_following: input.id_following,
                    },
                });

                // Update counts in CountSummary
                await Promise.all([
                    // Update follower count for the followed user
                    prisma.count_summary.update({
                        where: { id_user: input.id_following },
                        data: {
                            count_follower: {
                                increment: 1,
                            },
                        },
                    }),
                    // Update following count for the follower
                    prisma.count_summary.update({
                        where: { id_user: input.id_follower },
                        data: {
                            count_following: {
                                increment: 1,
                            },
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
});

export type FollowRouter = typeof followRouter;
