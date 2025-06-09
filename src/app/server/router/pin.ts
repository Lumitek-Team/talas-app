import { protectedProcedure, router } from "../trpc";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { retryConnect } from "@/lib/utils";

export const pinRouter = router({
	// Follow a user
	pin: protectedProcedure
		.input(
			z.object({
				id_project: z.string(),
				id_user: z.string(),
			})
		)
		.mutation(async ({ input }) => {
			const { id_project, id_user } = input;

			try {
				const project = await retryConnect(() =>
					prisma.project.findFirst({
						where: {
							OR: [{ id: id_project }, { slug: id_project }],
							project_user: {
								some: {
									id_user: id_user,
									OR: [
										{ ownership: "OWNER" },
										{
											AND: [
												{ ownership: "COLLABORATOR" },
												{ collabStatus: "ACCEPTED" },
											],
										},
									],
								},
							},
						},
						select: {
							id: true,
						},
					})
				);

				if (!project) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Project not found or you don't have permission.",
					});
				}

				const existingPin = await retryConnect(() =>
					prisma.pinProject.findFirst({
						where: {
							id_project: project.id,
							id_user: id_user,
						},
					})
				);
				if (existingPin) {
					throw new TRPCError({
						code: "CONFLICT",
						message: "Project is already pinned.",
					});
				}

				const pin = await retryConnect(() =>
					prisma.pinProject.create({
						data: {
							id_project: project.id,
							id_user: id_user,
						},
					})
				);

				return {
					success: true,
					message: "Successfully pin project.",
					data: pin,
				};
			} catch (error) {
				if (error instanceof TRPCError) throw error;
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: `Failed to pin project: ${
						error instanceof Error ? error.message : "Unknown error"
					}`,
				});
			}

			return { success: true };
		}),

	unpin: protectedProcedure
		.input(
			z.object({
				id_project: z.string(),
				id_user: z.string(),
			})
		)
		.mutation(async ({ input }) => {
			const { id_project, id_user } = input;

			try {
				const project = await retryConnect(() =>
					prisma.project.findFirst({
						where: {
							OR: [{ id: id_project }, { slug: id_project }],
							project_user: {
								some: {
									id_user: id_user,
									OR: [
										{ ownership: "OWNER" },
										{
											AND: [
												{ ownership: "COLLABORATOR" },
												{ collabStatus: "ACCEPTED" },
											],
										},
									],
								},
							},
						},
						select: {
							id: true,
						},
					})
				);

				if (!project) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Project not found or you don't have permission.",
					});
				}

				const existingPin = await retryConnect(() =>
					prisma.pinProject.findFirst({
						where: {
							id_project: project.id,
							id_user: id_user,
						},
					})
				);

				if (!existingPin) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Pin not found.",
					});
				}

				await retryConnect(() =>
					prisma.pinProject.delete({
						where: {
							id: existingPin.id,
						},
					})
				);

				return {
					success: true,
					message: "Successfully unpinned project.",
				};
			} catch (error) {
				if (error instanceof TRPCError) throw error;
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: `Failed to unpin project: ${
						error instanceof Error ? error.message : "Unknown error"
					}`,
				});
			}
		}),
});

export type PinRouter = typeof pinRouter;
