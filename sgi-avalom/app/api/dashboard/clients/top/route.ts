import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";

export async function GET(request: NextRequest) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const topClients = await prisma.ava_cliente.findMany({
        take: 5,
        orderBy: { ava_clientexalquiler: { _count: "desc" } },
        include: { _count: { select: { ava_clientexalquiler: true } } },
      });
      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(topClients) },
        { status: 200 }
      );
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { success: false, error: "Error al obtener top clientes" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
