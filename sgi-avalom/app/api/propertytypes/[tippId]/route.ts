import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { tippId: string } }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const tipoPropiedad = await prisma.ava_tipopropiedad.findFirst({
        where: { tipp_id: Number(params.tippId) },
      });

      if (!tipoPropiedad) {
        return NextResponse.json(
          { error: "Tipo de propiedad no encontrado" },
          { status: 404 }
        );
      }

      return NextResponse.json(tipoPropiedad);
    } catch (error) {
      return NextResponse.json(
        { error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { tippId: string } }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const body = await request.json();

      if (!body.tipp_id || !body.tipp_nombre) {
        return NextResponse.json(
          { error: "Faltan campos relevantes" },
          { status: 400 }
        );
      }

      const tipoPropiedad = await prisma.ava_tipopropiedad.update({
        where: { tipp_id: Number(params.tippId) },
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { tippId: string } }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const body = await request.json();

      if (!body.tipp_id) {
        return NextResponse.json(
          { error: "Faltan campos relevantes" },
          { status: 400 }
        );
      }

      await prisma.ava_tipopropiedad.delete({
        where: { tipp_id: Number(params.tippId) },
      });

      return NextResponse.json({ message: "Tipo de propiedad eliminado" });
    } catch (error) {
      return NextResponse.json(
        { error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
