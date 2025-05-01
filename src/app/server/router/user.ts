import { protectedProcedure, publicProcedure, router } from "../trpc";
import prisma from "@/lib/prisma";
import { retryConnect } from "@/lib/utils";
import { z } from "zod";

export const userRouter = router({
	syncWithSupabase: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string(),
				email: z.string().email(),
			})
		)
		.mutation(async ({ input }) => {
			const existingUser = await retryConnect(() =>
				prisma.user.findFirst({
					where: {
						OR: [{ id: input.id }, { email: input.email }],
					},
				})
			);

			if (!existingUser) {
				return await prisma.user.create({
					data: {
						id: input.id,
						name: input.name,
						email: input.email,
					},
				});
			}
		}),

	getUsers: publicProcedure.query(async () => {
		return await prisma.user.findMany();
	}),
});

export type UserRouter = typeof userRouter;
