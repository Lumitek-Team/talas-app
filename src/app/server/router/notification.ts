import { protectedProcedure, router } from "../trpc";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const 
notificationRouter = router({
    // Create notification endpoint
    create: protectedProcedure
        .input(
            z.object({
                id_user: z.string(),
                title: z.string(),
                is_read: z.boolean().default(false),
                type: z.enum(["FOLLOW", "LIKE_PROJECT", "LIKE_COMMENT", "COMMENT"]),
            })
        )
        .mutation(async ({ input }) => {
            try {
                // Check if user exists
                const user = await prisma.user.findUnique({
                    where: { id: input.id_user }
                });

                if (!user) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "User not found"
                    });
                }

                // Create notification
                const notification = await prisma.notification.create({
                    data: {
                        id_user: input.id_user,
                        title: input.title,
                        is_read: input.is_read,
                        type: input.type,
                    },
                });

                return {
                    id: notification.id,
                    title: notification.title,
                    created_at: notification.created_at,
                    is_read: notification.is_read,
                    type: notification.type,
                };
            } catch (error) {
                if (error instanceof TRPCError) throw error;
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: `Failed to create notification: ${
                        error instanceof Error ? error.message : "Unknown error"
                    }`
                });
            }
        }),
});

export type NotificationRouter = typeof notificationRouter;