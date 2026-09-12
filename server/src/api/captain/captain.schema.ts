import { model, Schema, type InferSchemaType } from "mongoose";

const captainSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
      index: true,
    },

    skills: {
      type: [String],
      default: [],
    },

    hourlyRate: {
      type: Number,
      default: 0,
      min: 0,
    },

    profileImage: {
      type: String,
      trim: true,
    },

    workImages: {
      type: [String],
      default: [],
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
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
  },
  {
    timestamps: true,
  },
);

captainSchema.index({ location: "2dsphere" });

export type Captain = InferSchemaType<typeof captainSchema>;

export const CaptainModel = model<Captain>("Captain", captainSchema);
