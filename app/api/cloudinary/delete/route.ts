import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { authenticate } from "@/lib/auth";

export async function POST(request: NextRequest) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const { publicId } = await request.json();

      if (!publicId) {
        return NextResponse.json(
          { success: false, error: "Public ID no proporcionado" },
          { status: 400 }
        );
      }

      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: "raw",
      });

      if (result.result !== "ok") {
        return NextResponse.json(
          { success: false, error: "Error eliminando archivo" },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { success: true, message: "Archivo eliminado" },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error al eliminar archivo:", error);
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
