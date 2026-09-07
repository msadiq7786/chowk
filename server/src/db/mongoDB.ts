import mongoose from "mongoose";

import { env } from "@/config/env.js";
import { logger } from "@/utils/logger.js";

export async function connectToDatabase() {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      dbName: env.MONGODB_DB_NAME,
    });

    logger.info("MongoDB connection established");
  } catch (error) {
    logger.error("MongoDB connection failed", error);
    process.exit(1);
  }
}

export async function closeDatabaseConnection() {
  await mongoose.connection.close();

  logger.info("MongoDB connection closed");
}
