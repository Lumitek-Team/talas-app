import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import prisma from "@/lib/prisma";
import { getAllDescendantCommentIds, retryConnect } from "@/lib/utils";
import { currentUser } from "@clerk/nextjs/server";
import { Comment, Project } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { ProjectOneType } from "@/lib/type";

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
			const user = await currentUser();
			if (!user) {
				throw new Error("User not authenticated");
			}
			if (!id_project || !content) {
				throw new Error("Field is empty");
			}

			const project: ProjectOneType = await retryConnect(() =>
				prisma.project.findUnique({
					where: { id: input.id_project },
					include: {
						project_user: true,
					},
				})
			);
			if (!project) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Project not found",
				});
			}

			const projectUsers = project?.project_user;
			if (!projectUsers || projectUsers.length === 0) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Project has no owner or collaborators",
				});
			}

			const ownerUserId = projectUsers.find((pu) => pu.ownership === "OWNER")
				?.user.id;

			const notifications = projectUsers
				.filter((pu) => pu.user.id !== user.id)
				.map((pu) => {
					const notificationTitle =
						pu.user.id === ownerUserId
							? `${user.username} comment on your project "${project.title}"`
							: `${user.username} comment on project you collaborate on: "${project.title}"`;

					return {
						id_user: pu.user.id,
						title: notificationTitle,
						is_read: false,
						type: "LIKE_PROJECT" as const,
					};
				});

			try {
				const [comment, updatedProject]: [Comment, Project] =
					await retryConnect(() =>
						prisma.$transaction([
							prisma.comment.create({
								data: {
									id_project,
									content,
									parent_id,
									id_user: user.id,
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
							prisma.notification.createMany({
								data: notifications,
							}),
						])
					);

				return {
					success: true,
					message: "Successfully comment",
					data: comment,
					count_likes: updatedProject.count_comments,
				};
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
				return {
					success: true,
					message: "Successfully edit comment",
					data: comment,
				};
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

				return {
					success: true,
					message: "Successfully delete comment",
				};
			} catch (error) {
				throw new Error("Error deleting comment: " + error);
			}
		}),
});

export type CommentRouter = typeof commentRouter;
