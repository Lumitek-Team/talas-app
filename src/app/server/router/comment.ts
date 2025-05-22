import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import prisma from "@/lib/prisma";
import { retryConnect } from "@/lib/utils";
import { currentUser } from "@clerk/nextjs/server";
import { Comment } from "@prisma/client";

// Fungsi rekursif untuk mengambil semua id turunan komentar
type PrismaClientType = typeof prisma;
async function getAllDescendantCommentIds(
	prisma: PrismaClientType,
	parentId: string
): Promise<string[]> {
	const children = await prisma.comment.findMany({
		where: { parent_id: parentId },
		select: { id: true },
	});
	let allIds: string[] = [];
	for (const child of children) {
		allIds.push(child.id);
		const descendants = await getAllDescendantCommentIds(prisma, child.id);
		allIds = allIds.concat(descendants);
	}
	return allIds;
}

export const commentRouter = router({
	create: protectedProcedure
		.input(
			z.object({
				id_project: z.string(),
				content: z.string().min(2).max(500),
				parent_id: z.string().nullable(),
			})
		)
		.mutation(async ({ input }) => {
			const { id_project, content, parent_id } = input;
			const userId = (await currentUser())?.id;
			if (!userId) {
				throw new Error("User not authenticated");
			}
			if (!id_project || !content) {
				throw new Error("Field is empty");
			}

			try {
				const [comment]: [Comment] = await retryConnect(() =>
					prisma.$transaction([
						prisma.comment.create({
							data: {
								id_project,
								content,
								parent_id,
								id_user: userId,
							},
						}),
						prisma.project.update({
							where: {
								id: id_project,
							},
							data: {
								count_comments: {
									increment: 1,
								},
							},
						}),
					])
				);

				try {
					// Get project info for the notification
					const project = await prisma.project.findUnique({
						where: { id: id_project },
						include: {
							project_user: {
								select: {
									id_user: true,
								},
							},
						},
					});

					// Get commenter info
					const commenter = await prisma.user.findUnique({
						where: { id: userId },
						select: { name: true, username: true },
					});

					if (project) {
						// Get notification recipients (project owners who aren't the commenter)
						const recipientIds = project.project_user
							.map((pu) => pu.id_user)
							.filter((id) => id !== userId);

						if (recipientIds.length > 0) {
							// Create notifications
							await prisma.notification.createMany({
								data: recipientIds.map((recipientId) => ({
									id_user: recipientId,
									title: `${
										commenter?.username || commenter?.name || "Someone"
									} commented on your project`,
									is_read: false,
									type: "COMMENT",
								})),
							});
						}
					}
				} catch (notifError) {
					// Just log the error, don't affect the main flow
					console.error("Failed to create comment notification:", notifError);
				}

				return comment;
			} catch (error) {
				throw new Error("Error creating comment: " + error);
			}
		}),

	edit: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				content: z.string().min(2).max(500),
				id_user: z.string(),
			})
		)
		.mutation(async ({ input }) => {
			const userId = (await currentUser())?.id;
			if (!userId) {
				throw new Error("User not authenticated");
			}
			if (userId !== input.id_user) {
				throw new Error("You are not the owner of this comment");
			}
			if (!input.id || !input.content || !input.id_user) {
				throw new Error("Field is empty");
			}
			try {
				const comment = await retryConnect(() =>
					prisma.comment.update({
						where: {
							id: input.id,
						},
						data: {
							content: input.content,
						},
					})
				);
				return comment;
			} catch (error) {
				throw new Error("Error updating comment: " + error);
			}
		}),

	deleteById: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				id_user: z.string(),
				id_project: z.string(),
			})
		)
		.mutation(async ({ input }) => {
			const userId = (await currentUser())?.id;
			if (!userId) {
				throw new Error("User not authenticated");
			}
			if (!input.id || !input.id_project || !input.id_user) {
				throw new Error("Field is empty");
			}
			if (userId !== input.id_user) {
				throw new Error("You are not the owner of this comment");
			}

			try {
				// Ambil semua id turunan (anak, cucu, dst)
				const descendantIds = await getAllDescendantCommentIds(
					prisma,
					input.id
				);
				// Hapus semua komentar (root + semua turunan)
				await retryConnect(() =>
					prisma.$transaction([
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
					])
				);
			} catch (error) {
				throw new Error("Error deleting comment: " + error);
			}
		}),
});

export type CategoryRouter = typeof commentRouter;
