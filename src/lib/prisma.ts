// src/lib/prisma.ts

import { PrismaClient } from "@/generated/prisma";



const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient();

// Set global prisma untuk environment development untuk menghindari multiple PrismaClient instance
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
