import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { stringifyWithBigInt } from "@/utils/converters";

export async function GET(request: NextRequest) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const { searchParams } = new URL(request.url);
      const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
      const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10")));
      const skip = (page - 1) * limit;
      const search = searchParams.get("search")?.trim() || "";

      const where: any = search
        ? {
            OR: [
              { cli_nombre: { contains: search, mode: "insensitive" } },
              { cli_papellido: { contains: search, mode: "insensitive" } },
              { cli_cedula: { contains: search, mode: "insensitive" } },
              { cli_correo: { contains: search, mode: "insensitive" } },
            ],
          }
        : {};

      const [total, clients] = await prisma.$transaction([
        prisma.ava_cliente.count({ where }),
        prisma.ava_cliente.findMany({
          where,
          skip,
          take: limit,
          orderBy: { cli_papellido: "asc" },
        }),
      ]);

      return NextResponse.json(
        {
          success: true,
          data: stringifyWithBigInt(clients),
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 1,
          },
        },
        { status: 200 }
      );
    } catch (error: any) {
      console.error(
        "Error inesperado en GET /api/client:",
        error?.message || error
      );
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}

export async function POST(request: NextRequest) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const body = await request.json();

      if (!body || typeof body !== "object") {
        return NextResponse.json(
          { success: false, error: "El cuerpo de la solicitud es inválido" },
          { status: 400 }
        );
      }

      // Teléfono y correo son opcionales: normalizar "" → null para evitar
      // colisiones en el índice único del correo entre clientes sin correo.
      const newClient = await prisma.ava_cliente.create({
        data: {
          ...body,
          cli_telefono: body.cli_telefono?.trim() || null,
          cli_correo: body.cli_correo?.trim() || null,
        },
      });

      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(newClient) },
        { status: 201 }
      );
    } catch (error: any) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return NextResponse.json(
            {
              success: false,
              error: "Ya existe un cliente con campos duplicados",
            },
            { status: 400 }
          );
        }
      }

      console.error(
        "Error inesperado en POST /api/client:",
        error?.message || error
      );
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
