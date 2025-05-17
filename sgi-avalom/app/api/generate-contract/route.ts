// app/api/generate-contract/route.ts
import { NextRequest } from 'next/server'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

interface ContractData {
  arrendante: string
  cedulaArrendante: string
  arrendatario: string
  cedulaArrendatario: string
  estadoCivil: string
  direccion: string
  aptoNumero: string
  contratoDesde: string
  contratoHasta: string
  montoTotal: number
  diaPago: number
  duracionAnios: number
}

export async function POST(req: NextRequest) {
  const data: ContractData = await req.json()

  const pdf = await PDFDocument.create()
  const page = pdf.addPage([595.28, 841.89]) // A4
  const { width, height } = page.getSize()
  const helv = await pdf.embedFont(StandardFonts.Helvetica)
  const helvBold = await pdf.embedFont(StandardFonts.HelveticaBold)

  const margin = 50
  let y = height - margin

  // 1. Título centrado
  const title = 'CONTRATO DE ARRENDAMIENTO'
  const sizeTitle = 16
  const titleWidth = helvBold.widthOfTextAtSize(title, sizeTitle)
  page.drawText(title, { x: (width - titleWidth) / 2, y, size: sizeTitle, font: helvBold })
  y -= 30

  // Helper para texto con wrap
  const wrapText = (text: string, fontSize = 11, indent = 0) => {
    const maxWidth = width - 2 * margin - indent
    const words = text.split(' ')
    let line = ''
    for (const word of words) {
      const test = line + word + ' '
      if (helv.widthOfTextAtSize(test, fontSize) > maxWidth) {
        page.drawText(line.trim(), { x: margin + indent, y, size: fontSize, font: helv })
        y -= fontSize + 4
        line = word + ' '
      } else {
        line = test
      }
    }
    if (line) {
      page.drawText(line.trim(), { x: margin + indent, y, size: fontSize, font: helv })
      y -= fontSize + 8
    }
  }

  // 2. Texto introductorio
  wrapText(`Nosotros ${data.arrendante}, cédula ${data.cedulaArrendante}, y ${data.arrendatario}, cédula ${data.cedulaArrendatario}, estado civil ${data.estadoCivil}, vecino de ${data.direccion}, Apartamento número ${data.aptoNumero}, hemos convenido en el siguiente contrato de arrendamiento de APARTAMENTO DE HABITACIÓN regido por las siguientes cláusulas:`)

  // 3. Cláusulas completas
  const clausulas = [
    `PRIMERA.- Que la primera es dueña de la finca inscrita en el Registro Público de la Propiedad bajo el sistema de Folio Real matrículas CIENTO SESENTA Y NUEVE MIL NOVECIENTOS OCHENTA Y SIETE-CERO CERO CERO de la provincia de San José; que consta en un plano S-J- ciento nueve mil seiscientos diecisiete-cincuenta y ocho decímetros cuadrados; ubicada en el distrito primero, cantón Pérez Zeledón; lindando al norte con carretera interamericana, al sur con finca de Rómulo Concepción Solís Cambronero, al este con propiedad de Carmen, y al oeste con propiedad de López.`,
    `SEGUNDA.- Que el primero le da en arrendamiento a la segunda un apartamento identificado con el número ${data.aptoNumero}, que consta de sala, comedor, cocina, dos habitaciones y un baño.`,
    `TERCERA.- El precio del alquiler es la suma total de ₡${data.montoTotal.toLocaleString()}, para el primer año, pagadera por mensualidades adelantadas los días ${data.diaPago} de cada mes, realizando el primer pago el día _____. El precio del arrendamiento tendrá incrementos anual conforme a lo que dicte la ley para arrendamientos de casa de habitación.`,
    `CUARTA.- El plazo de este contrato es de TRES AÑOS a partir del ${data.contratoDesde} y hasta el ${data.contratoHasta}.`,
    `QUINTA.- Queda totalmente prohibido el subarrriendo, no pudiendo el arrendatario introducir a vivir más personas que las que conforman su núcleo familiar, el cual se compone de _____ miembros. Si se llegare a determinar por parte del propietario que dentro del inmueble se encuentra viviendo más personas que las indicadas al momento de firmar, será causa de incumplimiento pudiendo el arrendante solicitar la desocupación.`,
    `SÉTIMA.- El arrendatario acepta que este apartamento será únicamente utilizado como casa de habitación, quedando prohibido utilizarlo para negocios comerciales o cualquier otra actividad distinta a la habitacional.`,
    `OCTAVA.- El costo de los servicios de agua y electricidad está incluido en el precio del alquiler, por lo que el arrendatario se compromete a hacer un uso adecuado y racional de los mismos.`,
    `NOVENA.- Una vez transcurrido el plazo, deberá celebrarse un nuevo contrato donde se negociarán plazo y precio.`,
    `DÉCIMA.- El arrendante se reserva el derecho de realizar inspecciones a la propiedad cada vez que lo estime conveniente, previa comunicación al arrendatario.`,
    `DÉCIMA PRIMERA.- El inquilino ha cancelado como depósito de garantía la suma de ₡__________, dinero que será devuelto al finalizar el presente contrato, siempre y cuando demuestre estar al día en pagos y en buen estado.`,
    `DÉCIMA SEGUNDA.- El inquilino se compromete a dar aviso al propietario de cualquier desperfecto o daño que deba repararse lo más pronto posible para evitar gastos mayores.`,
    `DÉCIMA TERCERA.- Cualquier daño o pérdida que se cause por negligencia del inquilino será responsabilidad de éste y deberá repararlo. Queda liberado de daños causados por terceros, fuerza mayor o caso fortuito.`,
    `DÉCIMA CUARTA.- El inquilino conoce y acepta la existencia de cámaras de seguridad instaladas fuera de cada apartamento, para resguardar la seguridad de inquilinos y propiedad.`
  ]

  clausulas.forEach((c) => wrapText(c))

  // 4. Clausula final de conformidad
  wrapText('Estando ambos conformes con lo anteriormente manifestado, firmamos en San Isidro de Pérez Zeledón, el ___________________________.', 11)

  // 5. Firmas
  y -= 30
  page.drawLine({ start: { x: margin, y }, end: { x: margin + 200, y }, thickness: 1 })
  page.drawText('Arrendante', { x: margin + 60, y: y - 15, size: 11, font: helv })
  page.drawLine({ start: { x: width - margin - 200, y }, end: { x: width - margin, y }, thickness: 1 })
  page.drawText('Arrendatario(a)', { x: width - margin - 140, y: y - 15, size: 11, font: helv })

  // 6. Devolver PDF
  const bytes = await pdf.save()
  return new Response(bytes, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="contrato_${data.aptoNumero}.pdf"`,
    },
  })
}
