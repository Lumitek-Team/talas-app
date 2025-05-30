import { protectedProcedure, router } from "../trpc";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

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

			const existingBookmark = await prisma.bookmark.findFirst({
				where: {
					id_user,
					id_project,
				},
			});

			if (existingBookmark) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "Bookmark already exists",
				});
			}

			return await prisma.bookmark.create({
				data: {
					id_user,
					id_project,
				},
			});
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

			const result = await prisma.bookmark.deleteMany({
				where: {
					id_user,
					id_project,
				},
			});
			return result;
		}),
});

export type FollowRouter = typeof bookmarkRouter;