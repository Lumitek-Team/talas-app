import { protectedProcedure, router } from "../trpc";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const likeProjectRouter = router({
    like: protectedProcedure
        .input(
            z.object({
                id_user: z.string(),
                id_project: z.string(),
            })
        )
        .mutation(async ({ input }) => {
            try {
                // Check if the project exists and get project owner
                const project = await prisma.project.findUnique({
                    where: { id: input.id_project }
                });

                // Get project owner and collaborators
                const projectUsers = await prisma.projectUser.findMany({
                    where: { id_project: input.id_project }
                });

                if (!project) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Project not found"
                    });
                }
                
                // Check if user already liked this project
                const existingLike = await prisma.likeProject.findFirst({
                    where: {
                        id_user: input.id_user,
                        id_project: input.id_project,
                    },
                });

                if (existingLike) {
                    throw new TRPCError({
                        code: "CONFLICT",
                        message: "User already liked this project"
                    });
                }

                // Create the like relationship
                const like = await prisma.likeProject.create({
                    data: {
                        id_user: input.id_user,
                        id_project: input.id_project,
                    },
                });

                // Update like count for the project
                const updatedProject = await prisma.project.update({
                    where: { id: input.id_project },
                    data: {
                        count_likes: {
                            increment: 1
                        }
                    },
                    select: {
                        count_likes: true,
                        title: true,
                    }
                });
                
                // Create notification for project owner and collaborators (if not self-like)
                try {
                    // Get information about the user who liked the project
                    const liker = await prisma.user.findUnique({
                        where: { id: input.id_user },
                        select: { username: true, name: true }
                    });
                    
                    const likerName = liker?.name || liker?.username || 'Someone';
                    
                    // Get project owner details from projectUsers
                    const projectOwners = await prisma.projectUser.findMany({
                        where: { 
                            id_project: input.id_project,
                        }
                    });
                    
                    // Prepare notifications for all project users except the liker
                    const notifications = projectUsers
                        .filter(pu => pu.id_user !== input.id_user) // Skip if the user liking is the same as the project user
                        .map(pu => {
                            const isOwner = projectOwners.some(owner => owner.id_user === pu.id_user);
                            const notificationTitle = isOwner 
                                ? `${likerName} liked your project "${project.title}"`
                                : `${likerName} liked a project you collaborate on: "${project.title}"`;
                                
                            return {
                                id_user: pu.id_user,
                                title: notificationTitle,
                                is_read: false,
                                type: "LIKE_PROJECT" as const
                            };
                        });
                    
                    // Create all notifications at once if there are any recipients
                    if (notifications.length > 0) {
                        await prisma.notification.createMany({
                            data: notifications
                        });
                    }
                } catch (notifError) {
                    // Log but don't fail the main operation
                    console.error("Failed to create notifications:", notifError);
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Failed to create notifications"
                    });
                }
                
                return {
                    success: true,
                    message: "Project liked successfully",
                    data: like,
                    count_likes: updatedProject.count_likes
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
                id_project: z.string(),
            })
        )
        .mutation(async ({ input }) => {
            try {
                // Check if the like exists
                const like = await prisma.likeProject.findFirst({
                    where: {
                        id_user: input.id_user,
                        id_project: input.id_project,
                    },
                });

                if (!like) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Like not found"
                    });
                }

                // Delete the like
                await prisma.likeProject.delete({
                    where: {
                        id: like.id
                    },
                });

                // Update like count for the project
                const updatedProject = await prisma.project.update({
                    where: { id: input.id_project },
                    data: {
                        count_likes: {
                            decrement: 1
                        }
                    },
                    select: {
                        count_likes: true
                    }
                });

                return {
                    success: true,
                    message: "Project unliked successfully",
                    count_likes: updatedProject.count_likes
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

export type LikeProjectRouter = typeof likeProjectRouter;
