// app/api/export-clients/route.ts
import { NextRequest } from 'next/server'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  // 1. Traer clientes + estado de contrato
  const clientes = await prisma.ava_cliente.findMany({
    orderBy: { cli_nombre: 'asc' },
    select: {
      cli_nombre: true,
      cli_papellido: true,
      cli_sapellido: true,
      cli_correo: true,
      cli_telefono: true,
      ava_clientexalquiler: {
        select: { ava_alquiler: { select: { alq_estado: true } } },
        take: 1,
      },
    },
  })

  // 2. Crear PDF y página
  const pdfDoc = await PDFDocument.create()
  let page = pdfDoc.addPage([595.28, 841.89]) // A4
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const { width, height } = page.getSize()

  // Margen y configuración de columnas
  const marginX = 50
  const marginTop = height - 50
  const rowHeight = 20
  const colWidths = [40, 180, 150, 80, 80] // ancho aproximado de cada columna
  const colsX = colWidths.reduce<number[]>((arr, w, i) => {
    if (i === 0) return [marginX]
    return [...arr, arr[i - 1] + colWidths[i - 1]]
  }, [])

  // 3. Dibujar cabecera de la tabla
  // Líneas horizontales
  page.drawLine({
    start: { x: marginX - 5, y: marginTop + 5 },
    end: { x: marginX - 5 + colWidths.reduce((a, b) => a + b, 0) + 5, y: marginTop + 5 },
    thickness: 1,
    color: rgb(0, 0, 0),
  })
  page.drawLine({
    start: { x: marginX - 5, y: marginTop - rowHeight + 5 },
    end: { x: marginX - 5 + colWidths.reduce((a, b) => a + b, 0) + 5, y: marginTop - rowHeight + 5 },
    thickness: 1,
    color: rgb(0, 0, 0),
  })

  // Texto de cabecera
  const headers = ['No.', 'Nombre', 'Correo', 'Teléfono', 'Estado']
  headers.forEach((h, i) => {
    page.drawText(h, {
      x: colsX[i],
      y: marginTop - 10,
      size: 12,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    })
  })

  // 4. Dibujar filas
  let cursorY = marginTop - rowHeight - 5
  clientes.forEach((c, idx) => {
    // Cada vez que bajamos demasiado, creamos nueva página
    if (cursorY < 50) {
      page = pdfDoc.addPage([595.28, 841.89])
      cursorY = height - 50 - rowHeight
    }

    // Nombre completo
    const nombreCompleto = [c.cli_nombre, c.cli_papellido, c.cli_sapellido]
      .filter(Boolean)
      .join(' ')

    // Estado legible
    const estadoRaw = c.ava_clientexalquiler[0]?.ava_alquiler.alq_estado
    const estado =
      estadoRaw === 'A' ? 'Activo' :
      estadoRaw === 'C' ? 'Cancelado' :
      'Sin contrato'

    const row = [
      String(idx + 1),
      nombreCompleto,
      c.cli_correo,
      c.cli_telefono ?? '—',
      estado,
    ]

    // Dibujar cada celda
    row.forEach((text, i) => {
      page.drawText(text, {
        x: colsX[i],
        y: cursorY,
        size: 10,
        font: helvetica,
        color: rgb(0, 0, 0),
        maxWidth: colWidths[i] - 5, // recorte si es muy largo
      })
    })

    // Línea separadora de fila
    page.drawLine({
      start: { x: marginX - 5, y: cursorY - 2 },
      end: {
        x: marginX - 5 + colWidths.reduce((a, b) => a + b, 0) + 5,
        y: cursorY - 2,
      },
      thickness: 0.5,
      color: rgb(0.5, 0.5, 0.5),
    })

    cursorY -= rowHeight
  })

  // 5. Serializar y responder
  const pdfBytes = await pdfDoc.save()
  return new Response(pdfBytes, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="clientes.pdf"',
    },
  })
}
