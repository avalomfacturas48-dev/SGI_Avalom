// app/api/import-users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";
import { v4 as uuid } from "uuid";

export async function POST(req: NextRequest) {
  // 1) Leer form-data
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json(
      { message: "No se subió ningún archivo" },
      { status: 400 }
    );
  }

  // 2) Parsear Excel
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const rows: any[][] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
    header: 1,
  });

  if (rows.length < 2) {
    return NextResponse.json(
      { message: "El archivo no contiene datos" },
      { status: 400 }
    );
  }

  // 3) Mapear filas a objetos de usuario
  const [, ...dataRows] = rows;
  let imported = 0;

  for (const row of dataRows) {
    const [
      nombre,
      papellido,
      sapellido,
      cedula,
      correo,
      telefono,
      rol = "U",
      estado = "A",
    ] = row;

    // Construimos el objeto con contraseña por defecto
    const u = {
      usu_nombre: String(nombre || "").trim(),
      usu_papellido: String(papellido || "").trim(),
      usu_sapellido: String(sapellido || "").trim() || null,
      usu_cedula: String(cedula || "").trim(),
      usu_correo: String(correo || "").trim(),
      usu_telefono: String(telefono || "").trim() || null,
      usu_rol: String(rol).trim(), // 'A' o 'U'
      usu_estado: String(estado).trim(), // 'A' o 'I'
      usu_contrasena: uuid(), // contraseña por defecto única
    };

    try {
      await prisma.ava_usuario.upsert({
        where: { usu_cedula: u.usu_cedula },
        create: u,
        update: {
          usu_nombre: u.usu_nombre,
          usu_papellido: u.usu_papellido,
          usu_sapellido: u.usu_sapellido,
          usu_correo: u.usu_correo,
          usu_telefono: u.usu_telefono,
          usu_rol: u.usu_rol,
          usu_estado: u.usu_estado,
          // no sobreescribimos la contraseña en update para no resetearla
        },
      });
      imported++;
    } catch (e) {
      console.error("Error importando usuario", u.usu_cedula, e);
    }
  }

  return NextResponse.json(
    { message: `Importación exitosa: ${imported} usuarios procesados.` },
    { status: 200 }
  );
}
