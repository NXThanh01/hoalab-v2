import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./database/migrations",
  schema: "./database/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgresql://nguyenxuanthanh@localhost:5432/hoalab_dev",
  },
});
