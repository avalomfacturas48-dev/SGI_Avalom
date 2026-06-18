import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";

export async function GET(request: NextRequest) {
  return authenticate(async (req: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);

      const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
      const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10")));
      const skip = (page - 1) * limit;
      const search = searchParams.get("search")?.trim() || "";
      const statusParam = searchParams.get("status");
      const propertyTypeParam = searchParams.get("propertyType");

      const statusList = statusParam ? statusParam.split(",").filter(Boolean) : [];
      const propertyTypeList = propertyTypeParam
        ? propertyTypeParam.split(",").filter(Boolean)
        : [];

      const where: any = {};

      if (statusList.length > 0) {
        where.alq_estado = { in: statusList };
      }

      if (propertyTypeList.length > 0) {
        where.ava_propiedad = {
          ava_tipopropiedad: { tipp_nombre: { in: propertyTypeList } },
        };
      }

      if (search) {
        where.OR = [
          {
            ava_propiedad: {
              prop_identificador: { contains: search, mode: "insensitive" },
            },
          },
          {
            ava_propiedad: {
              ava_edificio: {
                edi_identificador: { contains: search, mode: "insensitive" },
              },
            },
          },
          {
            ava_clientexalquiler: {
              some: {
                ava_cliente: {
                  OR: [
                    { cli_nombre: { contains: search, mode: "insensitive" } },
                    { cli_papellido: { contains: search, mode: "insensitive" } },
                    { cli_cedula: { contains: search, mode: "insensitive" } },
                  ],
                },
              },
            },
          },
        ];
      }

      const [total, active, finished, canceled, rentals] =
        await prisma.$transaction([
          prisma.ava_alquiler.count({ where }),
          prisma.ava_alquiler.count({ where: { alq_estado: "A" } }),
          prisma.ava_alquiler.count({ where: { alq_estado: "F" } }),
          prisma.ava_alquiler.count({ where: { alq_estado: "C" } }),
          prisma.ava_alquiler.findMany({
            where,
            skip,
            take: limit,
            include: {
              ava_propiedad: {
                include: { ava_edificio: true, ava_tipopropiedad: true },
              },
              ava_clientexalquiler: { include: { ava_cliente: true } },
            },
            orderBy: { ava_propiedad: { prop_identificador: "asc" } },
          }),
        ]);

      return NextResponse.json(
        {
          success: true,
          data: stringifyWithBigInt(rentals),
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 1,
          },
          counts: { active, finished, canceled },
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error al obtener los alquileres:", error);
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
