import winston from "winston";
import { existsSync, mkdir } from "fs";

const customFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp(),
  winston.format.printf(({ timestamp, level, message }) => {
    return `${timestamp} [${level}]: ${message}`;
  })
);

if (existsSync("logs")) {
  mkdir("logs", () => {});
}

export const logger = winston.createLogger({
  level: "info",
  format: customFormat,
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: `${Date.now()}.log`,
      dirname: "logs",
    }),
  ],
});
