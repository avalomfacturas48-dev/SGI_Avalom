import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { stringifyWithBigInt } from "@/utils/converters";
import bcrypt from "bcryptjs";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const params = await context.params;

      const user = await prisma.ava_usuario.findUnique({
        where: { usu_id: parseInt(params.userId) },
      });
      if (!user) {
        return NextResponse.json(
          { success: false, error: "Usuario no encontrado" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(user) },
        { status: 200 }
      );
    } catch (error: any) {
      console.error(
        "Error inesperado en GET /api/client/[userId]:",
        error?.message || error
      );
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const params = await context.params;
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
          { success: false, error: "Faltan campos obligatorios" },
          { status: 400 }
        );
      }

      const emailLowerCase = body.usu_correo.toLowerCase();

      const updateData: any = {
        usu_nombre: body.usu_nombre,
        usu_papellido: body.usu_papellido,
        usu_sapellido: body.usu_sapellido,
        usu_cedula: body.usu_cedula,
        usu_correo: emailLowerCase,
        usu_telefono: body.usu_telefono,
        usu_estado: body.usu_estado,
        usu_rol: body.usu_rol,
      };

      if (body.usu_contrasena) {
        updateData.usu_contrasena = await bcrypt.hash(body.usu_contrasena, 10);
      }

      const user = await prisma.ava_usuario.update({
        where: { usu_id: BigInt(params.userId) },
        data: updateData,
      });

      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(user) },
        { status: 200 }
      );
    } catch (error: any) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return NextResponse.json(
            {
              success: false,
              error: "Ya existe un usuario con campos duplicados",
            },
            { status: 409 }
          );
        }
      }
      console.error(
        "Error inesperado en PUT /api/client/[userId]:",
        error?.message || error
      );
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
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
      await prisma.ava_usuario.delete({
        where: { usu_id: BigInt(params.userId) },
      });
      return NextResponse.json(
        { status: 204, message: "Usuario eliminado" },
        { status: 200 }
      );
    } catch (error: any) {
      console.error(
        "Error inesperado en DELETE /api/client/[cliId]:",
        error?.message || error
      );
      return NextResponse.json(
        { error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
