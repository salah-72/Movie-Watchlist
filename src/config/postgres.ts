import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import env from "./env";

const connectionString = `${env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export const testPostgresConnection = async () => {
  try {
    await prisma.$connect();
    console.log("Prisma connected successfully to the database");
  } catch (err) {
    console.error("Prisma connection to the database failed:", err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
};

export { prisma };
