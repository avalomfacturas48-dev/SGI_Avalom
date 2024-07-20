import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const user = await prisma.ava_usuario.findUnique({
        where: { usu_id: parseInt(params.userId) },
      });
      if (!user) {
        return NextResponse.json(
          { error: "Usuario no encontrado" },
          { status: 404 }
        );
      }
      return NextResponse.json(user);
    } catch (error) {
      console.error("Error:", error);
      return NextResponse.json(
        { error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const body = await request.json();
      if (
        !body.usu_nombre ||
        !body.usu_papellido ||
        !body.usu_cedula ||
        !body.usu_correo ||
        !body.usu_estado ||
        !body.usu_rol
      ) {
        return NextResponse.json(
          { error: "Faltan campos obligatorios" },
          { status: 400 }
        );
      }

      const emailLowerCase = body.usu_correo.toLowerCase();

      const user = await prisma.ava_usuario.update({
        where: { usu_id: parseInt(params.userId) },
        data: {
          usu_nombre: body.usu_nombre,
          usu_papellido: body.usu_papellido,
          usu_sapellido: body.usu_sapellido,
          usu_cedula: body.usu_cedula,
          usu_correo: emailLowerCase,
          usu_telefono: body.usu_telefono,
          usu_estado: body.usu_estado,
          usu_rol: body.usu_rol,
        },
      });
      return NextResponse.json(user);
    } catch (error) {
      console.error("Error:", error);
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const user = await prisma.ava_usuario.delete({
        where: { usu_id: parseInt(params.userId) },
      });
      return NextResponse.json({ status: 204 });
    } catch (error) {
      return NextResponse.json(
        { error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
