import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ serId: string }> }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const params = await context.params;

      const service = await prisma.ava_servicio.findUnique({
        where: { ser_id: BigInt(params.serId) },
        include: {
          ava_gasto: {
            include: {
              ava_edificio: true,
              ava_propiedad: true,
            },
            orderBy: {
              gas_fecha: "desc",
            },
            take: 10, // Últimos 10 gastos relacionados
          },
        },
      });

      if (!service) {
        return NextResponse.json(
          { success: false, error: "Servicio no encontrado" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(service) },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error al obtener el servicio:", error);
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ serId: string }> }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const params = await context.params;
      const serId = BigInt(params.serId);
      const body = await req.json();

      // Verificar que el servicio existe
      const existingService = await prisma.ava_servicio.findUnique({
        where: { ser_id: serId },
      });

      if (!existingService) {
        return NextResponse.json(
          { success: false, error: "Servicio no encontrado" },
          { status: 404 }
        );
      }

      const updatedService = await prisma.ava_servicio.update({
        where: { ser_id: serId },
        data: {
          ser_codigo: body.ser_codigo,
          ser_nombre: body.ser_nombre,
          ser_servicio: body.ser_servicio || null,
          ser_negocio: body.ser_negocio || null,
          ser_mediopago: body.ser_mediopago || null,
        },
      });

      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(updatedService) },
        { status: 200 }
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

      console.error("Error actualizando el servicio:", error.message);
      return NextResponse.json(
        { success: false, error: "Error interno del servidor." },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ serId: string }> }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const params = await context.params;
      const serId = BigInt(params.serId);

      // Verificar que el servicio existe
      const existingService = await prisma.ava_servicio.findUnique({
        where: { ser_id: serId },
        include: {
          ava_gasto: true,
        },
      });

      if (!existingService) {
        return NextResponse.json(
          { success: false, error: "Servicio no encontrado" },
          { status: 404 }
        );
      }

      // Verificar que no tenga gastos asociados
      if (existingService.ava_gasto && existingService.ava_gasto.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: "No se puede eliminar un servicio que tiene gastos asociados",
          },
          { status: 400 }
        );
      }

      await prisma.ava_servicio.delete({
        where: { ser_id: serId },
      });

      return NextResponse.json(
        { success: true, message: "Servicio eliminado" },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error eliminando el servicio:", error);
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}

