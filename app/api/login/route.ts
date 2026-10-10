import { NextRequest, NextResponse } from "next/server";
import { comparePassword, generateToken, setSessionCookie } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { stringifyWithBigInt } from "@/utils/converters";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { success: false, error: "Email y contraseña son requeridos" },
      { status: 400 }
    );
  }

  const user = await prisma.ava_usuario.findFirst({
    where: { usu_correo: email.toLowerCase() },
    omit: { usu_contrasena: false },
  });

  // Mismo mensaje para usuario inexistente y contraseña incorrecta
  if (!user || !(await comparePassword(password, user.usu_contrasena))) {
    return NextResponse.json(
      { success: false, error: "Email o contraseña invalidos" },
      { status: 401 }
    );
  }

  if (user.usu_estado !== "A") {
    return NextResponse.json(
      { success: false, error: "Usuario inactivo" },
      { status: 401 }
    );
  }

  // El hash de la contraseña nunca sale del servidor
  const { usu_contrasena, rowid, ...publicUser } = user;

  const response = NextResponse.json(
    stringifyWithBigInt({ message: "Login successful", user: publicUser })
  );
  // El token va solo en una cookie httpOnly; el navegador no lo puede leer
  setSessionCookie(response, generateToken(String(user.usu_id), user.usu_rol));
  return response;
}
