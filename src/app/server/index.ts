import { categoryRouter } from "./router/category";
import { followRouter } from "./router/follow";
import { likeCommentRouter } from "./router/likeComment";
import { likeProjectRouter } from "./router/likeProject";
import { notificationRouter } from "./router/notification";
import { projectRouter } from "./router/project";
import { userRouter } from "./router/user";
import { router } from "./trpc";

export const appRouter = router({
    user: userRouter,
    category: categoryRouter,
    project: projectRouter,
    follow: followRouter,
    likeProject: likeProjectRouter,
    likeComment: likeCommentRouter,
    notification: notificationRouter,
});

export type AppRouter = typeof appRouter;