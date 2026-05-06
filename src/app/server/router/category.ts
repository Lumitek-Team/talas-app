import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import prisma from "@/lib/prisma";
import { CategoryType } from "@/lib/type";
import { TRPCError } from "@trpc/server";

export const categoryRouter = router({
	getAll: publicProcedure.query(async () => {
		try {
			const data: CategoryType[] = await prisma.category.findMany({
				select: {
					id: true,
					slug: true,
					title: true,
					count_projects: true,
				},
				orderBy: {
					count_projects: "desc",
				},
			});

			return {
				success: true,
				message: `Successfully get ${data.length} categories`,
				data,
			};
		} catch (error) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Error fetching categories: " + (error instanceof Error ? error.message : String(error)),
			});
		}
	}),

	getOne: publicProcedure
		.input(
			z.object({
				id: z.string().optional(),
				slug: z.string().optional(),
			})
		)
		.query(async ({ input }) => {
			try {
				const data = await prisma.category.findFirst({
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
				});

				if (!data) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Category not found",
					});
				}

				return {
					success: true,
					message: `Successfully get category`,
					data,
				};
			} catch (error) {
				if (error instanceof TRPCError) throw error;
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error fetching category: " + (error instanceof Error ? error.message : String(error)),
				});
			}
		}),
});

export type CategoryRouter = typeof categoryRouter;