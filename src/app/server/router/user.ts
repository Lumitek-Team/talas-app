import { publicProcedure, router } from '../trpc'
import prisma from '@/lib/prisma'

export const userRouter = router({
  getUsers: publicProcedure.query(async () => {
    return await prisma.user.findMany()
  }),
})

export type UserRouter = typeof userRouter