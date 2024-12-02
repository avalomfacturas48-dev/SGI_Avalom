import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";

export async function POST(request: NextRequest) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const searchParams: {
        usu_nombre?: string;
        usu_papellido?: string;
        usu_sapellido?: string;
        usu_cedula?: string;
        usu_correo?: string;
        usu_rol?: string;
      } = await request.json();

      // Filtrar solo los parámetros de búsqueda definidos y no nulos
      const filteredSearchParams = Object.fromEntries(
        Object.entries(searchParams).filter(([_, v]) => v != null)
      );

      // Construir la consulta de Prisma de manera dinámica
      const users = await prisma.ava_usuario.findMany({
        where: {
          AND: Object.entries(filteredSearchParams).map(([key, value]) => ({
            [key]: {
              contains: value as string, // Asegurarse de que el valor es string
            },
          })),
        },
      });

      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(users) },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error searching users:", error);
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
