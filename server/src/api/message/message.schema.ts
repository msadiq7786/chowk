import mongoose, { Schema, type InferSchemaType } from "mongoose";

const messageSchema = new Schema(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      required: true,
    },

    receiverId: {
      type: Schema.Types.ObjectId,
      required: true,
    },

    text: {
      type: String,
      required: true,
      trim: true,
    },

    serviceRequestId: {
      type: Schema.Types.ObjectId,
      ref: "ServiceRequest",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

export type Message = InferSchemaType<typeof messageSchema>;

export const MessageModel = mongoose.model("Message", messageSchema);
