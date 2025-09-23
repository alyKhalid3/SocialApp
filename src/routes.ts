import { Router } from "express";
import userRouter from "./modules/authModule/auth.controller";
const baseRouter = Router();
baseRouter.use("/auth",userRouter)
export default baseRouter