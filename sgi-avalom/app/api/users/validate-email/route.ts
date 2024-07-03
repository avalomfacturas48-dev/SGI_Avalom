import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    const user = await prisma.ava_usuario.findUnique({
      where: { usu_correo: email },
    });

    if (!user) {
      return NextResponse.json({ status: 404, message: "User not found" });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error validating email:", error);
    return NextResponse.json({ status: 500, message: "Internal Server Error" });
  }
}
