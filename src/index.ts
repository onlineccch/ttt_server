import { createServer } from "http";
import { Server } from "socket.io";
import { Cluster } from "ioredis";
import { createAdapter } from "@socket.io/redis-streams-adapter";
import { EnvSettings } from "./conf/settings";
import { logger } from "./conf/logger";

(async () => {
  try {
    const redisClient = new Cluster(
      [
        {
          host: "localhost",
          port: 7001,
        },
        {
          host: "localhost",
          port: 7002,
        },
        {
          host: "localhost",
          port: 7003,
        },
        {
          host: "localhost",
          port: 7004,
        },
        {
          host: "localhost",
          port: 7005,
        },
        {
          host: "localhost",
          port: 7006,
        },
      ],
      {
        enableReadyCheck: true,
        redisOptions: {
          connectTimeout: 10_000,
          commandTimeout: 5_000,
        },
        natMap: {
          "192.168.3.11:6379": { host: "localhost", port: 7001 },
          "192.168.3.12:6379": { host: "localhost", port: 7002 },
          "192.168.3.13:6379": { host: "localhost", port: 7003 },
          "192.168.3.14:6379": { host: "localhost", port: 7004 },
          "192.168.3.15:6379": { host: "localhost", port: 7005 },
          "192.168.3.16:6379": { host: "localhost", port: 7006 },
        },
      }
    );

    redisClient.on("connect", () => {
      logger.info("✅ Connected to Redis cluster");
    });

    redisClient.on("ready", async () => {
      logger.info("✅ Redis cluster is ready for operations");
      //Test cluster-specific operation
      const ping = await redisClient.ping();
      if (ping == "PONG") {
        logger.info("✅ Ping successful...");
      }
    });

    redisClient.on("error", (err) => {
      logger.error("❌ Redis cluster error:", err);
    });

    redisClient.on("close", () => {
      logger.error("😒 Redis cluster connection closed");
    });

    redisClient.on("error", (err) => {
      throw `Err at Redis Clusters creation: ${err}`;
    });

    const httpServer = createServer();
    logger.info("🚀 HTTP server created...");

    const io = new Server(httpServer, {
      adapter: createAdapter(redisClient),
    });
    logger.info("🔥 SocketIO server created...");

    io.on("connection", (socket) => {
      logger.info(`Connected ${socket.id}`);
    });

    httpServer.listen(EnvSettings.SOCKET_PORT);
    logger.info(`⬆️ Server listening at Port ${EnvSettings.SOCKET_PORT}...`);
  } catch (err) {
    logger.error(`❌ Err ${err}`);
    process.exit(1);
  }
})();
