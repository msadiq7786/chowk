import type { Request, Response } from "express";

import { asyncHandler } from "@/utils/async-handler.js";
import { ApiError } from "@/utils/api-error.js";
import { ApiResponse } from "@/utils/api-response.js";
import { ServiceRequestModel } from "../service/service.schema.js";
import { MessageModel } from "./message.schema.js";
import { getIo } from "@/socket/index.js";
import mongoose from "mongoose";

const io = getIo();

export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const senderId = req.user.id;

  const { receiverId, text, serviceRequestId } = req.body;

  const serviceRequest =
    await ServiceRequestModel.findById(serviceRequestId).select(
      "userId captainId",
    );

  if (!serviceRequest) {
    throw new ApiError(404, "Service request not found");
  }

  // Check whether sender belongs to this service
  const isUser = serviceRequest.userId === senderId;
  const isCaptain = serviceRequest.captainId?.toString() === senderId;

  if (!isUser && !isCaptain) {
    throw new ApiError(403, "You are not a participant of this service");
  }

  //Check receiver belongs to this service
  const receiverIsUser = serviceRequest.userId === receiverId;

  const receiverIsCaptain = serviceRequest.captainId?.toString() === receiverId;

  if (!receiverIsUser && !receiverIsCaptain) {
    throw new ApiError(403, "Receiver is not a participant of this service");
  }

  const message = await MessageModel.create({
    senderId,
    receiverId,
    text,
    serviceRequestId,
  });

  // Emit Event
  io.to(`user:${receiverId}`).emit("chat:message", {
    message,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, message, "Message sent successfully"));
});

export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  const { serviceRequestId } = req.params;
  const userId = req.user.id;

  const serviceRequest =
    await ServiceRequestModel.findById(serviceRequestId).select(
      "userId captainId",
    );

  if (!serviceRequest) {
    throw new ApiError(404, "Service request not found");
  }

  const isUser = serviceRequest.userId === userId;

  const isCaptain = serviceRequest.captainId?.toString() === userId;

  if (!isUser && !isCaptain) {
    throw new ApiError(403, "You are not a participant of this service");
  }

  const messages = await MessageModel.find({
    serviceRequestId: new mongoose.Types.ObjectId(serviceRequestId as string),
  }).sort({ createdAt: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, messages, "Messages fetched successfully"));
});
