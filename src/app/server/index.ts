import { bookmarkRouter } from "./router/bookmark";
import { categoryRouter } from "./router/category";
import { commentRouter } from "./router/comment";
import { followRouter } from "./router/follow";
import { projectRouter } from "./router/project";
import { userRouter } from "./router/user";
import { router } from "./trpc";

export const appRouter = router({
	user: userRouter,
	category: categoryRouter,
	project: projectRouter,
	follow: followRouter,
	comment: commentRouter,
	bookmark: bookmarkRouter,
});

export type AppRouter = typeof appRouter;
