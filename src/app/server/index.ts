import { categoryRouter } from "./router/category";
import { userRouter } from "./router/user";
import { router } from "./trpc";

export const appRouter = router({
    user: userRouter,
    category: categoryRouter
});

export type AppRouter = typeof appRouter;