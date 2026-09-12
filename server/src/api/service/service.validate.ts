import { z } from "zod";

const locationSchema = z.preprocess(
  (value) => {
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }

    return value;
  },
  z.object({
    type: z.literal("Point"),

    coordinates: z
      .array(z.coerce.number())
      .length(2, "Coordinates must contain longitude and latitude"),
  }),
);

export const createServiceSchema = z.object({
  body: z.object({
    title: z
      .string()
      .trim()
      .min(1, "Title is required")
      .max(100, "Title cannot exceed 100 characters")
      .optional(),

    serviceType: z
      .string()
      .trim()
      .min(1, "Service type is required")
      .max(100, "Service type cannot exceed 100 characters"),

    description: z
      .string()
      .trim()
      .min(10, "Description must be at least 10 characters")
      .max(2000, "Description cannot exceed 2000 characters"),

    location: locationSchema,

    budget: z.coerce
      .number("Budget must be number")
      .positive("Budget must be positive"),
  }),
});
