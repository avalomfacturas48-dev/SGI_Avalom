import { PrismaClient } from "@prisma/client";

const createPrismaClient = () =>
  new PrismaClient({
    log: process.env.NODE_ENV === "production" ? ["error"] : ["query"],
    // El hash de la contraseña nunca se devuelve, ni en includes anidados.
    // Quien lo necesite (login) lo pide con `omit: { usu_contrasena: false }`.
    omit: { ava_usuario: { usu_contrasena: true } },
  });

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient>;
};

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
