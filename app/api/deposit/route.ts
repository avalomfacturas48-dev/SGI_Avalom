import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";
import { pagoWithAnulacionInclude } from "@/lib/constants/prismaIncludes";
import { parseBody } from "@/lib/validation";
import { depositCreateSchema } from "@/lib/schemas/apiSchemas";

export async function GET(request: NextRequest) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const deposits = await prisma.ava_deposito.findMany();

      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(deposits) },
        { status: 200 }
      );
    } catch (error: any) {
      console.error("Error al obtener los depósitos:", error.message);
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
      const parsed = await parseBody(req, depositCreateSchema);
      if (!parsed.success) return parsed.response;
      const data = parsed.data;

      const existingDeposit = await prisma.ava_deposito.findFirst({
        where: { alq_id: BigInt(data.alq_id) },
      });

      if (existingDeposit) {
        return NextResponse.json(
          {
            success: false,
            error: "Ya existe un depósito asociado a este alquiler",
          },
          { status: 409 }
        );
      }

      const newDeposit = await prisma.ava_deposito.create({
        data: {
          alq_id: BigInt(data.alq_id),
          depo_total: BigInt(data.depo_total),
          depo_montoactual: BigInt(0),
        },
        include: pagoWithAnulacionInclude,
      });

      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(newDeposit) },
        { status: 201 }
      );
    } catch (error: any) {
      console.error("Error al crear el depósito:", error.message);
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
