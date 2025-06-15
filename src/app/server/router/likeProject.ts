import { protectedProcedure, router } from "../trpc";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { retryConnect } from "@/lib/utils";
import { ProjectUser } from "@prisma/client";

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
				const [project, liker, existingLike] = await Promise.all([
					retryConnect(() =>
						prisma.project.findUnique({
							where: { id: input.id_project },
							include: {
								project_user: true,
							},
						})
					),
					retryConnect(() =>
						prisma.user.findUnique({
							where: { id: input.id_user },
							select: { username: true, name: true },
						})
					),
					retryConnect(() =>
						prisma.likeProject.findFirst({
							where: {
								id_user: input.id_user,
								id_project: input.id_project,
							},
						})
					),
				]);

				if (!project) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Project not found",
					});
				}
				if (!liker) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "User not found",
					});
				}

				const projectUsers: ProjectUser[] = project.project_user;
				if (!projectUsers || projectUsers.length === 0) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Project has no owner or collaborators",
					});
				}

				if (existingLike) {
					throw new TRPCError({
						code: "CONFLICT",
						message: "User already liked this project",
					});
				}

				// Cari id_user yang ownership-nya OWNER
				const ownerUserId = projectUsers.find(
					(pu) => pu.ownership === "OWNER"
				)?.id_user;
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

				const [, updatedProject] = await retryConnect(() =>
					prisma.$transaction([
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
					])
				);

				return {
					success: true,
					message: "Project liked successfully",
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
				const like = await retryConnect(() =>
					prisma.likeProject.findFirst({
						where: {
							id_user: input.id_user,
							id_project: input.id_project,
						},
					})
				);

				if (!like) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Like not found",
					});
				}

				// Transaksi: hapus like dan update count
				const [, updatedProject] = await retryConnect(() =>
					prisma.$transaction([
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
					])
				);

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
