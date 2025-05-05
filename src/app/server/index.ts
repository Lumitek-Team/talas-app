import { categoryRouter } from "./router/category";
import { projectRouter } from "./router/project";
import { userRouter } from "./router/user";
import { router } from "./trpc";

export const appRouter = router({
    user: userRouter,
    category: categoryRouter,
    project: projectRouter
});

export type AppRouter = typeof appRouter;