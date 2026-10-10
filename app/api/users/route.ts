import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { UserWithToken } from "@/lib/types";
import { stringifyWithBigInt } from "@/utils/converters";
import { parseBody } from "@/lib/validation";
import { userCreateSchema } from "@/lib/schemas/apiSchemas";
import { canManageRole, manageableRoles } from "@/lib/constants/roles";

export async function GET(request: NextRequest) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const currentUser = req.user as UserWithToken;
      const rolesToFetch = manageableRoles(currentUser.userRole);
      if (rolesToFetch.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "No tiene permiso para realizar esta acción",
          },
          { status: 403 }
        );
      }

      const users = await prisma.ava_usuario.findMany({
        where: {
          usu_rol: { in: rolesToFetch },
        },
      });

      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(users) },
        { status: 200 }
      );
    } catch (error: any) {
      console.error(
        "Error inesperado en GET /api/users:",
        error?.message || error
      );
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
      const parsed = await parseBody(request, userCreateSchema);
      if (!parsed.success) return parsed.response;
      const body = parsed.data;

      const currentUser = req.user as UserWithToken;
      if (!canManageRole(currentUser.userRole, body.usu_rol)) {
        return NextResponse.json(
          { success: false, error: "No tienes permiso para gestionar ese rol" },
          { status: 403 }
        );
      }

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
          usu_estado: body.usu_estado,
          usu_rol: body.usu_rol,
        },
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
        "Error inesperado en POST /api/users:",
        error?.message || error
      );
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
