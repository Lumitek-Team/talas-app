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

		return {
			success: true,
			message: `Successfully get ${data.length} categories`,
			data,
		};
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
						select: {
							id: true,
							slug: true,
							title: true,
							count_projects: true,
						},
					})
				);

				return {
					success: true,
					message: `Successfully get category`,
					data,
				};
			} catch (error) {
				throw new Error("Error fetching category: " + error);
			}
		}),
});

export type CategoryRouter = typeof categoryRouter;