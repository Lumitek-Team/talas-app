import { protectedProcedure, router } from "../trpc";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { retryConnect } from "@/lib/utils";

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
				// Ambil data komentar beserta user-nya, existingLike, dan liker secara paralel
				const [comment, existingLike, liker] = await Promise.all([
					retryConnect(() =>
						prisma.comment.findUnique({
							where: { id: input.id_comment },
							include: { user: true, project: { select: { title: true } } },
						})
					),
					retryConnect(() =>
						prisma.likeComment.findFirst({
							where: {
								id_user: input.id_user,
								id_comment: input.id_comment,
							},
						})
					),
					retryConnect(() =>
						prisma.user.findUnique({
							where: { id: input.id_user },
							select: { username: true },
						})
					),
				]);

				if (!comment) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Comment not found",
					});
				}

				if (existingLike) {
					throw new TRPCError({
						code: "CONFLICT",
						message: "User already liked this comment",
					});
				}

				// Siapkan notifikasi jika yang like bukan pemilik komentar
				let notificationData = null;
				if (comment.user.id !== input.id_user) {
					notificationData = {
						id_user: comment.user.id,
						title: `${liker?.username} liked your comment on project "${comment.project.title}"`,
						is_read: false,
						type: "LIKE_COMMENT" as const,
					};
				}

				// Transaksi: create like, update count_like, create notifikasi (jika perlu)
				const [like, updatedComment] = await retryConnect(() =>
					prisma.$transaction([
						prisma.likeComment.create({
							data: {
								id_user: input.id_user,
								id_comment: input.id_comment,
							},
						}),
						prisma.comment.update({
							where: { id: input.id_comment },
							data: {
								count_like: {
									increment: 1,
								},
							},
							select: {
								count_like: true,
							},
						}),
						...(notificationData
							? [prisma.notification.create({ data: notificationData })]
							: []),
					])
				);

				return {
					success: true,
					message: "Comment liked successfully",
					data: like,
					count_like: updatedComment.count_like,
				};
			} catch (error) {
				if (error instanceof TRPCError) throw error;
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: `Failed to like comment: ${
						error instanceof Error ? error.message : "Unknown error"
					}`,
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
				const like = await retryConnect(() =>
					prisma.likeComment.findFirst({
						where: {
							id_user: input.id_user,
							id_comment: input.id_comment,
						},
					})
				);

				if (!like) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Like not found",
					});
				}

				// Transaksi: hapus like dan update count_like
				const [, updatedComment] = await retryConnect(() =>
					prisma.$transaction([
						prisma.likeComment.delete({
							where: {
								id: like.id,
							},
						}),
						prisma.comment.update({
							where: { id: input.id_comment },
							data: {
								count_like: {
									decrement: 1,
								},
							},
							select: {
								count_like: true,
							},
						}),
					])
				);

				return {
					success: true,
					message: "Comment unliked successfully",
					count_like: updatedComment.count_like,
				};
			} catch (error) {
				if (error instanceof TRPCError) throw error;
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: `Failed to unlike comment: ${
						error instanceof Error ? error.message : "Unknown error"
					}`,
				});
			}
		}),
});

export type LikeCommentRouter = typeof likeCommentRouter;
