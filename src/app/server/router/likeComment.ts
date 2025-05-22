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
                // Check if the comment exists and get owner info
                const comment = await prisma.comment.findUnique({
                    where: { id: input.id_comment },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                username: true
                            }
                        },
                        project: {
                            select: {
                                id: true,
                                title: true,
                                slug: true
                            }
                        }
                    }
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

                // Create notification for comment owner (if not self-like)
                if (comment.user && comment.user.id !== input.id_user) {
                    try {
                        // Get information about the user who liked the comment
                        const liker = await prisma.user.findUnique({
                            where: { id: input.id_user },
                            select: { 
                                username: true, 
                                name: true 
                            }
                        });
                        
                        // Create a notification with context about the project
                        const notificationTitle = 
                            `${liker?.username || liker?.name || 'Someone'} liked your comment on "${
                                comment.project?.title || 'a project'
                            }"`;
                        
                        await prisma.notification.create({
                            data: {
                                id_user: comment.user.id,
                                title: notificationTitle,
                                is_read: false,
                                type: "LIKE_COMMENT"
                            }
                        });
                    } catch (notifError) {
                        // Log but don't fail the main operation
                        console.error("Failed to create notification:", notifError);
                    }
                }

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
                    message: `Failed to like comment: ${
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
                    message: `Failed to unlike comment: ${
                        error instanceof Error ? error.message : "Unknown error"
                    }`
                });
            }
        })
});

export type likeCommentRouter = typeof likeCommentRouter;
