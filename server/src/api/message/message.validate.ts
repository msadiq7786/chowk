import mongoose from "mongoose";
import { z } from "zod";

const objectIdSchema = z
  .string()
  .refine((value) => mongoose.Types.ObjectId.isValid(value), {
    message: "Invalid ObjectId",
  });

export const sendMessageSchema = z.object({
  body: z.object({
    receiverId: z.string().min(1, "Receiver ID is required"),

    text: z
      .string()
      .trim()
      .min(1, "Message cannot be empty")
      .max(2000, "Message cannot exceed 2000 characters"),

    serviceRequestId: z.string().min(1, "Service request ID is required"),
  }),
});

export const getMessageSchema = z.object({
  params: {
    id: objectIdSchema,
  },
});
