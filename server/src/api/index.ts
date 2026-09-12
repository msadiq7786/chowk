import { Router } from "express";
import authRouter from "./auth/auth.route.js";
import captainRouter from "./captain/captain.route.js";
import serviceRouter from "./service/service.route.js";

export const apiRouter = Router();

apiRouter.use("/", authRouter);
apiRouter.use("/captain", captainRouter);
apiRouter.use("/service", serviceRouter);
