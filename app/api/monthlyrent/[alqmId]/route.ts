import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";
import { pagoWithAnulacionInclude } from "@/lib/constants/prismaIncludes";
import { parseBody } from "@/lib/validation";
import { monthlyRentSchema } from "@/lib/schemas/apiSchemas";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ alqmId: string }> }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const { alqmId } = await context.params;

      const monthlyRent = await prisma.ava_alquilermensual.findUnique({
        where: { alqm_id: BigInt(alqmId) },
        include: { ava_alquiler: true },
      });

      if (!monthlyRent) {
        return NextResponse.json(
          { success: false, error: "Alquiler mensual no encontrado" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(monthlyRent) },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error al obtener el alquiler mensual:", error);
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ alqmId: string }> }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const { alqmId } = await context.params;
      const parsed = await parseBody(req, monthlyRentSchema);
      if (!parsed.success) return parsed.response;
      const { alqm_montopagado: _ignorado, ...data } = parsed.data;

      const actual = await prisma.ava_alquilermensual.findUnique({
        where: { alqm_id: BigInt(alqmId) },
      });
      if (!actual) {
        return NextResponse.json(
          { success: false, error: "Alquiler mensual no encontrado" },
          { status: 404 }
        );
      }

      // El monto pagado sale de los pagos registrados; no se edita a mano
      if (data.alqm_montototal < actual.alqm_montopagado) {
        return NextResponse.json(
          {
            success: false,
            error: "El monto total no puede ser menor a lo ya pagado.",
          },
          { status: 400 }
        );
      }
      if (data.alqm_estado === "P" && actual.alqm_montopagado < data.alqm_montototal) {
        return NextResponse.json(
          {
            success: false,
            error: "No se puede marcar como pagado un mes con saldo pendiente.",
          },
          { status: 400 }
        );
      }

      const updatedMonthlyRent = await prisma.ava_alquilermensual.update({
        where: { alqm_id: BigInt(alqmId) },
        data: { ...data, alqm_fechapago: data.alqm_fechapago ?? null },
        include: pagoWithAnulacionInclude,
      });

      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(updatedMonthlyRent) },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error al actualizar el alquiler mensual:", error);
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ alqmId: string }> }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const { alqmId } = await context.params;

      const rentWithPayments = await prisma.ava_alquilermensual.findFirst({
        where: {
          alqm_id: BigInt(alqmId),
          ava_pago: { some: {} },
        },
      });

      if (rentWithPayments) {
        return NextResponse.json(
          {
            success: false,
            error: "No se puede eliminar un alquiler con pagos relacionados.",
          },
          { status: 400 }
        );
      }

      await prisma.ava_alquilermensual.delete({
        where: { alqm_id: BigInt(alqmId) },
      });

      return NextResponse.json(
        { success: true, message: "Alquiler mensual eliminado" },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error al eliminar el alquiler mensual:", error);
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
