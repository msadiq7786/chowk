import { Schema, model, type InferSchemaType } from "mongoose";

export const serviceStatus = [
  "PENDING",
  "ACCEPTED",
  "REJECTED",
  "STARTED",
  "COMPLETED",
  "CANCELLED",
] as const;

const serviceRequestSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    captainId: {
      type: Schema.Types.ObjectId,
      ref: "Captain",
      default: null,
      index: true,
    },

    title: {
      type: String,
      default: "Service Request",
      trim: true,
    },

    serviceType: {
      type: String,
      trim: true,
      required: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    images: {
      type: [String],
      default: [],
    },

    budget: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: serviceStatus,
      default: "PENDING",
      index: true,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },

      coordinates: {
        type: [Number],
        required: true,
      },
    },

    startedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

serviceRequestSchema.index({
  location: "2dsphere",
});
export type ServiceRequest = InferSchemaType<typeof serviceRequestSchema>;

export const ServiceRequestModel = model(
  "ServiceRequest",
  serviceRequestSchema,
);
