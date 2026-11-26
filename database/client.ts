import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL chưa được cấu hình. Sao chép .env.example thành .env.local trước khi chạy ứng dụng.");
}

const globalDatabase = globalThis as typeof globalThis & {
  hoalabPostgres?: ReturnType<typeof postgres>;
};

const client = globalDatabase.hoalabPostgres ?? postgres(connectionString, {
  max: process.env.NODE_ENV === "production" ? 10 : 1,
  prepare: false,
});

if (process.env.NODE_ENV !== "production") globalDatabase.hoalabPostgres = client;

export const database = drizzle(client, { schema });

export function getDb() {
  return database;
}
