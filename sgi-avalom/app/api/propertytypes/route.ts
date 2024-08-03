import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";

export async function GET(request: NextRequest) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const tiposPropiedad = await prisma.ava_tipopropiedad.findMany();
      return NextResponse.json(tiposPropiedad);
    } catch (error) {
      return NextResponse.json(
        { error: "Error interno del servidor" },
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
          { error: "Faltan campos relevantes" },
          { status: 400 }
        );
      }

      const tipoPropiedad = await prisma.ava_tipopropiedad.create({
        data: {
          tipp_nombre: body.tipp_nombre,
        },
      });

      return NextResponse.json(tipoPropiedad);
    } catch (error) {
      return NextResponse.json(
        { error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
