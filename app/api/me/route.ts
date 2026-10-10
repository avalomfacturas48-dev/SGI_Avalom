import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clearSessionCookie, getSession } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";
import { publicUserSelect } from "@/lib/constants/prismaIncludes";

/** Usuario de la sesión actual, leído de la BD (rol y estado al día). */
export async function GET(request: NextRequest) {
  const session = getSession(request);
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Sesión inválida o expirada" },
      { status: 401 }
    );
  }

  const user = await prisma.ava_usuario.findUnique({
    where: { usu_id: BigInt(session.userId) },
    select: publicUserSelect,
  });

  if (!user || user.usu_estado !== "A") {
    const response = NextResponse.json(
      { success: false, error: "Usuario inactivo o inexistente" },
      { status: 401 }
    );
    clearSessionCookie(response);
    return response;
  }

  return NextResponse.json({ success: true, data: stringifyWithBigInt(user) });
}
