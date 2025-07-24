import { createServer } from "http";
import { Server } from "socket.io";
import { Cluster } from "ioredis";
import { createAdapter } from "@socket.io/redis-streams-adapter";
import { EnvSettings } from "./conf/settings";
import { logger } from "./conf/logger";
import { roomCreationEvent, roomJoinEvent } from "./socket/events";
import { optSettings } from "./conf/args";
import { GameManager } from "./lib/gamemanager";

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
      cors: {
        origin: "*",
      },
    });
    logger.info("🔥 SocketIO server created...");

    const gm = new GameManager();
    logger.info("🕹️ Initiated game manager...");

    // handle create socket room
    io.of("/").adapter.on("create-room", (room) => {
      logger.info(`🛖 New room ${room} was created.`);
    });

    // handle delete socket room
    io.of("/").adapter.on("delete-room", (room) => {
      logger.info(`❌ Room ${room} was deleted.`);
    });

    // handle leave socket room
    io.of("/").adapter.on("leave-room", (room, id) => {
      logger.info(`➖ ${id} left the room ${room}`);
    });

    // handle join socket room
    io.of("/").adapter.on("join-room", (room, id) => {
      logger.info(`➕ Socket ${id} has joined the room ${room}`);

      const currRoom = io.of("/").adapter.rooms.get(room);

      if (!!currRoom) {
        logger.info(`🛖 Room ${room} has ${currRoom.size} members now.`);

        if (currRoom.size == 2) {
          let players: string[] = [];

          currRoom.forEach((el) => players.push(el));

          gm.create_room(room, players[0], players[1]);
        }
      }
    });

    io.on("connection", (socket) => {
      logger.info(`🔗 New socket client connected: ${socket.id}`);

      socket.on("message", (pl) => {
        socket.broadcast.emit("message", pl);
      });

      // Receive Event for room creation
      socket.on("create_room", (_, callback) =>
        roomCreationEvent(socket, gm, callback)
      );

      // Receive Event for joining room
      socket.on("join_room", (pl, callback) =>
        roomJoinEvent(socket, pl, gm, callback)
      );
    });

    httpServer.listen(optSettings["port"] || EnvSettings.SOCKET_PORT);
    logger.info(
      `⬆️ Server listening at Port ${
        optSettings["port"] || EnvSettings.SOCKET_PORT
      }...`
    );
  } catch (err) {
    logger.error(`❌ Err ${err}`);
    process.exit(1);
  }
})();
