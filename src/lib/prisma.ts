import { PrismaClient } from '@prisma/client';

// Declare a global variable to hold the Prisma Client instance.
// This ensures that the same instance is used across hot reloads in development.
declare global {
  var prisma: PrismaClient | undefined;
}

// Instantiate the Prisma Client.
// If 'global.prisma' already exists, use it. Otherwise, create a new instance.
// In production, 'global.prisma' will be undefined, so a new client is always created.
// In development, the existing 'global.prisma' from the previous reload is reused.
const prisma = global.prisma ?? new PrismaClient();

// In non-production environments, assign the new or existing client to the global variable.
// This caches the instance for the next hot reload.
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;