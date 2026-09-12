import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { validateData } from "@/middleware/zod-validator.js";
import { createServiceSchema } from "./service.validate.js";
import { createService } from "./service.controller.js";
import { upload } from "@/middleware/multer.middleware.js";

const serviceRouter = Router();

serviceRouter.use(requireAuth);

serviceRouter.post(
  "/",
  upload.fields([{ name: "images", maxCount: 5 }]),
  validateData(createServiceSchema),
  createService,
);

export default serviceRouter;
