import { createServer } from "http";
import { Server } from "socket.io";
import { Cluster } from "ioredis";
import { createAdapter } from "@socket.io/redis-streams-adapter";
import { EnvSettings } from "./utils/settings";

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

    redisClient.on("connect", async () => {
      console.log("✅ Connected to Redis cluster");

      //Test cluster-specific operation
      const ping = await redisClient.ping();
      console.log("✅ Ping successful:", ping);
    });

    redisClient.on("ready", () => {
      console.log("✅ Redis cluster is ready for operations");
    });

    redisClient.on("error", (err) => {
      console.error("❌ Redis cluster error:", err);
    });

    redisClient.on("close", () => {
      console.log("😒 Redis cluster connection closed");
    });

    redisClient.on("error", (err) => {
      throw `Err at Redis Clusters creation: ${err}`;
    });

    const httpServer = createServer();
    console.log("HTTP server created...");

    const io = new Server(httpServer, {
      adapter: createAdapter(redisClient),
    });
    console.log("SocketIO server created...");

    io.on("connection", (socket) => {
      console.log(`Connected ${socket.id}`);
    });

    httpServer.listen(EnvSettings.SOCKET_PORT);
    console.log(`Server listening at Port ${EnvSettings.SOCKET_PORT}...`);
  } catch (err) {
    console.error(`Err ${err}`);
    return;
  }
})();
