import "dotenv/config";
import { z } from "zod";

const EnvSchema = z.object({
  SOCKET_PORT: z.string().default("3333"),
  NODE_ENV: z.enum(["development", "production"]).default("development"),
});

const EnvSettingServer = EnvSchema.safeParse(process.env);

if (!EnvSettingServer.success) {
  console.error(EnvSettingServer.error.issues);
  throw new Error("There is an error with the server environment variables");
}

export const EnvSettings = EnvSettingServer.data;
