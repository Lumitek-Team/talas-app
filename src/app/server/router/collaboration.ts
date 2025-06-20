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
				include: {
					project: {
						select: {
							id: true,
							title: true,
							project_user: {
								where: { ownership: "OWNER" },
								select: { id_user: true },
							},
						},
					},
				},
			})
		);

		if (!collab) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Collaboration not found",
			});
		}

		// Notify the owner
		const ownerId = collab.project.project_user[0]?.id_user;
		if (ownerId) {
			await retryConnect(() =>
				prisma.notification.create({
					data: {
						id_user: ownerId,
						title: `Your collaboration request for project "${collab.project.title}" has been accepted.`,
						is_read: false,
						type: "COLLABORATION" as const,
					},
				})
			);
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
		const collab = await retryConnect(() =>
			prisma.projectUser.delete({
				where: {
					id: input,
				},
				include: {
					project: {
						select: {
							id: true,
							title: true,
							project_user: {
								where: { ownership: "OWNER" },
								select: { id_user: true },
							},
						},
					},
				},
			})
		);

		if (!collab) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Collaboration not found",
			});
		}

		// Notify the owner
		const ownerId = collab.project.project_user[0]?.id_user;
		if (ownerId) {
			await retryConnect(() =>
				prisma.notification.create({
					data: {
						id_user: ownerId,
						title: `Your collaboration request for project "${collab.project.title}" has been rejected.`,
						is_read: false,
						type: "COLLABORATION" as const,
					},
				})
			);
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

export type CollaborationRouter = typeof collaborationRouter;
