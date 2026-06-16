import "dotenv/config";
import * as dotenv from "dotenv";
import * as path from "path";
// Load .env.local with override so it takes precedence over .env
dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: true });
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Use DIRECT_URL (port 5432) for CLI commands; the app uses DATABASE_URL (pgbouncer)
    url: (process.env.DIRECT_URL || process.env.DATABASE_URL) as string,
  },
});
