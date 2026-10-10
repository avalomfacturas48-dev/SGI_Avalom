import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { stringifyWithBigInt } from "@/utils/converters";
import bcrypt from "bcryptjs";
import { parseBody } from "@/lib/validation";
import { userUpdateSchema } from "@/lib/schemas/apiSchemas";
import { canManageRole } from "@/lib/constants/roles";
import type { UserWithToken } from "@/lib/types";

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
      const parsed = await parseBody(request, userUpdateSchema);
      if (!parsed.success) return parsed.response;
      const body = parsed.data;

      const currentUser = req.user as UserWithToken;
      const userId = BigInt(params.userId);
      const target = await prisma.ava_usuario.findUnique({
        where: { usu_id: userId },
        select: { usu_rol: true, usu_estado: true },
      });
      if (!target) {
        return NextResponse.json(
          { success: false, error: "Usuario no encontrado" },
          { status: 404 }
        );
      }
      // Debe poder gestionar tanto el rol actual como el nuevo
      if (
        !canManageRole(currentUser.userRole, target.usu_rol) ||
        !canManageRole(currentUser.userRole, body.usu_rol)
      ) {
        return NextResponse.json(
          { success: false, error: "No tienes permiso para gestionar ese rol" },
          { status: 403 }
        );
      }
      // Evita que alguien se bloquee a sí mismo
      if (
        currentUser.userId === params.userId &&
        (body.usu_rol !== target.usu_rol || body.usu_estado !== target.usu_estado)
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "No puedes cambiar tu propio rol ni tu estado",
          },
          { status: 400 }
        );
      }

      const updateData: any = {
        usu_nombre: body.usu_nombre,
        usu_papellido: body.usu_papellido,
        usu_sapellido: body.usu_sapellido,
        usu_cedula: body.usu_cedula,
        usu_correo: body.usu_correo,
        usu_telefono: body.usu_telefono,
        usu_estado: body.usu_estado,
        usu_rol: body.usu_rol,
      };

      if (body.usu_contrasena) {
        updateData.usu_contrasena = await bcrypt.hash(body.usu_contrasena, 10);
      }

      const user = await prisma.ava_usuario.update({
        where: { usu_id: userId },
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
        "Error inesperado en PUT /api/users/[userId]:",
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
  context: { params: Promise<{ userId: string }> }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const params = await context.params;
      const currentUser = req.user as UserWithToken;
      if (currentUser.userId === params.userId) {
        return NextResponse.json(
          { success: false, error: "No puedes eliminar tu propio usuario" },
          { status: 400 }
        );
      }

      const target = await prisma.ava_usuario.findUnique({
        where: { usu_id: BigInt(params.userId) },
        select: { usu_rol: true },
      });
      if (!target) {
        return NextResponse.json(
          { success: false, error: "Usuario no encontrado" },
          { status: 404 }
        );
      }
      if (!canManageRole(currentUser.userRole, target.usu_rol)) {
        return NextResponse.json(
          { success: false, error: "No tienes permiso para gestionar ese rol" },
          { status: 403 }
        );
      }

      await prisma.ava_usuario.delete({
        where: { usu_id: BigInt(params.userId) },
      });
      return NextResponse.json(
        { status: 204, message: "Usuario eliminado" },
        { status: 200 }
      );
    } catch (error: any) {
      // Tiene gastos o anulaciones a su nombre: se desactiva, no se borra
      if (error instanceof PrismaClientKnownRequestError && error.code === "P2003") {
        return NextResponse.json(
          {
            success: false,
            error:
              "El usuario tiene registros asociados. Desactívalo en lugar de eliminarlo.",
          },
          { status: 409 }
        );
      }
      console.error(
        "Error inesperado en DELETE /api/users/[userId]:",
        error?.message || error
      );
      return NextResponse.json(
        { error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
