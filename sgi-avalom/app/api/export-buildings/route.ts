// app/api/export-buildings/route.ts
import { NextRequest } from 'next/server'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  // 1) Traer datos
  const edificios = await prisma.ava_edificio.findMany({
    orderBy: { edi_identificador: 'asc' },
    include: {
      ava_propiedad: {
        include: {
          ava_alquiler: {
            include: {
              ava_clientexalquiler: { include: { ava_cliente: true } },
              ava_alquilermensual: {  },
            },
          },
        },
      },
    },
  })

  // 2) Crear PDF y fuentes
  const pdf = await PDFDocument.create()
  const helvetica = await pdf.embedFont(StandardFonts.Helvetica)
  const helveticaBold = await pdf.embedFont(StandardFonts.HelveticaBold)

  // 3) Configuración general
  const A4: [number, number] = [595.28, 841.89]  // ancho, alto
  const marginX = 50
  const marginTop = A4[1] - 50
  const rowH = 18
  const colWidths = [100, 150, 160, 80]           // Edif, Prop, Cliente, Monto
  const colXs = colWidths.reduce<number[]>((acc, w, i) =>i === 0 ? [marginX] : [...acc, acc[i - 1] + colWidths[i - 1]],[])
  const tableWidth = colWidths.reduce((a, b) => a + b, 0)
  // 4) Primera página
  let page = pdf.addPage(A4)
  let cursorY = marginTop

  // 5) Título
  page.drawText('Exportación de Edificios', {
    x: marginX,
    y: cursorY + 20,
    size: 18,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  })
  cursorY -= 30

  // 6) Cabecera de tabla
  page.drawLine({
    start: { x: marginX - 20, y: cursorY + 20 },
    end:   { x: marginX - 20 + tableWidth + 20, y: cursorY + 20 },
    thickness: 1,
    color: rgb(0, 0, 0),
  })
  page.drawLine({
    start: { x: marginX - 20, y: cursorY - rowH + 20 },
    end:   { x: marginX - 20 + tableWidth + 20, y: cursorY - rowH + 20 },
    thickness: 1,
    color: rgb(0, 0, 0),
  })
  ;['Edificio', 'Propiedad', 'Cliente', 'Monto/mes'].forEach((h, i) => {
    page.drawText(h, {
      x: colXs[i],
      y: cursorY - rowH + 20,
      size: 12,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    })
  })
  cursorY -= rowH

  // 7) Filas de datos
  for (const ed of edificios) {
    for (const prop of ed.ava_propiedad) {
      for (const alq of prop.ava_alquiler) {
        for (const mens of alq.ava_alquilermensual) {
          // Salto de página si es necesario
          if (cursorY < 50) {
            page = pdf.addPage(A4)
            cursorY = marginTop
          }

          const edificioLabel  = ed.edi_identificador
          const propiedadLabel = prop.prop_identificador
          const cliente = alq.ava_clientexalquiler[0]?.ava_cliente
          const clienteNombre = cliente
            ? `${cliente.cli_nombre} ${cliente.cli_papellido}`
            : '—'
          const monto = mens.alqm_montototal.toString()

          const row = [edificioLabel, propiedadLabel, clienteNombre, monto]
          row.forEach((text, i) => {
            page.drawText(text, {
              x: colXs[i],
              y: cursorY,
              size: 10,
              font: helvetica,
              color: rgb(0, 0, 0),
              maxWidth: colWidths[i] - 5,
            })
          })

          page.drawLine({
            start: { x: marginX - 5, y: cursorY - 2 },
            end:   { x: marginX - 5 + tableWidth + 5, y: cursorY - 2 },
            thickness: 0.5,
            color: rgb(0.5, 0.5, 0.5),
          })

          cursorY -= rowH
        }
      }
    }
  }

  // 8) Devolver PDF
  const pdfBytes = await pdf.save()
  return new Response(pdfBytes, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="edificios.pdf"',
    },
  })
}
