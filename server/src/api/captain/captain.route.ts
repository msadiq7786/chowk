import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { createCaptain, updateCaptainLocation } from "./captain.controller.js";
import { upload } from "@/middleware/multer.middleware.js";
import { validateData } from "@/middleware/zod-validator.js";
import {
  createCaptainSchema,
  updateCaptainLocationSchema,
} from "./captain.validate.js";

const captainRouter = Router();

captainRouter.use(requireAuth);
captainRouter.post(
  "/",
  validateData(createCaptainSchema),
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "workImages", maxCount: 10 },
  ]),
  createCaptain,
);

captainRouter.patch(
  "/location",
  validateData(updateCaptainLocationSchema),
  updateCaptainLocation,
);

export default captainRouter;
