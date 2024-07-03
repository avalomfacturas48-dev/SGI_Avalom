import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.ava_usuario.findMany();
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ status: 500, message: "Internal Server Error" });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.usu_nombre || !body.usu_correo || !body.usu_contrasena) {
      return NextResponse.json({
        status: 400,
        message: "Bad Request: Missing required fields",
      });
    }

    const user = await prisma.ava_usuario.create({
      data: {
        usu_nombre: body.usu_nombre,
        usu_papellido: body.usu_papellido,
        usu_sapellido: body.usu_sapellido,
        usu_cedula: body.usu_cedula,
        usu_correo: body.usu_correo,
        usu_contrasena: body.usu_contrasena,
        usu_telefono: body.usu_telefono,
        // usu_fechacreacion se establecerá automáticamente debido a la configuración en el modelo
        usu_estado: body.usu_estado,
        usu_rol: body.usu_rol,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ status: 500, message: "Internal Server Error" });
  }
}
