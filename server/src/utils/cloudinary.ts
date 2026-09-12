import { env } from "@/config/env.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (path: string, folder: string) => {
  try {
    if (!path) return null;
    const response = await cloudinary.uploader.upload(path, {
      resource_type: "auto",
      folder,
    });

    fs.unlinkSync(path);
    return response.secure_url;
  } catch (error) {
    fs.unlinkSync(path);
    return null;
  }
};

export { uploadOnCloudinary };
