import { Router } from "express";
import { requireAuth } from "./auth.middleware.js";
import { getMe } from "./auth.controller.js";

const authRouter = Router();

authRouter.get("/me", requireAuth, getMe);

export default authRouter;
