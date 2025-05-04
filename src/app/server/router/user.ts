import { protectedProcedure, router } from "../trpc";
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
				auth_type: z.string(),
				photo_profile: z.string(),
			}))
		.mutation(async ({ input }) => {
			const existingUser = await retryConnect(() =>
				prisma.user.findFirst({
					where: {
						OR: [{ id: input.id }, { email: input.email }],
					},
				})
			);

			const username = input.email.split("@")[0];
			if (!existingUser) {
				return await prisma.user.create({
					data: {
						id: input.id,
						username: username,
						name: input.name,
						email: input.email,
						auth_type: input.auth_type,
						photo_profile: input.photo_profile,
					},
				});
			}
		}),

	getAll: protectedProcedure
		.input(
			z.object({
				limit: z.number().optional(),
				offset: z.number().optional(),
			}).optional()
		)
		.query(async ({ input }) => {
			return await prisma.user.findMany({
				take: input?.limit,
				skip: input?.offset,
				select: {
					username: true,
					name: true,
					bio: true,
					photo_profile: true,
					instagram: true,
					linkedin: true,
					github: true,
					gender: true,
					email_contact: true,
				}
			});
		}),

	getById: protectedProcedure
		.input(
			z.object({
				id: z.string()
			})
		)
		.query(async ({ input }) => {
			return await prisma.user.findUnique({
				where: {
					id: input.id
				},
				select: {
					username: true,
					name: true,
					bio: true,
					photo_profile: true,
					instagram: true,
					linkedin: true,
					github: true,
					gender: true,
					email_contact: true,
					count_summary: {
						select: {
							count_project: true,
							count_comment: true,
							count_follower: true,
							count_following: true,
							count_notif_unread: true,
						},
					},
				}
			})
		}),

	getPhotoProfile: protectedProcedure
		.input(
			z.object({
				id: z.string().optional(),
				username: z.string().optional(),
			})
		)
		.query(async ({ input }) => {
			const { id, username } = input

			if (!id && !username) {
				throw new Error('You must provide either id or username.')
			  }
		
			  const user = await prisma.user.findFirst({
				where: id
				  ? { id }
				  : { username: username! },
				select: {
				  photo_profile: true,
				},
			  })
		
			  if (!user || !user.photo_profile) {
				throw new Error('User or photo profile not found.')
			  }
		
			  return {
				photo_profile: user.photo_profile,
			  }
		})
});

export type UserRouter = typeof userRouter;
