import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ tippId: string }> }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const params = await context.params;

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

// Solo lectura: los tipos de propiedad no se administran desde la app.
