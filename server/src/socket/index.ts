import { Server as SocketIOServer } from "socket.io";
import type { Server as HttpServer } from "http";
import { env } from "@/config/env.js";
import { logger } from "@/utils/logger.js";

let io: SocketIOServer;

export const initSocket = (server: HttpServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: env.CLIENT_URL,
      methods: ["GET", "POST"],
    },
  });

  logger.info("Socket.io initialized");

  io.on("connection", (socket) => {
    logger.info(`New socket connection: ${socket.id}`);

    // Capatin Joining the Room
    socket.on("captain:join", (captainId) => {
      socket.join(`captain:${captainId}`);
    });

    socket.on("disconnect", () => {
      logger.info("User disconnected");
    });
  });

  return io;
};

export const getIo = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
