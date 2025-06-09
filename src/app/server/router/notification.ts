import { protectedProcedure, router } from "../trpc";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { notifType } from "@prisma/client"; // import enum dari Prisma Client
import { retryConnect } from "@/lib/utils";

export const notificationRouter = router({
	// Create notification endpoint
	create: protectedProcedure
		.input(
			z.object({
				id_user: z.string(),
				title: z.string(),
				is_read: z.boolean().default(false),
				type: z.nativeEnum(notifType), // gunakan enum dari Prisma
			})
		)
		.mutation(async ({ input }) => {
			try {
				// Check if user exists
				const user = await retryConnect(() =>
					prisma.user.findUnique({
						where: { id: input.id_user },
					})
				);

				if (!user) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "User not found",
					});
				}

				// Create notification
				const notification = await retryConnect(() =>
					prisma.notification.create({
						data: {
							id_user: input.id_user,
							title: input.title,
							is_read: input.is_read,
							type: input.type,
						},
					})
				);

				const notif = {
					id: notification.id,
					title: notification.title,
					created_at: notification.created_at,
					is_read: notification.is_read,
					type: notification.type,
				};

				return {
					success: true,
					message: "Successfully created notification",
					data: notif,
				};
			} catch (error) {
				if (error instanceof TRPCError) throw error;
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: `Failed to create notification: ${
						error instanceof Error ? error.message : "Unknown error"
					}`,
				});
			}
		}),

	// Mark all notifications as read
	makeReaded: protectedProcedure
		.input(
			z.object({
				id_user: z.string(),
			})
		)
		.mutation(async ({ input }) => {
			try {
				const [result] = await retryConnect(() =>
					prisma.$transaction([
						prisma.notification.updateMany({
							where: {
								id_user: input.id_user,
								is_read: false,
							},
							data: {
								is_read: true,
							},
						}),

						prisma.count_summary.update({
							where: { id_user: input.id_user },
							data: { all_notif_read: true },
						}),
					])
				);

				return {
					success: true,
					message: "All notifications marked as read",
					count: result.count,
				};
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: `Failed to mark notifications as read: ${
						error instanceof Error ? error.message : "Unknown error"
					}`,
				});
			}
		}),
});

export type NotificationRouter = typeof notificationRouter;
