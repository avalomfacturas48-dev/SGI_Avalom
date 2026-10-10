import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { NextResponse, NextRequest } from "next/server";
import { parse } from "cookie";
import { UserWithToken } from "./types";

export const SESSION_COOKIE = "token";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 días, igual que el JWT

// Se lee al usarlo (no al importar) para no romper el build si falta la
// variable, pero nunca se firma ni verifica con un secreto vacío.
const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET no está configurado");
  }
  return secret;
};

// Hashear la contraseña
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Comparar la contraseña
export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (usu_id: string, usu_rol: string): string => {
  return jwt.sign({ userId: usu_id, userRole: usu_rol }, getJwtSecret(), {
    expiresIn: "7 days",
  });
};

// Verificar el token JWT
export const verifyToken = (token: string): UserWithToken | null => {
  try {
    return jwt.verify(token, getJwtSecret()) as UserWithToken;
  } catch (error) {
    return null;
  }
};

/** Sesión del request a partir de la cookie, o null si no hay o es inválida. */
export const getSession = (req: NextRequest): UserWithToken | null => {
  const token =
    req.cookies?.get(SESSION_COOKIE)?.value ??
    parse(req.headers.get("cookie") || "")[SESSION_COOKIE];
  return token ? verifyToken(token) : null;
};

/** Cookie de sesión httpOnly: el JavaScript del navegador no puede leerla. */
export const setSessionCookie = (res: NextResponse, token: string) => {
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
};

export const clearSessionCookie = (res: NextResponse) => {
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
};

// Middleware para autenticar. Con `roles` además restringe por rol.
export const authenticate = (handler: any, roles?: string[]) => {
  return async (req: NextRequest, res: NextResponse) => {
    const session = getSession(req);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Sesión inválida o expirada" },
        { status: 401 }
      );
    }

    if (roles && !roles.includes(session.userRole)) {
      return NextResponse.json(
        { success: false, error: "No tienes permiso para esta acción" },
        { status: 403 }
      );
    }

    req.user = session;
    return handler(req, res);
  };
};
