import { asyncHandler } from "@/utils/async-handler.js";
import { CaptainModel } from "./captain.schema.js";
import { ApiError } from "@/utils/api-error.js";
import { ApiResponse } from "@/utils/api-response.js";
import type { Request, Response } from "express";
import { uploadOnCloudinary } from "@/utils/cloudinary.js";
import fs from "fs";
import { getIo } from "@/socket/index.js";
import { ServiceRequestModel } from "../service/service.schema.js";

const io = getIo();

const createCaptain = asyncHandler(async (req, res) => {
  const { id: userId } = req.user;
  const result = req.body;

  const files = req.files as {
    profileImage?: Express.Multer.File[];
    workImages?: Express.Multer.File[];
  };

  const profileImagePath = files.profileImage?.[0]?.path ?? null;
  const workImagePaths = files.workImages?.map((file) => file.path) ?? [];

  if (!profileImagePath) {
    throw new ApiError(400, "Profile image is required");
  }
  if (workImagePaths.length === 0) {
    throw new ApiError(400, "At least one work image is required");
  }

  const existingCaptain = await CaptainModel.findOne({ userId });
  if (existingCaptain) {
    // Deleting temp images
    fs.unlinkSync(profileImagePath);
    workImagePaths.map((file) => fs.unlinkSync(file));
    throw new ApiError(400, "Captain already exists");
  }

  const profileImageUrl = await uploadOnCloudinary(
    profileImagePath,
    "captains/profile",
  );
  if (!profileImageUrl) {
    throw new ApiError(500, "Failed to upload profile image");
  }

  const workUploadResults = await Promise.all(
    workImagePaths.map((file) => uploadOnCloudinary(file, "captains/work")),
  );

  const validWorkImages = workUploadResults.filter(
    (url): url is string => url !== null,
  );

  if (validWorkImages.length === 0) {
    throw new ApiError(500, "Failed to upload work images");
  }

  const captain = await CaptainModel.create({
    userId,
    skills: result.skills,
    hourlyRate: result.hourlyRate,
    profileImage: profileImageUrl,
    workImages: validWorkImages,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, captain, "Captain created successfully"));
});

const updateCaptainLocation = asyncHandler(async (req, res) => {
  const captainId = req.user.id;

  const { coordinates } = req.body;

  const captain = await CaptainModel.findOneAndUpdate(
    { userId: captainId },
    {
      location: {
        type: "Point",
        coordinates,
      },
    },
    {
      new: true,
      runValidators: true,
    },
  ).select("location");

  if (!captain) {
    throw new ApiError(404, "Captain not found");
  }

  const serviceRequest = await ServiceRequestModel.findOne({
    captainId: captain._id,
    status: {
      $in: ["ACCEPTED", "STARTED"],
    },
  }).select("_id userId");

  if (serviceRequest) {
    io.to(`user:${serviceRequest.userId}`).emit("captain:location:update", {
      captainId: captain._id,
      serviceRequestId: serviceRequest._id,
      location: captain.location,
    });
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        captain.location,
        "Captain location updated successfully",
      ),
    );
});

export { createCaptain, updateCaptainLocation };
