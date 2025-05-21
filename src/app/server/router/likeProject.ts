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
				const project = await prisma.project.findUnique({
					where: { id: input.id_project },
					include: {
						project_user: true,
					},
				});
				if (!project) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Project not found",
					});
				}

				const liker = await prisma.user.findUnique({
					where: { id: input.id_user },
					select: { username: true, name: true },
				});
				if (!liker) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "User not found",
					});
				}

				const projectUsers = project?.project_user;
				if (!projectUsers || projectUsers.length === 0) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Project has no owner or collaborators",
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
						message: "User already liked this project",
					});
				}

				const ownerUserId = projectUsers.reduce((earliest, pu) => {
					if (!earliest || pu.created_at < earliest.created_at) return pu;
					return earliest;
				}, null as (typeof projectUsers)[0] | null)?.id_user;

				const notifications = projectUsers
					.filter((pu) => pu.id_user !== input.id_user)
					.map((pu) => {
						const notificationTitle =
							pu.id_user === ownerUserId
								? `${liker?.username} liked your project "${project.title}"`
								: `${liker?.username} liked a project you collaborate on: "${project.title}"`;

						return {
							id_user: pu.id_user,
							title: notificationTitle,
							is_read: false,
							type: "LIKE_PROJECT" as const,
						};
					});

				const [like, updatedProject] = await prisma.$transaction([
					prisma.likeProject.create({
						data: {
							id_user: input.id_user,
							id_project: input.id_project,
						},
					}),
					prisma.project.update({
						where: { id: input.id_project },
						data: {
							count_likes: {
								increment: 1,
							},
						},
						select: {
							count_likes: true,
							title: true,
						},
					}),
					prisma.notification.createMany({
						data: notifications,
					}),
				]);

				return {
					success: true,
					message: "Project liked successfully",
					data: like,
					count_likes: updatedProject.count_likes,
				};
			} catch (error) {
				if (error instanceof TRPCError) throw error;
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: `Failed to like project: ${
						error instanceof Error ? error.message : "Unknown error"
					}`,
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
						message: "Like not found",
					});
				}

				// Transaksi: hapus like dan update count
				const [, updatedProject] = await prisma.$transaction([
					prisma.likeProject.delete({
						where: {
							id: like.id,
						},
					}),
					prisma.project.update({
						where: { id: input.id_project },
						data: {
							count_likes: {
								decrement: 1,
							},
						},
						select: {
							count_likes: true,
						},
					}),
				]);

				return {
					success: true,
					message: "Project unliked successfully",
					count_likes: updatedProject.count_likes,
				};
			} catch (error) {
				if (error instanceof TRPCError) throw error;
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: `Failed to unlike project: ${
						error instanceof Error ? error.message : "Unknown error"
					}`,
				});
			}
		}),
});

export type LikeProjectRouter = typeof likeProjectRouter;
