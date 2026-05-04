// src/app/server/trpc.ts
import { initTRPC, TRPCError } from '@trpc/server'
import { Context } from './context'

const t = initTRPC.context<Context>().create()

const timingMiddleware = t.middleware(async ({ path, type, next, ctx }) => {
	const start = performance.now()
	try {
		const result = await next()
		const ms = performance.now() - start
		// Keep logs compact but useful. Example:
		// [tRPC] query user.getById 12.3ms userId=user_xxx
		console.log(
			`[tRPC] ${type} ${path} ${ms.toFixed(1)}ms userId=${ctx.auth.userId ?? 'anon'}`,
		)
		return result
	} catch (err) {
		const ms = performance.now() - start
		console.error(
			`[tRPC] ${type} ${path} FAILED ${ms.toFixed(1)}ms userId=${ctx.auth.userId ?? 'anon'}`,
		)
		throw err
	}
})

const isAuthed = t.middleware(({ next, ctx }) => {
	if (!ctx.auth.userId) {
		throw new TRPCError({ code: 'UNAUTHORIZED' })
	}
	return next({
		ctx: {
			auth: ctx.auth,
		},
	})
})

export const router = t.router
export const publicProcedure = t.procedure.use(timingMiddleware)
export const protectedProcedure = t.procedure.use(timingMiddleware).use(isAuthed)