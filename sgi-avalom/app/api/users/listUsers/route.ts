// app/api/users/list/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.ava_usuario.findMany({
      where: { usu_estado: "A" },
      select: {
        usu_id: true,
        usu_nombre: true,
        usu_papellido: true,
        usu_sapellido: true,
        usu_cedula: true,
      },
    });

    const data = users.map((u) => ({
      id: u.usu_id.toString(),
      nombre: `${u.usu_nombre} ${u.usu_papellido}${u.usu_sapellido ? ` ${u.usu_sapellido}` : ""}`,
      cedula: u.usu_cedula,
    }));

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("Error fetching users:", err);
    return NextResponse.json(
      { error: "Error fetching users" },
      { status: 500 }
    );
  }
}
