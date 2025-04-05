import { drizzle } from "drizzle-orm/neon-serverless";
import { dbEnv, env } from "./env";

export const db = drizzle({
  connection: dbEnv.DATABASE_URL,
  casing: "snake_case",
  logger: env.NODE_ENV === "development",
});
