import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { stringifyWithBigInt } from "@/utils/converters";

export async function GET(request: NextRequest) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const clients = await prisma.ava_cliente.findMany();
      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(clients) },
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

      const newClient = await prisma.ava_cliente.create({
        data: body,
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
