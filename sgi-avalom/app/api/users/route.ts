import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { UserWithToken } from "@/lib/types";

export async function GET(request: NextRequest) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const currentUser = req.user as UserWithToken;

      // Filtrar usuarios según el rol del usuario logueado
      let rolesToFetch: string[] = [];

      if (currentUser.userRole === "A") {
        rolesToFetch = ["A", "E", "R"];
      } else if (currentUser.userRole === "J") {
        rolesToFetch = ["A", "J", "E", "R"];
      } else if (currentUser.userRole === "E") {
        rolesToFetch = ["E", "R"];
      } else {
        return NextResponse.json(
          { error: "No tiene permiso para realizar esta acción" },
          { status: 403 }
        );
      }

      const users = await prisma.ava_usuario.findMany({
        where: {
          usu_rol: { in: rolesToFetch },
        },
      });

      return NextResponse.json(users);
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
      const body = await request.json();

      if (
        !body.usu_nombre ||
        !body.usu_papellido ||
        !body.usu_cedula ||
        !body.usu_correo ||
        !body.usu_contrasena ||
        !body.usu_estado ||
        !body.usu_rol
      ) {
        return NextResponse.json(
          { error: "Faltan campos relevantes" },
          { status: 400 }
        );
      }

      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(body.usu_contrasena, 10);
      const emailLowerCase = body.usu_correo.toLowerCase();

      const user = await prisma.ava_usuario.create({
        data: {
          usu_nombre: body.usu_nombre,
          usu_papellido: body.usu_papellido,
          usu_sapellido: body.usu_sapellido,
          usu_cedula: body.usu_cedula,
          usu_correo: emailLowerCase,
          usu_contrasena: hashedPassword,
          usu_telefono: body.usu_telefono,
          // usu_fechacreacion se establecerá automáticamente debido a la configuración en el modelo
          usu_estado: body.usu_estado,
          usu_rol: body.usu_rol,
        },
      });

      return NextResponse.json(user);
    } catch (error: any) {
      console.error("Error creating user:", error);
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return NextResponse.json(
            { error: "Existe un usuario con datos relevantes repetidos" },
            { status: 409 }
          );
        }
      }
      return NextResponse.json(
        { error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
