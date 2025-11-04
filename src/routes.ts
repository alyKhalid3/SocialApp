import { Router } from "express";
import { authRouter, authRoutes, chatRouter, chatRoutes, commentRouter, commentRoutes, postRouter, postRoutes, userRouter, userRoutes } from "./modules";


const baseRouter = Router();
baseRouter.use(authRoutes.base,authRouter)
baseRouter.use(postRoutes.base,postRouter)
baseRouter.use(userRoutes.base,userRouter)
baseRouter.use(commentRoutes.base,commentRouter)
baseRouter.use(chatRoutes.base,chatRouter)
export default baseRouter