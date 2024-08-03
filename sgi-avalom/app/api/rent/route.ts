import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";

export async function GET(request: NextRequest) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const rents = await prisma.ava_alquiler.findMany(
        {
          include: {
            ava_alquilermensual: true,
            ava_propiedad: true,
          },
        }
      );
      return NextResponse.json(rents);
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
      const data = await req.json();
      console.log(data);
      const rent = await prisma.ava_alquiler.create({
        data,
      });
      return NextResponse.json(rent);
    } catch (error) {
      console.error("Error creating rent:", error);
      return NextResponse.json(
        { error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
