import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    return authenticate(async (req: NextRequest, res: NextResponse) => {
      const { searchParams } = new URL(request.url);
      const query = searchParams.get("query");

      if (!query) {
        return NextResponse.json({ status: 400, message: "Query parameter is required" });
      }

      const clients = await prisma.ava_cliente.findMany({
        where: {
          OR: [
            { cli_nombre: { contains: query, mode: "insensitive" } },
            { cli_papellido: { contains: query, mode: "insensitive" } },
            { cli_sapellido: { contains: query, mode: "insensitive" } },
            { cli_cedula: { contains: query, mode: "insensitive" } },
          ],
        },
      });

      return NextResponse.json(clients);
    })(request, new NextResponse());
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ status: 500, message: "Internal Server Error" });
  }
}
