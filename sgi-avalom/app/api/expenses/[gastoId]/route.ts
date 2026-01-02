import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ gastoId: string }> }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const params = await context.params;

      const expense = await prisma.ava_gasto.findFirst({
        where: { gas_id: BigInt(params.gastoId) },
        include: {
          ava_edificio: true,
          ava_propiedad: true,
          ava_servicio: true,
          ava_usuario: true,
          ava_anulaciongasto: true,
        },
      });

      if (!expense) {
        return NextResponse.json(
          { success: false, error: "Gasto no encontrado" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(expense) },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error al obtener el gasto:", error);
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ gastoId: string }> }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const params = await context.params;
      const gastoId = BigInt(params.gastoId);
      const body = await req.json();

      // Validar que si es tipo 'S' (Servicio), debe tener ser_id
      if (body.gas_tipo === "S" && !body.ser_id) {
        return NextResponse.json(
          {
            success: false,
            error: "Los gastos de servicio deben tener un servicio asociado",
          },
          { status: 400 }
        );
      }

      // Validar que si es tipo 'M' (Mantenimiento), no debe tener ser_id
      if (body.gas_tipo === "M" && body.ser_id) {
        return NextResponse.json(
          {
            success: false,
            error: "Los gastos de mantenimiento no deben tener servicio asociado",
          },
          { status: 400 }
        );
      }

      // Verificar que el gasto existe
      const existingExpense = await prisma.ava_gasto.findUnique({
        where: { gas_id: gastoId },
      });

      if (!existingExpense) {
        return NextResponse.json(
          { success: false, error: "Gasto no encontrado" },
          { status: 404 }
        );
      }

      // Verificar que el gasto no esté anulado
      if (existingExpense.gas_estado === "D") {
        return NextResponse.json(
          { success: false, error: "No se puede modificar un gasto anulado" },
          { status: 400 }
        );
      }

      const updatedExpense = await prisma.ava_gasto.update({
        where: { gas_id: gastoId },
        data: {
          gas_tipo: body.gas_tipo,
          gas_concepto: body.gas_concepto,
          gas_descripcion: body.gas_descripcion || null,
          gas_monto: BigInt(body.gas_monto),
          gas_fecha: body.gas_fecha ? new Date(body.gas_fecha) : undefined,
          gas_metodopago: body.gas_metodopago || null,
          gas_cuenta: body.gas_cuenta || null,
          gas_banco: body.gas_banco || null,
          gas_referencia: body.gas_referencia || null,
          gas_comprobante: body.gas_comprobante || null,
          edi_id: BigInt(body.edi_id),
          prop_id: body.prop_id ? BigInt(body.prop_id) : null,
          ser_id: body.ser_id ? BigInt(body.ser_id) : null,
          usu_id: body.usu_id ? BigInt(body.usu_id) : null,
        },
        include: {
          ava_edificio: true,
          ava_propiedad: true,
          ava_servicio: true,
          ava_usuario: true,
        },
      });

      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(updatedExpense) },
        { status: 200 }
      );
    } catch (error: any) {
      console.error("Error actualizando el gasto:", error.message);
      return NextResponse.json(
        { success: false, error: "Error interno del servidor." },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ gastoId: string }> }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const params = await context.params;
      const gastoId = BigInt(params.gastoId);

      // Verificar que el gasto existe
      const existingExpense = await prisma.ava_gasto.findUnique({
        where: { gas_id: gastoId },
      });

      if (!existingExpense) {
        return NextResponse.json(
          { success: false, error: "Gasto no encontrado" },
          { status: 404 }
        );
      }

      // Verificar que el gasto no esté anulado
      if (existingExpense.gas_estado === "D") {
        return NextResponse.json(
          { success: false, error: "El gasto ya está anulado" },
          { status: 400 }
        );
      }

      // Eliminar el gasto (o cambiar estado a anulado según la lógica de negocio)
      // Por ahora eliminamos físicamente, pero podrías cambiar a actualizar estado
      await prisma.ava_gasto.delete({
        where: { gas_id: gastoId },
      });

      return NextResponse.json(
        { success: true, message: "Gasto eliminado" },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error eliminando el gasto:", error);
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}

