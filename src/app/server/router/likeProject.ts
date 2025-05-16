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
                // Check if the project exists
                const project = await prisma.project.findUnique({
                    where: { id: input.id_project }
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
                        count_likes: true
                    }
                });

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
});

export type LikeProjectRouter = typeof likeProjectRouter;
