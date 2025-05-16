import { protectedProcedure, router } from "../trpc";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const likeCommentRouter = router({
    like: protectedProcedure
        .input(
            z.object({
                id_user: z.string(),
                id_comment: z.string(),
            })
        )
        .mutation(async ({ input }) => {
            try {
                // Check if the comment exists
                const comment = await prisma.comment.findUnique({
                    where: { id: input.id_comment }
                });

                if (!comment) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Comment not found"
                    });
                }

                // Check if user already liked this comment
                const existingLike = await prisma.likeComment.findFirst({
                    where: {
                        id_user: input.id_user,
                        id_comment: input.id_comment,
                    },
                });

                if (existingLike) {
                    throw new TRPCError({
                        code: "CONFLICT",
                        message: "User already liked this comment"
                    });
                }

                // Create the like relationship
                const like = await prisma.likeComment.create({
                    data: {
                        id_user: input.id_user,
                        id_comment: input.id_comment,
                    },
                });

                // Update like count for the comment
                const updatedComment = await prisma.comment.update({
                    where: { id: input.id_comment },
                    data: {
                        count_like: {
                            increment: 1
                        }
                    },
                    select: {
                        count_like: true
                    }
                });

                return {
                    success: true,
                    message: "Comment liked successfully",
                    data: like,
                    count_like: updatedComment.count_like
                };
            } catch (error) {
                if (error instanceof TRPCError) throw error;
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: `Failed to like project: ${
                        error instanceof Error ? error.message : "Unknown error"
                    }`
                });
            }
        }),

    unlike: protectedProcedure
        .input(
            z.object({
                id_user: z.string(),
                id_comment: z.string(),
            })
        )
        .mutation(async ({ input }) => {
            try {
                // Check if the like exists
                const like = await prisma.likeComment.findFirst({
                    where: {
                        id_user: input.id_user,
                        id_comment: input.id_comment,
                    },
                });

                if (!like) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Like not found"
                    });
                }

                // Delete the like
                await prisma.likeComment.delete({
                    where: {
                        id: like.id
                    },
                });

                // Update like count for the comment
                const updatedComment = await prisma.comment.update({
                    where: { id: input.id_comment },
                    data: {
                        count_like: {
                            decrement: 1
                        }
                    },
                    select: {
                        count_like: true
                    }
                });

                return {
                    success: true,
                    message: "Comment unliked successfully",
                    count_like: updatedComment.count_like
                };
            } catch (error) {
                if (error instanceof TRPCError) throw error;
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: `Failed to unlike project: ${
                        error instanceof Error ? error.message : "Unknown error"
                    }`
                });
            }
        })
});

export type likeCommentRouter = typeof likeCommentRouter;
