import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";

export async function GET(request: NextRequest) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const { searchParams } = new URL(request.url);
      
      // Obtener parámetros de filtro opcionales
      const tipo = searchParams.get("tipo"); // 'S' o 'M'
      const edi_id = searchParams.get("edi_id");
      const prop_id = searchParams.get("prop_id");
      const fechaDesde = searchParams.get("fechaDesde");
      const fechaHasta = searchParams.get("fechaHasta");

      // Parámetros de paginación
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "10");
      const skip = (page - 1) * limit;

      // Construir el objeto where dinámicamente
      const where: any = {
        gas_estado: "D", // Solo gastos anulados
      };

      if (tipo) {
        where.gas_tipo = tipo;
      }

      if (edi_id) {
        where.edi_id = BigInt(edi_id);
      }

      if (prop_id) {
        where.prop_id = BigInt(prop_id);
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
            orderBy: {
              ang_fechaanulacion: "desc",
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
        "Error inesperado en GET /api/expenses/canceled:",
        error?.message || error
      );
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}

