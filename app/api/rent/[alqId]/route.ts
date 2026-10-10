import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";
import { rentalDetailInclude } from "@/lib/constants/prismaIncludes";
import { parseBody } from "@/lib/validation";
import { rentUpdateSchema } from "@/lib/schemas/apiSchemas";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ alqId: string }> }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const params = await context.params;

      const rent = await prisma.ava_alquiler.findFirst({
        where: { alq_id: BigInt(params.alqId) },
      });
      if (!rent) {
        return NextResponse.json(
          { success: false, error: "Alquiler no encontrado" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(rent) },
        { status: 200 }
      );
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ alqId: string }> }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const params = await context.params;

      const rentalId = BigInt(params.alqId);
      const parsed = await parseBody(req, rentUpdateSchema);
      if (!parsed.success) return parsed.response;
      const { ava_clientexalquiler, ...alquilerData } = parsed.data;

      const updatedRental = await prisma.$transaction(async (prisma) => {
        const rent = await prisma.ava_alquiler.update({
          where: { alq_id: rentalId },
          data: alquilerData,
        });

        if (ava_clientexalquiler && Array.isArray(ava_clientexalquiler)) {
          await prisma.ava_clientexalquiler.deleteMany({
            where: { alq_id: rentalId },
          });

          if (ava_clientexalquiler.length > 0) {
            // Sin repetidos: la PK es (alq_id, cli_id)
            const uniqueIds = [
              ...new Set(ava_clientexalquiler.map((r) => r.cli_id.toString())),
            ];
            const clientConnections = uniqueIds.map((cli_id) => ({
              alq_id: rentalId,
              cli_id: BigInt(cli_id),
            }));

            await prisma.ava_clientexalquiler.createMany({
              data: clientConnections,
            });
          }
        }

        return prisma.ava_alquiler.findUnique({
          where: { alq_id: rentalId },
          // Misma forma que /api/modifiyrent para no dejar el store incompleto
          include: rentalDetailInclude,
        });
      });

      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(updatedRental) },
        { status: 200 }
      );
    } catch (error: any) {
      console.error("Error actualizando el alquiler:", error.message);
      return NextResponse.json(
        { success: false, error: "Error interno del servidor." },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ alqId: string }> }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const params = await context.params;

      await prisma.ava_alquiler.delete({
        where: { alq_id: BigInt(params.alqId) },
      });
      return NextResponse.json(
        { success: true, message: "Alquiler eliminado" },
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
