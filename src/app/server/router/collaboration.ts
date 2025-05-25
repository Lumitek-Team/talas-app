import { protectedProcedure, router } from "../trpc";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { retryConnect } from "@/lib/utils";

export const collaborationRouter = router({
	// Follow a user
	accept: protectedProcedure.input(z.string()).mutation(async ({ input }) => {
		const collab = await retryConnect(() =>
			prisma.projectUser.update({
				where: {
					id: input,
				},
				data: {
					collabStatus: "ACCEPTED",
				},
			})
		);

		if (!collab) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Collaboration not found",
			});
		}
		const collabData = {
			id: collab.id,
			id_project: collab.id_project,
			ownership: collab.ownership,
			collabStatus: collab.collabStatus,
		};
		return {
			success: true,
			message: "You have accepted the collaboration",
			data: collabData,
		};
	}),

	reject: protectedProcedure.input(z.string()).mutation(async ({ input }) => {
		// delete collaboration
		const collab = await retryConnect(() =>
			prisma.projectUser.delete({
				where: {
					id: input,
				},
			})
		);
		if (!collab) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Collaboration not found",
			});
		}
		const collabData = {
			id: collab.id,
			id_project: collab.id_project,
			ownership: collab.ownership,
			collabStatus: collab.collabStatus,
		};

		return {
			success: true,
			message: "You have rejected the collaboration",
			data: collabData,
		};
	}),
});

export type FollowRouter = typeof collaborationRouter;
