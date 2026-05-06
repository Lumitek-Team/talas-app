// server/trpc/routers/comment.ts (Refactored create procedure)
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getCommentTreeIds } from "@/lib/utils";
import { currentUser } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
// NOTE: Avoid casting Prisma results to frontend DTO types (ProjectOneType/ProjectWithInteractionsType)
// inside routers; select exactly what this router needs.

export const commentRouter = router({
	create: protectedProcedure
		.input(
			z.object({
				id_project: z.string(),
				content: z
					.string()
					.min(1, "Comment cannot be empty.")
					.max(1000, "Comment too long."),
				parent_id: z.string().nullable(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const { id_project, content, parent_id } = input;
			const actorId = ctx.auth.userId;
			const user = await prisma.user.findUnique({
				where: { id: actorId ?? "" },
				select: {
					id: true,
					username: true,
				},
			});
			if (!user) {
				throw new Error("User not authenticated");
			}
			if (!id_project || !content) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Project ID and content are required.",
				});
			}

			// Cek reply hanya boleh satu level
			if (parent_id) {
				const parentComment = await prisma.comment.findUnique({
					where: { id: parent_id },
					select: { parent_id: true, id_user: true }, // tambahkan id_user untuk notif
				});

				if (!parentComment) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Parent comment not found.",
					});
				}
				if (parentComment.parent_id !== null) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message:
							"Replies are only allowed on top-level comments (one level deep).",
					});
				}
			}

			type ProjectForCommentNotif = {
				title: string;
				project_user: Array<{ user: { id: string }; ownership: string }>;

				// tambahkan field lain yang diperlukan jika ada
			};

			const projectNullable = await prisma.project.findUnique({
				where: { id: input.id_project },
				select: {
					title: true,
					project_user: {
						// Only notify OWNER and ACCEPTED collaborators, not PENDING
						where: {
							OR: [
								{ ownership: "OWNER" },
								{ ownership: "COLLABORATOR", collabStatus: "ACCEPTED" },
							],
						},
						select: {
							ownership: true,
							user: {
								select: { id: true },
							},
						},
					},
				},
			});

			if (!projectNullable) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Project not found",
				});
			}

			const project = projectNullable as ProjectForCommentNotif;

			const projectUsers = project?.project_user;
			if (!projectUsers || projectUsers.length === 0) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Project has no owner or collaborators",
				});
			}

			const ownerUserId = projectUsers.find((pu) => pu.ownership === "OWNER")
				?.user.id;
			const userIdTrimmed = user.id.trim();
			const ownerUserIdTrimmed = ownerUserId?.trim();

			// Notifikasi untuk semua kolaborator/owner kecuali diri sendiri
			const notifications: {
				id_user: string;
				title: string;
				is_read: boolean;
				type: "COMMENT_PROJECT" | "REPLY_COMMENT";
			}[] = projectUsers
				.filter((pu) => pu.user.id.trim() !== userIdTrimmed)
				.map((pu) => {
					const puIdTrimmed = pu.user.id.trim();
					const notificationTitle =
						puIdTrimmed === ownerUserIdTrimmed
							? `${user.username} comment on your project ${project.title}`
							: `${user.username} comment on project you collaborate on: ${project.title}`;

					return {
						id_user: puIdTrimmed,
						title: notificationTitle,
						is_read: false,
						type: "COMMENT_PROJECT",
					};
				});

			// Jika reply, tambahkan notifikasi ke author parent comment (jika belum termasuk di atas)
			let parentCommentUserId: string | undefined = undefined;
			if (parent_id) {
				const parentComment = await prisma.comment.findUnique({
					where: { id: parent_id },
					select: { id_user: true },
				});
				parentCommentUserId = parentComment?.id_user;
				const parentUserIdTrimmed = parentCommentUserId?.trim();
				if (parentUserIdTrimmed && parentUserIdTrimmed !== userIdTrimmed) {
					// Cek apakah sudah masuk di list notifications (kolaborator)
					const alreadyNotified = notifications.some(n => n.id_user === parentUserIdTrimmed);
					if (!alreadyNotified) {
						notifications.push({
							id_user: parentUserIdTrimmed,
							title: `${user.username} replied to your comment on project ${project.title}`,
							is_read: false,
							type: "REPLY_COMMENT",
						});
					}
				}
			}

			try {
				const [comment, updatedProject] = await prisma.$transaction(async (tx) => {
					const createdComment = await tx.comment.create({
						data: {
							id_project,
							content,
							parent_id,
							id_user: user.id,
						},
					});

					const updated = await tx.project.update({
						where: { id: id_project },
						data: {
							count_comments: { increment: 1 },
						},
					});

					if (notifications.length > 0) {
						await tx.notification.createMany({
							data: notifications,
						});
					}

					return [createdComment, updated] as const;
				});

				return {
					success: true,
					message: "Successfully comment",
					data: comment,
					count_likes: updatedProject.count_comments,
				};
			} catch (error) {
				console.error("Error creating comment in backend:", error);
				if (error instanceof TRPCError) throw error;
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error creating comment.",
				});
			}
		}),

	edit: protectedProcedure
		.input(
			z.object({
				id: z.string(), // Comment ID to edit
				content: z
					.string()
					.min(1, "Comment cannot be empty.")
					.max(1000, "Comment too long."),
				id_user: z.string(), // User ID of the comment author (for verification)
			})
		)
		.mutation(async ({ input }) => {
			const user = await currentUser();
			if (!user || !user.id) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "User not authenticated.",
				});
			}
			// Ensure the user trying to edit is the author of the comment
			if (user.id !== input.id_user) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You can only edit your own comments.",
				});
			}

			try {
				const comment = await prisma.comment.update({
					where: {
						id: input.id,
						id_user: user.id, // Ensure they can only update their own comment
					},
					data: {
						content: input.content,
						updated_at: new Date(), // Explicitly set updated_at
					},
				});
				return {
					success: true,
					message: "Successfully edit comment",
					data: comment,
				};
			} catch (error) {
				console.error("Error updating comment in backend:", error);
				if (error instanceof Prisma.PrismaClientKnownRequestError) {
					if (error.code === "P2025") {
						throw new TRPCError({
							code: "NOT_FOUND",
							message:
								"Comment not found or you do not have permission to edit it.",
						});
					}
				}
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error updating comment.",
				});
			}
		}),

	deleteById: protectedProcedure
		.input(
			z.object({
				id: z.string(), // Comment ID to delete
				id_user: z.string(), // User ID of the comment author (for verification)
				id_project: z.string(), // Project ID to decrement count
			})
		)
		.mutation(async ({ input }) => {
			console.log("Deleting comment with input:", input);
			const user = await currentUser();
			if (!user || !user.id) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "User not authenticated.",
				});
			}
			// Ensure the user trying to delete is the author of the comment
			if (user.id !== input.id_user) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You can only delete your own comments.",
				});
			}

			try {
				// Ambil semua id turunan (anak, cucu, dst)
				const descendantIds = await getCommentTreeIds(input.id);
				// Hapus semua komentar (root + semua turunan)
				await prisma.$transaction([
					prisma.comment.deleteMany({
						where: {
							id: { in: [input.id, ...descendantIds] },
						},
					}),
					prisma.project.update({
						where: {
							id: input.id_project,
						},
						data: {
							count_comments: {
								decrement: descendantIds.length + 1,
							},
						},
					}),
				]);

				return {
					success: true,
					message: "Successfully delete comment",
				};
			} catch (error) {
				console.error("Error deleting comment in backend:", error);
				if (error instanceof TRPCError) throw error;
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error deleting comment.",
				});
			}
		}),
});

export type CommentRouter = typeof commentRouter;
