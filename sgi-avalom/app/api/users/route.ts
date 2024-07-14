import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
  try {
    return authenticate(async (req: NextRequest, res: NextResponse) => {
      const users = await prisma.ava_usuario.findMany();
      return NextResponse.json(users);
    })(request, new NextResponse());
  } catch (error) {
    return NextResponse.json({ status: 500, message: "Internal Server Error" });
  }
}

export async function POST(request: NextRequest) {
  try {
    return authenticate(async (req: NextRequest, res: NextResponse) => {
      const body = await request.json();

      if (!body.usu_nombre || !body.usu_correo || !body.usu_contrasena) {
        return NextResponse.json({
          status: 400,
          message: "Bad Request: Missing required fields",
        });
      }

      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(body.usu_contrasena, 10);

      const user = await prisma.ava_usuario.create({
        data: {
          usu_nombre: body.usu_nombre,
          usu_papellido: body.usu_papellido,
          usu_sapellido: body.usu_sapellido,
          usu_cedula: body.usu_cedula,
          usu_correo: body.usu_correo,
          usu_contrasena: hashedPassword,
          usu_telefono: body.usu_telefono,
          // usu_fechacreacion se establecerá automáticamente debido a la configuración en el modelo
          usu_estado: body.usu_estado,
          usu_rol: body.usu_rol,
        },
      });

      return NextResponse.json(user);
    })(request, new NextResponse());
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ status: 500, message: "Internal Server Error" });
  }
}
