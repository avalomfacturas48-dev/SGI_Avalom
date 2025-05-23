// app/api/import-clients/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'

export async function POST(req: NextRequest) {
  // 1) Obtener archivo
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) {
    return NextResponse.json({ message: 'No se subió ningún archivo' }, { status: 400 })
  }

  // 2) Leer Excel
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheet = workbook.SheetNames[0]
  const rows: any[][] = XLSX.utils.sheet_to_json(workbook.Sheets[sheet], { header: 1 })

  // 3) Mapear datos (asumiendo primera fila headers)
  const [headers, ...dataRows] = rows
  const clientes = dataRows.map((r) => {
    const [
      nombre,
      papellido,
      sapellido,
      cedula,
      telefono,
      correo,
      dirección,
      estadocivil,
    ] = r
    return {
      cli_nombre: String(nombre || '').trim(),
      cli_papellido: String(papellido || '').trim(),
      cli_sapellido: String(sapellido || '').trim() || null,
      cli_cedula: String(cedula || '').trim(),
      cli_telefono: String(telefono || '').trim(),
      cli_correo: String(correo || '').trim(),
      cli_direccion: String(dirección || '').trim() || null,
      cli_estadocivil: String(estadocivil || '').trim() || null,
    }
  })

  // 4) Guardar con upsert para manejar duplicados
  let imported = 0
  for (const c of clientes) {
    try {
      await prisma.ava_cliente.upsert({
        where: { cli_cedula: c.cli_cedula },
        create: c,
        update: {
          cli_nombre: c.cli_nombre,
          cli_papellido: c.cli_papellido,
          cli_sapellido: c.cli_sapellido,
          cli_telefono: c.cli_telefono,
          cli_correo: c.cli_correo,
          cli_direccion: c.cli_direccion,
          cli_estadocivil: c.cli_estadocivil,
        },
      })
      imported++
    } catch (e) {
      console.error('Error al importar', c.cli_cedula, e)
    }
  }

  return NextResponse.json(
    { message: `Importación exitosa: ${imported} clientes procesados.` },
    { status: 200 }
  )
}
