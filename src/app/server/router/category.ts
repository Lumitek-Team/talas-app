import { z } from 'zod'
import { publicProcedure, router } from '../trpc'
import prisma from '@/lib/prisma'

export const categoryRouter = router({
  getAll: publicProcedure.query(async () => {
    return await prisma.category.findMany()
  }),

  getBySlug: publicProcedure.input(
    z.object({
      slug: z.string(),
    }),
  ).query(async ({ input }) => {
    return await prisma.category.findFirst({
      where: {
        slug: input.slug,
      },
    })
  }),
})


export type CategoryRouter = typeof categoryRouter