import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import prisma from "@/lib/prisma";
import { retryConnect } from "@/lib/utils";
import { currentUser } from "@clerk/nextjs/server";
import { Comment } from "@prisma/client";

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
				const comment: Comment = await retryConnect(() =>
					prisma.comment.create({
						data: {
							id_project,
							content,
							parent_id,
							id_user: userId,
						},
					})
				);
				return comment;
			} catch (error) {
				throw new Error("Error creating comment: " + error);
			}
		}),
});

export type CategoryRouter = typeof commentRouter;
