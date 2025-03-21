import { NextRequest, NextResponse } from "next/server";
import { comparePassword, generateToken } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { stringifyWithBigInt } from "@/utils/converters";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const emailLowerCase = email.toLowerCase();

  const user = await prisma.ava_usuario.findFirst({
    where: { usu_correo: emailLowerCase },
  });

  if (!user) {
    return NextResponse.json(
      { success: false, error: "Email o contraseña invalidos" },
      { status: 401 }
    );
  }

  const isPasswordValid = await comparePassword(password, user.usu_contrasena);
  if (!isPasswordValid) {
    return NextResponse.json(
      { success: false, error: "Email o contraseña invalidos" },
      { status: 401 }
    );
  }

  const isUserActive = user.usu_estado === "A";
  if (!isUserActive) {
    return NextResponse.json(
      { success: false, error: "Usuario inactivo" },
      { status: 401 }
    );
  }

  const token = generateToken(String(user.usu_id), user.usu_rol);

  const response = {
    message: "Login successful",
    token: token,
    user: {
      ...user,
      usu_id: user.usu_id.toString(),
    },
  };

  return NextResponse.json(response, {
    headers: { "Content-Type": "application/json" },
  });
}
