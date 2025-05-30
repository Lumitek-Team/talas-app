// server/trpc/routers/comment.ts (Refactored create procedure)
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import prisma from "@/lib/prisma";
import { retryConnect } from "@/lib/utils"; // Assuming retryConnect is in this path
import { currentUser } from "@clerk/nextjs/server";
import { Comment, Prisma } from "@prisma/client"; // Import Prisma for types if needed
import { TRPCError } from "@trpc/server"; // For throwing structured errors

// getAllDescendantCommentIds function remains the same as you provided
// ... (getAllDescendantCommentIds function here) ...
async function getAllDescendantCommentIds(
	prismaClient: Prisma.TransactionClient, // Use Prisma.TransactionClient if used within a transaction
	parentId: string
): Promise<string[]> {
	const children = await prismaClient.comment.findMany({
		where: { parent_id: parentId },
		select: { id: true },
	});
	let allIds: string[] = [];
	for (const child of children) {
		allIds.push(child.id);
		const descendants = await getAllDescendantCommentIds(prismaClient, child.id); // Pass prismaClient
		allIds = allIds.concat(descendants);
	}
	return allIds;
}


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
			const user = await currentUser(); // Use Clerk's currentUser for backend auth
			
			if (!user || !user.id) {
				throw new TRPCError({ code: "UNAUTHORIZED", message: "User not authenticated." });
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

			try {
                // The transaction returns an array of results for each operation.
                // The first operation is prisma.comment.create, so its result is at index 0.
				const transactionResult = await retryConnect(() =>
					prisma.$transaction([
						prisma.comment.create({
							data: {
								id_project,
								content,
								parent_id,
								id_user: user.id, // Use authenticated user's ID
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
                
                const newComment = transactionResult[0] as Comment; // Cast the first result to Comment
				return newComment;

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
				return comment;
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
                 // Use a transaction to ensure atomicity
                await retryConnect(() => prisma.$transaction(async (tx) => {
                    const commentToDelete = await tx.comment.findUnique({
                        where: { id: input.id, id_user: user.id }, // Re-check ownership inside transaction
                    });

                    if (!commentToDelete) {
                        throw new TRPCError({ code: 'NOT_FOUND', message: 'Comment not found or you do not have permission to delete it.' });
                    }

                    const descendantIds = await getAllDescendantCommentIds(tx, input.id);
                    const idsToDelete = [input.id, ...descendantIds];
                    
                    await tx.comment.deleteMany({
                        where: {
                            id: { in: idsToDelete },
                        },
                    });

                    await tx.project.update({
                        where: {
                            id: input.id_project,
                        },
                        data: {
                            count_comments: {
                                decrement: idsToDelete.length,
                            },
                        },
                    });
                }));
                return { success: true, deletedCount: 1 }; // Return a success indicator
			} catch (error) {
                console.error("Error deleting comment in backend:", error);
                if (error instanceof TRPCError) throw error;
				throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error deleting comment." });
			}
		}),
});

// export type CategoryRouter = typeof commentRouter; // This was likely a typo, should be CommentRouter
export type CommentRouter = typeof commentRouter;