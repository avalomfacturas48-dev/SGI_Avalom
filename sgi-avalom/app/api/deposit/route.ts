import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";

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
      const data = await req.json();

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
