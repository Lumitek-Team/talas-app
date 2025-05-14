import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import prisma from "@/lib/prisma";
import { retryConnect } from "@/lib/utils";
import { CategoryType } from "@/lib/type";

export const categoryRouter = router({
	getAll: protectedProcedure.query(async () => {
		const data: CategoryType[] = await retryConnect(() =>
			prisma.category.findMany({
				select: {
					id: true,
					slug: true,
					title: true,
					count_projects: true,
				},
				orderBy: {
					count_projects: "desc",
				},
			})
		);

		return data;
	}),

	getOne: protectedProcedure
		.input(
			z.object({
				id: z.string().optional(),
				slug: z.string().optional(),
			})
		)
		.query(async ({ input }) => {
			try {
				const data = await retryConnect(() =>
					prisma.category.findFirst({
						where: {
							OR: [{ id: input.id }, { slug: input.slug }],
							},
						orderBy: {
							count_projects: "desc",
						},
					})
				);

				return {
					id: true,
					slug: data.slug,
					title: data.title,
					count_projects: data.count_projects,
				};
			} catch (error) {
				throw new Error("Error fetching category: " + error);
			}
		}),
});

export type CategoryRouter = typeof categoryRouter;
