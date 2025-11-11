import { PrismaClient } from '@prisma/client';

declare global {
  // prevent multiple instances during hot-reload in development
  // eslint-disable-next-line no-var
  var __prismaClient: PrismaClient | undefined;
}

const prisma = global.__prismaClient || new PrismaClient();
if (process.env.NODE_ENV === 'development') global.__prismaClient = prisma;

export default prisma;
