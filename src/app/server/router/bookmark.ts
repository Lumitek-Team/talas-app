import { protectedProcedure, router } from "../trpc";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { retryConnect } from "@/lib/utils";

export const bookmarkRouter = router({
	create: protectedProcedure
		.input(
			z.object({
				id_user: z.string(),
				id_project: z.string(),
			})
		)
		.mutation(async ({ input }) => {
			const { id_user, id_project } = input;

			const existingBookmark = await retryConnect(() =>
				prisma.bookmark.findFirst({
					where: {
						id_user,
						id_project,
					},
				})
			);

			if (existingBookmark) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "Bookmark already exists",
				});
			}

			const bookmark = await retryConnect(() =>
				prisma.bookmark.create({
					data: {
						id_user,
						id_project,
					},
				})
			);

			return {
				success: true,
				message: "Successfully bookmarked the project",
				data: bookmark,
			};
		}),

	delete: protectedProcedure
		.input(
			z.object({
				id_user: z.string(),
				id_project: z.string(),
			})
		)
		.mutation(async ({ input }) => {
			const { id_user, id_project } = input;

			const { count } = await retryConnect(() =>
				prisma.bookmark.deleteMany({
					where: {
						id_user,
						id_project,
					},
				})
			);
			return {
				success: true,
				message: `Successfully removed ${count} bookmark`,
			};
		}),
});

export type BookmarkRouter = typeof bookmarkRouter;
