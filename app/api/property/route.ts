import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";
import { propertyDetailInclude } from "@/lib/constants/prismaIncludes";
import { parseBody } from "@/lib/validation";
import { propertyCreateSchema } from "@/lib/schemas/apiSchemas";

export async function GET(request: NextRequest) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const buildings = await prisma.ava_propiedad.findMany({
        include: {
          ava_alquiler: true,
          ava_tipopropiedad: true,
          ava_edificio: true,
        },
      });
      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(buildings) },
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

export async function POST(request: NextRequest) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const parsed = await parseBody(req, propertyCreateSchema);
      if (!parsed.success) return parsed.response;
      const data = parsed.data;
      const property = await prisma.ava_propiedad.create({
        data,
        include: propertyDetailInclude,
      });
      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(property) },
        { status: 201 }
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
