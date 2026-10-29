import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

function createPrismaClient(): PrismaClient {
  const dbUrl =
    process.env.DATABASE_URL ||
    "postgresql://postgres:dummy@localhost:5432/postgres";

  const isSupabase = dbUrl.includes("supabase") || dbUrl.includes("pooler");

  const pool =
    globalForPrisma.pool ??
    new Pool({
      connectionString: dbUrl,
      ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
    });
  if (process.env.NODE_ENV !== "production") globalForPrisma.pool = pool;

  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
