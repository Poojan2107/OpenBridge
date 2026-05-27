import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import pg from "pg";
import "dotenv/config";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prismaInstance: PrismaClient;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is missing inside .env.");
}

if (globalForPrisma.prisma) {
  prismaInstance = globalForPrisma.prisma;
} else {
  let adapter;
  if (connectionString.startsWith("file:")) {
    // For SQLite database in Prisma 7
    adapter = new PrismaBetterSqlite3({ url: connectionString });
  } else {
    // For PostgreSQL
    const pool = new pg.Pool({ connectionString });
    adapter = new PrismaPg(pool);
  }

  prismaInstance = new PrismaClient({ adapter });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prismaInstance;
  }
}

export const prisma = prismaInstance;
