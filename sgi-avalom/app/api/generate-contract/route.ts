// app/api/generate-contract/route.ts
import { NextRequest } from "next/server";
import { PDFDocument, StandardFonts, PDFFont, PDFPage } from "pdf-lib";

interface ContractData {
  // Campos existentes (obligatorios)
  arrendante: string;
  cedulaArrendante: string;
  arrendatario: string;
  cedulaArrendatario: string;
  estadoCivil: string;
  direccion: string;
  aptoNumero: string;
  contratoDesde: string;
  contratoHasta: string;
  montoTotal: number;
  diaPago: number;
  duracionAnios: number;
  
  // Nuevos campos obligatorios
  diaPrimerPago: number; // Día del mes del primer pago
  numeroMiembros: number; // Número de miembros del núcleo familiar
  depositoGarantia: number; // Monto del depósito de garantía
  
  // Nuevos campos opcionales
  fechaFirma?: string; // Fecha de firma del contrato
  matriculaFinca?: string; // Matrícula de la finca en el Registro Público
  planoFinca?: string; // Información del plano de la finca
  ubicacionFinca?: string; // Ubicación (distrito, cantón, provincia)
  linderosFinca?: string; // Linderos de la finca
  descripcionApartamento?: string; // Descripción detallada del apartamento
}

export async function POST(req: NextRequest) {
  const data: ContractData = await req.json();
  
  // Validar campos obligatorios
  if (!data.diaPrimerPago || !data.numeroMiembros || !data.depositoGarantia) {
    return new Response(
      JSON.stringify({ 
        error: "Faltan campos obligatorios: diaPrimerPago, numeroMiembros, depositoGarantia" 
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const pdf = await PDFDocument.create();
  let page = pdf.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();

  const helv = await pdf.embedFont(StandardFonts.TimesRoman);
  const helvBold = await pdf.embedFont(StandardFonts.TimesRoman);

  const margin = 50;
  let y = height - margin;

  const wrapText = (text: string, fontSize = 14, indent = 0) => {
    const maxWidth = width - 2 * margin - indent;
    const words = text.split(" ");
    let lineWords: string[] = [];
    let lineWidth = 0;

    const drawLine = () => {
      const totalSpacing =
        maxWidth -
        lineWords
          .map((w) => helv.widthOfTextAtSize(w, fontSize))
          .reduce((a, b) => a + b, 0);

      const spacing =
        lineWords.length > 1 ? totalSpacing / (lineWords.length - 1) : 0;

      let x = margin + indent;
      for (let i = 0; i < lineWords.length; i++) {
        page.drawText(lineWords[i], {
          x,
          y,
          size: fontSize,
          font: helv,
        });
        x += helv.widthOfTextAtSize(lineWords[i], fontSize) + spacing;
      }
      y -= fontSize + 4;

      // Salto de página si ya no hay espacio
      if (y < margin + fontSize + 10) {
        page = pdf.addPage([595.28, 841.89]);
        y = height - margin;
      }
    };

    for (const word of words) {
      const wordWidth = helv.widthOfTextAtSize(word + " ", fontSize);
      if (lineWidth + wordWidth > maxWidth) {
        drawLine();
        lineWords = [word];
        lineWidth = wordWidth;
      } else {
        lineWords.push(word);
        lineWidth += wordWidth;
      }
    }

    // Última línea alineada a la izquierda
    let x = margin + indent;
    lineWords.forEach((word) => {
      page.drawText(word, { x, y, size: fontSize, font: helv });
      x += helv.widthOfTextAtSize(word + " ", fontSize);
    });
    y -= fontSize + 8;

    if (y < margin + fontSize + 10) {
      page = pdf.addPage([595.28, 841.89]);
      y = height - margin;
    }
  };
  // Título
  const title = "CONTRATO DE ARRENDAMIENTO";
  const sizeTitle = 16;
  const titleWidth = helvBold.widthOfTextAtSize(title, sizeTitle);
  page.drawText(title, {
    x: (width - titleWidth) / 2,
    y,
    size: sizeTitle,
    font: helvBold,
  });
  y -= 30;

  // Introducción
  wrapText(
    `Nosotros ${data.arrendante}, cédula ${data.cedulaArrendante}, y ${data.arrendatario}, cédula ${data.cedulaArrendatario}, estado civil ${data.estadoCivil}, vecino de ${data.direccion}, Apartamento número ${data.aptoNumero}, hemos convenido en el siguiente contrato de arrendamiento de APARTAMENTO DE HABITACIÓN regido por las siguientes cláusulas:`
  );

  // Construir texto de matrícula y plano
  const matriculaTexto = data.matriculaFinca || "__________";
  const planoTexto = data.planoFinca || "__________";
  const ubicacionTexto = data.ubicacionFinca || "__________";
  const linderosTexto = data.linderosFinca || "__________";
  const descripcionApto = data.descripcionApartamento || "sala, comedor, cocina, dos habitaciones y un baño";
  const diaPrimerPagoTexto = data.diaPrimerPago ? String(data.diaPrimerPago) : "__________";
  const numeroMiembrosTexto = data.numeroMiembros ? String(data.numeroMiembros) : "__________";
  const depositoTexto = data.depositoGarantia ? `CRC ${data.depositoGarantia.toLocaleString()}` : "CRC __________";
  const fechaFirmaTexto = data.fechaFirma || "__________";

  // Cláusulas
  const clausulas = [
    `PRIMERA.- Que la primera es dueña de la finca inscrita en el Registro Público de la Propiedad bajo el sistema de Folio Real matrículas ${matriculaTexto} de la provincia de San José; que consta en un plano ${planoTexto}; ubicada en ${ubicacionTexto}; lindando ${linderosTexto}.`,
    `SEGUNDA.- Que el primero le da en arrendamiento a la segunda un apartamento identificado con el número ${data.aptoNumero}, que consta de ${descripcionApto}.`,
    `TERCERA.- El precio del alquiler es la suma total de CRC ${data.montoTotal.toLocaleString()}, para el primer año, pagadera por mensualidades adelantadas los días ${
      data.diaPago
    } de cada mes, realizando el primer pago el día ${diaPrimerPagoTexto}. El precio del arrendamiento tendrá incrementos anual conforme a lo que dicte la ley para arrendamientos de casa de habitación.`,
    `CUARTA.- El plazo de este contrato es de TRES AÑOS a partir del ${data.contratoDesde} y hasta el ${data.contratoHasta}.`,
    `QUINTA.- Queda totalmente prohibido el subarrriendo, no pudiendo el arrendatario introducir a vivir más personas que las que conforman su núcleo familiar, el cual se compone de ${numeroMiembrosTexto} miembros. Si se llegare a determinar por parte del propietario que dentro del inmueble se encuentra viviendo más personas que las indicadas al momento de firmar, será causa de incumplimiento pudiendo el arrendante solicitar la desocupación.`,
    `SÉTIMA.- El arrendatario acepta que este apartamento será únicamente utilizado como casa de habitación, quedando prohibido utilizarlo para negocios comerciales o cualquier otra actividad distinta a la habitacional.`,
    `OCTAVA.- El costo de los servicios de agua y electricidad está incluido en el precio del alquiler, por lo que el arrendatario se compromete a hacer un uso adecuado y racional de los mismos.`,
    `NOVENA.- Una vez transcurrido el plazo, deberá celebrarse un nuevo contrato donde se negociarán plazo y precio.`,
    `DÉCIMA.- El arrendante se reserva el derecho de realizar inspecciones a la propiedad cada vez que lo estime conveniente, previa comunicación al arrendatario.`,
    `DÉCIMA PRIMERA.- El inquilino ha cancelado como depósito de garantía la suma de ${depositoTexto}, dinero que será devuelto al finalizar el presente contrato, siempre y cuando demuestre estar al día en pagos y en buen estado.`,
    `DÉCIMA SEGUNDA.- El inquilino se compromete a dar aviso al propietario de cualquier desperfecto o daño que deba repararse lo más pronto posible para evitar gastos mayores.`,
    `DÉCIMA TERCERA.- Cualquier daño o pérdida que se cause por negligencia del inquilino será responsabilidad de éste y deberá repararlo. Queda liberado de daños causados por terceros, fuerza mayor o caso fortuito.`,
    `DÉCIMA CUARTA.- El inquilino conoce y acepta la existencia de cámaras de seguridad instaladas fuera de cada apartamento, para resguardar la seguridad de inquilinos y propiedad.`,
  ];

  clausulas.forEach((clausula) => wrapText(clausula));

  // Cierre
  wrapText(
    `Estando ambos conformes con lo anteriormente manifestado, firmamos en San Isidro de Pérez Zeledón, el ${fechaFirmaTexto}.`,
    11
  );

  // Firmas
  if (y - 60 < margin) {
    page = pdf.addPage([595.28, 841.89]);
    y = height - margin;
  }

  y -= 30;
  page.drawLine({
    start: { x: margin, y },
    end: { x: margin + 200, y },
    thickness: 1,
  });
  page.drawText("Arrendante", {
    x: margin + 60,
    y: y - 15,
    size: 11,
    font: helv,
  });

  page.drawLine({
    start: { x: width - margin - 200, y },
    end: { x: width - margin, y },
    thickness: 1,
  });
  page.drawText("Arrendatario(a)", {
    x: width - margin - 140,
    y: y - 15,
    size: 11,
    font: helv,
  });

  const bytes = await pdf.save();

  return new Response(bytes, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="contrato_${data.aptoNumero}.pdf"`,
    },
  });
}
