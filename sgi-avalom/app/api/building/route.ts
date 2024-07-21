import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";

export async function GET(request: NextRequest) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const buildings = await prisma.ava_edificio.findMany({
        include: {
          ava_propiedad: {
            include: {
              ava_tipopropiedad: true,
            },
          },
        },
      });
      return NextResponse.json(buildings);
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

      if (!body.edi_identificador) {
        return NextResponse.json(
          { error: "Faltan campos relevantes" },
          { status: 400 }
        );
      }

      const building = await prisma.ava_edificio.create({
        data: {
          edi_identificador: body.edi_identificador,
          edi_descripcion: body.edi_descripcion,
        },
      });

      return NextResponse.json(building);
    } catch (error) {
      return NextResponse.json(
        { error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
