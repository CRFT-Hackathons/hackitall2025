import type { Config } from "drizzle-kit";
import { dbEnv } from "~/lib/env";

export default {
  dialect: "postgresql",
  schema: "./src/lib/schema/index.ts",
  out: "./migrations",
  dbCredentials: {
    url: dbEnv.DATABASE_URL,
  },
} satisfies Config;
