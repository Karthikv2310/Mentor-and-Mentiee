import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

function createPrismaClient(): PrismaClient {
  const dbUrl = process.env.DATABASE_URL || "";

  // If a PostgreSQL / Supabase connection string is provided
  if (dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://")) {
    const pool =
      globalForPrisma.pool ??
      new Pool({
        connectionString: dbUrl,
        ssl: { rejectUnauthorized: false }, // Required for Supabase pooling & SSL
      });
    if (process.env.NODE_ENV !== "production") globalForPrisma.pool = pool;

    const adapter = new PrismaPg(pool);
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });
  }

  // Fallback to local SQLite BetterSqlite3 adapter
  const dbPath = path.resolve(process.cwd(), "dev.db");
  const url = `file:${dbPath}`;
  const adapter = new PrismaBetterSqlite3({ url });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
