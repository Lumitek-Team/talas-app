// server/trpc/routers/comment.ts (Refactored create procedure)
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import prisma from "@/lib/prisma";
import { getCommentTreeIds, retryConnect } from "@/lib/utils";
import { currentUser } from "@clerk/nextjs/server";
import { Comment, Project } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { ProjectOneType } from "@/lib/type";
import { Prisma } from "@prisma/client";


export const commentRouter = router({
	create: protectedProcedure
		.input(
			z.object({
				id_project: z.string(),
				content: z.string().min(1, "Comment cannot be empty.").max(1000, "Comment too long."), // Consistent with frontend
				parent_id: z.string().nullable(),
			})
		)
		.mutation(async ({ input, ctx }) => { // ctx might be available if you set it up in trpc.ts
			const { id_project, content, parent_id } = input;
			const user = await currentUser();
			if (!user) {
				throw new Error("User not authenticated");
			}
			if (!id_project || !content) {
				throw new TRPCError({ code: "BAD_REQUEST", message: "Project ID and content are required." });
			}

			// MODIFICATION: Backend check for one-level reply limit
			if (parent_id) {
				const parentComment = await retryConnect(() =>
					prisma.comment.findUnique({
						where: { id: parent_id },
						select: { parent_id: true }, // We only need to check if the parent itself has a parent
					})
				);

				if (!parentComment) {
					throw new TRPCError({ code: "NOT_FOUND", message: "Parent comment not found." });
				}
				// If the parentComment itself has a parent_id, it means it's already a reply (level 1).
				// So, we cannot reply to it further.
				if (parentComment.parent_id !== null) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: "Replies are only allowed on top-level comments (one level deep).",
					});
				}
			}
			const project: ProjectOneType = await retryConnect(() =>
    prisma.project.findUnique({
        where: { id: input.id_project },
        include: {
            project_user: {
                // This correctly includes the nested user object for each project_user record
                include: {
                    user: {
                        select: {
                            id: true // We only need the ID for the logic that follows
                        }
                    }
                }
            }
        },
    })
);

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
                console.error("Error creating comment in backend:", error);
				if (error instanceof TRPCError) throw error; // Re-throw TRPC specific errors
				throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error creating comment." });
			}
		}),

	edit: protectedProcedure
		.input(
			z.object({
				id: z.string(), // Comment ID to edit
				content: z.string().min(1, "Comment cannot be empty.").max(1000, "Comment too long."),
				id_user: z.string(), // User ID of the comment author (for verification)
			})
		)
		.mutation(async ({ input }) => {
			const user = await currentUser();
			if (!user || !user.id) {
				throw new TRPCError({ code: "UNAUTHORIZED", message: "User not authenticated." });
			}
			// Ensure the user trying to edit is the author of the comment
			if (user.id !== input.id_user) {
				throw new TRPCError({ code: "FORBIDDEN", message: "You can only edit your own comments." });
			}
			
			try {
				const comment = await retryConnect(() =>
					prisma.comment.update({
						where: {
							id: input.id,
							id_user: user.id, // Ensure they can only update their own comment
						},
						data: {
							content: input.content,
							updated_at: new Date(), // Explicitly set updated_at
						},
					})
				);
				return {
					success: true,
					message: "Successfully edit comment",
					data: comment,
				};
			} catch (error) {
                console.error("Error updating comment in backend:", error);
				if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                    throw new TRPCError({ code: 'NOT_FOUND', message: 'Comment not found or you do not have permission to edit it.' });
                }
				throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error updating comment." });
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
			const user = await currentUser();
			if (!user || !user.id) {
				throw new TRPCError({ code: "UNAUTHORIZED", message: "User not authenticated." });
			}
            // Ensure the user trying to delete is the author of the comment
			if (user.id !== input.id_user) {
				throw new TRPCError({ code: "FORBIDDEN", message: "You can only delete your own comments." });
			}

			try {
				// Ambil semua id turunan (anak, cucu, dst)
				const descendantIds = await getCommentTreeIds(input.id);
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
                console.error("Error deleting comment in backend:", error);
                if (error instanceof TRPCError) throw error;
				throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error deleting comment." });
			}
		}),
});

export type CommentRouter = typeof commentRouter;