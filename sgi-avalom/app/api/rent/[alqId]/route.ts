import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { alqId: string } }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const rent = await prisma.ava_alquiler.findFirst({
        where: { alq_id: Number(params.alqId) },
      });
      if (!rent) {
        return NextResponse.json(
          { error: "Alquiler no encontrado" },
          { status: 404 }
        );
      }
      return NextResponse.json(rent);
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { alqId: string } }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const data = await req.json();
      const { ava_clientexalquiler, ...alquilerData } = data;

      // Start a transaction to ensure atomicity
      const updatedRental = await prisma.$transaction(async (prisma) => {
        // Update the alquiler itself
        const rent = await prisma.ava_alquiler.update({
          where: { alq_id: Number(params.alqId) },
          data: alquilerData,
        });

        // Manage clients associated with this alquiler
        if (ava_clientexalquiler && Array.isArray(ava_clientexalquiler)) {
          // Delete old client relationships
          await prisma.ava_clientexalquiler.deleteMany({
            where: {
              alq_id: rent.alq_id,
            },
          });

          // Create new client relationships
          const clientConnections = ava_clientexalquiler.map(
            (clientRelation) => ({
              alq_id: rent.alq_id,
              cli_id: clientRelation.cli_id,
            })
          );

          await prisma.ava_clientexalquiler.createMany({
            data: clientConnections,
          });
        }

        return prisma.ava_alquiler.findUnique({
          where: { alq_id: rent.alq_id },
          include: {
            ava_clientexalquiler: {
              include: {
                ava_cliente: true,
              },
            },
          },
        });
      });

      return NextResponse.json(updatedRental);
    } catch (error) {
      console.error("Error updating rental:", error);
      return NextResponse.json(
        { error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { alqId: string } }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      await prisma.ava_alquiler.delete({
        where: { alq_id: Number(params.alqId) },
      });
      return NextResponse.json({
        message: "Alquiler eliminado correctamente",
      });
    } catch (error) {
      return NextResponse.json(
        { error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
