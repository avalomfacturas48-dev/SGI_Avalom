import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

// Rutas de API accesibles sin sesión
const PUBLIC_API = new Set(["/api/login", "/api/logout"]);
// Páginas accesibles sin sesión
const PUBLIC_PAGES = new Set(["/", "/unauthorized"]);
// El rol Auditor (R) es de solo lectura; estas escrituras sí le aplican
const AUDITOR_WRITE_ALLOWED = new Set(["/api/logout", "/api/cloudinary/view"]);

/**
 * Red de seguridad de autenticación: aunque una ruta olvide usar
 * `authenticate`, no queda expuesta. Las rutas siguen validando por su cuenta.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith("/api/");

  if (isApi && PUBLIC_API.has(pathname)) return NextResponse.next();

  const session = getSession(request);

  if (!isApi) {
    // El login redirige solo al inicio cuando /api/me confirma el usuario.
    // No se redirige aquí: si /api/me fallara con un token válido, se crearía
    // un ciclo / → /homePage → / .
    if (PUBLIC_PAGES.has(pathname)) return NextResponse.next();
    if (!session) return NextResponse.redirect(new URL("/", request.url));
    return NextResponse.next();
  }

  if (!session) {
    return NextResponse.json(
      { success: false, error: "Sesión inválida o expirada" },
      { status: 401 }
    );
  }

  const isWrite = !["GET", "HEAD", "OPTIONS"].includes(request.method);
  if (
    session.userRole === "R" &&
    isWrite &&
    !AUDITOR_WRITE_ALLOWED.has(pathname)
  ) {
    return NextResponse.json(
      { success: false, error: "El rol Auditor es de solo lectura" },
      { status: 403 }
    );
  }

  return NextResponse.next();
}

export const config = {
  // jsonwebtoken necesita el runtime de Node (estable desde Next 15.5)
  runtime: "nodejs",
  // Todo menos assets de Next y archivos estáticos de /public
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.[\\w]+$).*)"],
};
