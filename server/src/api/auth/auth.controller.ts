import type { Request, Response } from "express";
import { CaptainModel } from "../captain/captain.schema.js";
import { asyncHandler } from "@/utils/async-handler.js";
import { ApiResponse } from "@/utils/api-response.js";

const getMe = asyncHandler(async (req, res) => {
  const user = req.user;

  const captain = await CaptainModel.findOne({
    userId: user.id,
  }).lean();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        captain,
      },
      "User fetched successfully",
    ),
  );
});

export { getMe };
