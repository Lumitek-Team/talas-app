import { publicProcedure, router } from '../trpc'
import prisma from '@/lib/prisma'

export const categoryRouter = router({
  getCategories: publicProcedure.query(async () => {
    return await prisma.category.findMany()
  }),
})

export type CategoryRouter = typeof categoryRouter