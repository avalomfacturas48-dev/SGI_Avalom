import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";

export async function GET(request: NextRequest) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const tiposPropiedad = await prisma.ava_tipopropiedad.findMany();
      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(tiposPropiedad) },
        { status: 200 }
      );
    } catch (error) {
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

      if (!body.tipp_nombre) {
        return NextResponse.json(
          { success: false, error: "Faltan campos obligatorios" },
          { status: 400 }
        );
      }

      const tipoPropiedad = await prisma.ava_tipopropiedad.create({
        data: {
          tipp_nombre: body.tipp_nombre,
        },
      });

      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(tipoPropiedad) },
        { status: 201 }
      );
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
