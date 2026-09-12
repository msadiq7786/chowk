import { asyncHandler } from "@/utils/async-handler.js";
import { uploadOnCloudinary } from "@/utils/cloudinary.js";
import { ServiceRequestModel } from "./service.schema.js";
import { CaptainModel } from "../captain/captain.schema.js";
import { ApiError } from "@/utils/api-error.js";
import { getIo } from "@/socket/index.js";
import { ApiResponse } from "@/utils/api-response.js";

const io = getIo();

export const createService = asyncHandler(async (req, res) => {
  const { id: userId } = req.user;

  const { title, serviceType, description, location } = req.body;
  const files = req.files as Express.Multer.File[] | undefined;
  let imageUrls: string[] = [];

  if (files?.length) {
    const uploadedImages = await Promise.all(
      files.map(
        async (file) => await uploadOnCloudinary(file.path, "services"),
      ),
    );
    imageUrls = uploadedImages.filter((url): url is string => url !== null);
  }

  const serviceRequest = await ServiceRequestModel.create({
    userId,
    title: title ?? "Service Request",
    serviceType,
    description,
    images: imageUrls,
    location,
  });

  const nearbyCaptains = await CaptainModel.find({
    skills: {
      $in: [serviceType],
    },

    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: location.coordinates,
        },
        $maxDistance: 10_000, // 10 KM
      },
    },

    isActive: true,
  }).select("_id userId skills location");

  // --------------------------------
  //  Emit socket event
  // --------------------------------
  const io = getIo();

  for (const captain of nearbyCaptains) {
    io.to(`captain:${captain._id}`).emit("service:new", {
      serviceRequest,
    });
  }

  return res.status(201).json({
    success: true,
    message: "Service request created successfully",
    data: {
      serviceRequest,
      matchedCaptains: nearbyCaptains.length,
    },
  });
});

export const acceptService = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;

  const captain = await CaptainModel.findOne({
    userId: req.user.id,
    isActive: true,
  }).select("_id userId skills location");

  if (!captain) {
    throw new ApiError(404, "Captain profile not found");
  }

  // First get the service
  const service = await ServiceRequestModel.findById(serviceId);

  if (!service) {
    throw new ApiError(404, "Service profile not found");
  }

  // Check whether this service is already accepted
  if (service.status !== "PENDING") {
    throw new ApiError(
      409,
      "Service has already been accepted by another captain",
    );
  }

  // Check whether captain has the required skill
  const hasSkill = captain.skills.includes(service.serviceType);

  if (!hasSkill) {
    throw new ApiError(400, "You are not eligible for this service");
  }

  // Check captain is within 10 KM of the service
  const nearbyCaptains = await CaptainModel.find({
    _id: captain._id,

    skills: {
      $in: [service.serviceType],
    },

    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: service.location!.coordinates,
        },
        $maxDistance: 10_000,
      },
    },

    isActive: true,
  }).select("_id userId skills location");

  if (nearbyCaptains.length === 0) {
    throw new ApiError(403, "You must be within 10 KM of the service location");
  }

  // IMPORTANT:
  // Only update if the service is STILL pending.
  // This prevents two captains from accepting the same service.
  const acceptedService = await ServiceRequestModel.findOneAndUpdate(
    {
      _id: serviceId,
      status: "PENDING",
    },
    {
      $set: {
        status: "ACCEPTED",
        captainId: captain._id,
      },
    },
    {
      new: true,
    },
  );

  if (!acceptedService) {
    throw new ApiError(
      409,
      "Service has already been accepted by another captain",
    );
  }

  const serviceLocation = acceptedService.location;

  if (!serviceLocation) {
    throw new ApiError(400, "Service location is required");
  }

  // Find all eligible captains within 10 KM
  const nearbyEligibleCaptains = await CaptainModel.find({
    skills: {
      $in: [acceptedService.serviceType],
    },

    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: serviceLocation.coordinates,
        },
        $maxDistance: 10_000,
      },
    },

    isActive: true,
  }).select("_id userId skills location");

  // Notify other captains that the service is no longer available
  for (const nearbyCaptain of nearbyEligibleCaptains) {
    if (nearbyCaptain._id.equals(captain._id)) {
      continue;
    }

    io.to(`captain:${nearbyCaptain._id}`).emit("service:accepted", {
      serviceId: acceptedService._id,
      captainId: captain._id,
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, acceptService, "Service accepted successfully"));
});
