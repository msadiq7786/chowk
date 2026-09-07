import "module-alias/register";
import { env } from "./config/env.js";
import { app } from "./app.js";
import { logger } from "./utils/logger.js";
import { closeDatabaseConnection, connectToDatabase } from "./db/mongoDB.js";

const server = await connectToDatabase()
  .then(() =>
    app.listen(env.PORT, () => {
      logger.info(`Server listening on port ${env.PORT}`);
    }),
  )
  .catch((error) => {
    logger.error("Failed to start server", {
      error: error instanceof Error ? error.message : String(error),
    });

    process.exit(1);
  });

const shutdown = async (signal: NodeJS.Signals) => {
  logger.info(`Received ${signal}, shutting down`);

  server.close(async () => {
    await closeDatabaseConnection();
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
