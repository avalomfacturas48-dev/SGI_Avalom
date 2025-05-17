// app/api/export-users/route.ts
import { NextRequest } from 'next/server'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  // 1) Traer usuarios
  const usuarios = await prisma.ava_usuario.findMany({
    orderBy: { usu_nombre: 'asc' },
    select: {
      usu_nombre: true,
      usu_papellido: true,
      usu_sapellido: true,
      usu_correo: true,
      usu_telefono: true,
      usu_estado: true,
      usu_rol: true,
    },
  })

  // 2) Crear PDF y página
  const pdfDoc = await PDFDocument.create()
  let page = pdfDoc.addPage([595.28, 841.89]) // A4
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const { width, height } = page.getSize()

  // Márgenes y columnas
  const marginX = 50
  const marginTop = height - 50
  const rowH = 20
  const colWs = [40, 160, 160, 80, 40, 60]  // No., Nombre, Correo, Tel, Est, Rol
  const colXs = colWs.reduce<number[]>((acc, w, i) => {
    if (i === 0) return [marginX]
    return [...acc, acc[i - 1] + colWs[i - 1]]
  }, [])

  // 3) Cabecera de tabla
  page.drawLine({
    start: { x: marginX - 5, y: marginTop + 5 },
    end: { x: marginX - 5 + colWs.reduce((a, b) => a + b, 0) + 5, y: marginTop + 5 },
    thickness: 1,
    color: rgb(0, 0, 0),
  })
  page.drawLine({
    start: { x: marginX - 5, y: marginTop - rowH + 5 },
    end: { x: marginX - 5 + colWs.reduce((a, b) => a + b, 0) + 5, y: marginTop - rowH + 5 },
    thickness: 1,
    color: rgb(0, 0, 0),
  })

  const headers = ['No.', 'Nombre', 'Correo', 'Teléfono', 'Est', 'Rol']
  headers.forEach((h, i) => {
    page.drawText(h, {
      x: colXs[i],
      y: marginTop - 10,
      size: 12,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    })
  })

  // 4) Filas
  let cursorY = marginTop - rowH - 5
  usuarios.forEach((u, idx) => {
    if (cursorY < 50) {
      page = pdfDoc.addPage([595.28, 841.89])
      cursorY = height - 50 - rowH
    }

    const nombreCompleto = [u.usu_nombre, u.usu_papellido, u.usu_sapellido]
      .filter(Boolean).join(' ')
    const estado = u.usu_estado === 'A' ? 'Activo' : 'Inactivo'
    const rol = u.usu_rol === 'A' ? 'Admin' : 'Usuario'

    const row = [
      String(idx + 1),
      nombreCompleto,
      u.usu_correo,
      u.usu_telefono ?? '—',
      estado,
      rol,
    ]

    row.forEach((text, i) => {
      page.drawText(text, {
        x: colXs[i],
        y: cursorY,
        size: 10,
        font: helvetica,
        color: rgb(0, 0, 0),
        maxWidth: colWs[i] - 5,
      })
    })

    page.drawLine({
      start: { x: marginX - 5, y: cursorY - 2 },
      end: { x: marginX - 5 + colWs.reduce((a, b) => a + b, 0) + 5, y: cursorY - 2 },
      thickness: 0.5,
      color: rgb(0.5, 0.5, 0.5),
    })

    cursorY -= rowH
  })

  // 5) Responder con el PDF
  const pdfBytes = await pdfDoc.save()
  return new Response(pdfBytes, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="usuarios.pdf"',
    },
  })
}
