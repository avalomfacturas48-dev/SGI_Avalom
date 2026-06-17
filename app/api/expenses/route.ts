import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export async function GET(request: NextRequest) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const { searchParams } = new URL(request.url);
      
      // Obtener parámetros de filtro opcionales
      const estado = searchParams.get("estado"); // 'A' o 'D'
      const tipo = searchParams.get("tipo"); // 'S' o 'M'
      const edi_id = searchParams.get("edi_id");
      const prop_id = searchParams.get("prop_id");
      const ser_id = searchParams.get("ser_id");
      const fechaDesde = searchParams.get("fechaDesde");
      const fechaHasta = searchParams.get("fechaHasta");

      // Parámetros de paginación
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "10");
      const skip = (page - 1) * limit;

      // Construir el objeto where dinámicamente
      const where: any = {};

      if (estado) {
        where.gas_estado = estado;
      }

      if (tipo) {
        where.gas_tipo = tipo;
      }

      if (edi_id) {
        where.edi_id = BigInt(edi_id);
      }

      if (prop_id) {
        where.prop_id = BigInt(prop_id);
      }

      if (ser_id) {
        where.ser_id = BigInt(ser_id);
      }

      if (fechaDesde || fechaHasta) {
        where.gas_fecha = {};
        if (fechaDesde) {
          where.gas_fecha.gte = new Date(fechaDesde);
        }
        if (fechaHasta) {
          where.gas_fecha.lte = new Date(fechaHasta);
        }
      }

      // Obtener total de registros para paginación
      const total = await prisma.ava_gasto.count({ where });

      // Obtener gastos con paginación
      const expenses = await prisma.ava_gasto.findMany({
        where,
        include: {
          ava_edificio: true,
          ava_propiedad: true,
          ava_servicio: true,
          ava_usuario: true,
          ava_anulaciongasto: {
            include: {
              ava_usuario: true,
            },
          },
        },
        orderBy: {
          gas_fecha: "desc",
        },
        skip,
        take: limit,
      });
      
      return NextResponse.json(
        { 
          success: true, 
          data: stringifyWithBigInt(expenses),
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
        "Error inesperado en GET /api/expenses:",
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
            error:
              "Los gastos de mantenimiento no deben tener servicio asociado",
          },
          { status: 400 }
        );
      }

      const newExpense = await prisma.ava_gasto.create({
        data: {
          gas_tipo: body.gas_tipo,
          gas_concepto: body.gas_concepto,
          gas_descripcion: body.gas_descripcion || null,
          gas_monto: BigInt(body.gas_monto),
          gas_fecha: body.gas_fecha ? new Date(body.gas_fecha) : new Date(),
          gas_estado: body.gas_estado || "A",
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
        { success: true, data: stringifyWithBigInt(newExpense) },
        { status: 201 }
      );
    } catch (error: any) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return NextResponse.json(
            {
              success: false,
              error: "Ya existe un gasto con campos duplicados",
            },
            { status: 400 }
          );
        }
        if (error.code === "P2003") {
          return NextResponse.json(
            {
              success: false,
              error:
                "Referencia inválida (edificio, propiedad o servicio no existe)",
            },
            { status: 400 }
          );
        }
      }

      console.error(
        "Error inesperado en POST /api/expenses:",
        error?.message || error
      );
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
