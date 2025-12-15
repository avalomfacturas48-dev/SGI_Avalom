import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export async function GET(request: NextRequest) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const { searchParams } = new URL(request.url);
      
      // Parámetros de paginación
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "10");
      const skip = (page - 1) * limit;

      // Obtener total de registros para paginación
      const total = await prisma.ava_servicio.count();

      // Obtener servicios con paginación
      const services = await prisma.ava_servicio.findMany({
        orderBy: {
          ser_nombre: "asc",
        },
        skip,
        take: limit,
      });
      
      return NextResponse.json(
        { 
          success: true, 
          data: stringifyWithBigInt(services),
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
        { status: 200 }
      );
    } catch (error: any) {
      console.error(
        "Error inesperado en GET /api/services:",
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

      if (!body.ser_codigo || !body.ser_nombre) {
        return NextResponse.json(
          { success: false, error: "ser_codigo y ser_nombre son requeridos" },
          { status: 400 }
        );
      }

      const newService = await prisma.ava_servicio.create({
        data: {
          ser_codigo: body.ser_codigo,
          ser_nombre: body.ser_nombre,
          ser_servicio: body.ser_servicio || null,
          ser_negocio: body.ser_negocio || null,
          ser_mediopago: body.ser_mediopago || null,
        },
      });

      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(newService) },
        { status: 201 }
      );
    } catch (error: any) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return NextResponse.json(
            {
              success: false,
              error: "Ya existe un servicio con ese código",
            },
            { status: 400 }
          );
        }
      }

      console.error(
        "Error inesperado en POST /api/services:",
        error?.message || error
      );
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}

