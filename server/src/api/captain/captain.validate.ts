import { z } from "zod";

const imageFileSchema = z.object({
  mimetype: z
    .string()
    .refine(
      (type) => ["image/jpeg", "image/png", "image/webp"].includes(type),
      "Only JPEG, PNG, and WebP images are allowed",
    ),

  size: z.number().max(5 * 1024 * 1024, "Image must be less than 5MB"),
});

export const createCaptainSchema = z.object({
  body: z.object({
    skills: z
      .array(z.string().trim().min(1, "Skill cannot be empty"))
      .default([]),

    hourlyRate: z.number().min(0, "Hourly rate cannot be negative").default(0),
  }),

  files: z.object({
    profileImage: z
      .array(imageFileSchema)
      .max(1, "Only one profile image is allowed")
      .optional(),

    "workImages[]": z
      .array(imageFileSchema)
      .max(10, "Maximum 10 work images are allowed")
      .default([]),
  }),
});

export const updateCaptainLocationSchema = z.object({
  coordinates: z
    .tuple([z.coerce.number(), z.coerce.number()])
    .refine(
      ([longitude, latitude]) =>
        longitude >= -180 &&
        longitude <= 180 &&
        latitude >= -90 &&
        latitude <= 90,
      {
        message: "Invalid longitude or latitude",
      },
    ),
});

export type CreateCaptainInput = z.infer<typeof createCaptainSchema>;
