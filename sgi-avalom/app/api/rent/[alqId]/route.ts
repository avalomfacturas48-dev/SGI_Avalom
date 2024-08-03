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
      const rent = await prisma.ava_alquiler.update({
        where: { alq_id: Number(params.alqId) },
        data,
      });
      return NextResponse.json(rent);
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
