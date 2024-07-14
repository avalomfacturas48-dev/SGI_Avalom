import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    return authenticate(async (req: NextRequest, res: NextResponse) => {
      const clients = await prisma.ava_cliente.findMany();
      return NextResponse.json(clients);
    })(request, new NextResponse());
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ status: 500, message: "Internal Server Error" });
  }
}

export async function POST(request: NextRequest) {
  try {
    return authenticate(async (req: NextRequest, res: NextResponse) => {
      const body = await request.json();
      const newClient = await prisma.ava_cliente.create({
        data: body,
      });
      return NextResponse.json(newClient);
    })(request, new NextResponse());
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ status: 500, message: "Internal Server Error" });
  }
}
