// app/api/generate-contract/route.ts
import { NextRequest } from "next/server";
import { PDFDocument, StandardFonts } from "pdf-lib";

/**
 * Datos del contrato. TODOS son opcionales: lo que no venga se imprime como una
 * línea en blanco ("__________") para llenar a mano. El "Arrendante" es fijo en
 * código porque siempre es el mismo propietario (Departamentos Avalom).
 */
interface ContractData {
  // Arrendatario (cláusula introductoria)
  arrendatario?: string;
  cedulaArrendatario?: string;
  estadoCivil?: string;
  aptoNumero?: string;

  // Apartamento (cláusula SEGUNDA)
  descripcionApartamento?: string;

  // Precio y plazo (cláusulas TERCERA y CUARTA)
  montoTotal?: number;
  diaPago?: number;
  primerPago?: string; // fecha o día del primer pago (texto)
  contratoDesde?: string;
  contratoHasta?: string;

  // Depósito de garantía (cláusula DÉCIMA PRIMERA)
  depositoGarantia?: number;

  // Cierre
  fechaFirma?: string;
}

export async function POST(req: NextRequest) {
  const data: ContractData = await req.json();

  const pdf = await PDFDocument.create();
  const pageSize: [number, number] = [595.28, 841.89]; // A4
  let page = pdf.addPage(pageSize);
  const { width, height } = page.getSize();

  // Fuente sans-serif (como el contrato original), regular y negrita.
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const margin = 64;
  const fontSize = 12;
  const lineGap = Math.round(fontSize * 2.1); // interlineado ~2.1
  const paragraphGap = 8;
  const maxWidth = width - 2 * margin;
  const spaceWidth = font.widthOfTextAtSize(" ", fontSize);
  let y = height - margin;

  const ensureSpace = (needed = lineGap) => {
    if (y - needed < margin) {
      page = pdf.addPage(pageSize);
      y = height - margin;
    }
  };

  // ---- Composición por "runs" (tramos con o sin negrita) ----
  type Run = { text: string; bold?: boolean };
  // Tramo de texto fijo (normal o negrita).
  const t = (text: string, bold = false): Run => ({ text, bold });
  // Valor autocompletado: si hay dato va en NEGRITA; si no, línea en blanco normal.
  const val = (v: unknown, len = 24): Run => {
    const s = v === undefined || v === null ? "" : String(v).trim();
    return s !== "" ? { text: s, bold: true } : { text: "_".repeat(len), bold: false };
  };
  // Monto en colones autocompletado (negrita si hay dato; 0 es un valor válido).
  const money = (v?: number): Run => {
    const ok = typeof v === "number" && !isNaN(v) && v >= 0;
    return ok
      ? { text: `¢${v.toLocaleString("es-CR")}`, bold: true }
      : { text: "_".repeat(24), bold: false };
  };
  const widthOf = (tok: { word: string; bold: boolean }) =>
    (tok.bold ? fontBold : font).widthOfTextAtSize(tok.word, fontSize);

  // Párrafo justificado con tramos en negrita. Se dibuja palabra por palabra
  // (avanzando la x medida) para que nunca se peguen y se pueda justificar.
  const drawParagraph = (runs: Run[]) => {
    const tokens: { word: string; bold: boolean }[] = [];
    for (const run of runs) {
      run.text
        .split(/\s+/)
        .filter(Boolean)
        .forEach((word) => tokens.push({ word, bold: !!run.bold }));
    }

    let line: { word: string; bold: boolean }[] = [];
    let lineWidth = 0;

    const flush = (justify: boolean) => {
      ensureSpace();
      const gaps = line.length - 1;
      let extra = 0;
      if (justify && gaps > 0) {
        const used = line.reduce(
          (s, tok, i) => s + widthOf(tok) + (i < gaps ? spaceWidth : 0),
          0
        );
        extra = Math.max(0, (maxWidth - used) / gaps);
      }
      let x = margin;
      line.forEach((tok, i) => {
        page.drawText(tok.word, {
          x,
          y,
          size: fontSize,
          font: tok.bold ? fontBold : font,
        });
        x += widthOf(tok);
        if (i < gaps) x += spaceWidth + extra;
      });
      y -= lineGap;
      line = [];
      lineWidth = 0;
    };

    for (const tok of tokens) {
      const w = widthOf(tok);
      const add = (line.length ? spaceWidth : 0) + w;
      if (lineWidth + add > maxWidth && line.length) {
        flush(true); // línea intermedia → justificada
        line = [tok];
        lineWidth = w;
      } else {
        line.push(tok);
        lineWidth += add;
      }
    }
    if (line.length) flush(false); // última línea → sin justificar
    y -= paragraphGap;
  };

  // Título centrado en negrita.
  const title = "CONTRATO DE ARRENDAMIENTO";
  const titleSize = 15;
  ensureSpace(titleSize + 10);
  page.drawText(title, {
    x: (width - fontBold.widthOfTextAtSize(title, titleSize)) / 2,
    y,
    size: titleSize,
    font: fontBold,
  });
  y -= titleSize + 18;

  // Introducción (arrendante fijo + arrendatario con datos o en blanco).
  drawParagraph([
    t("Nosotros "),
    t("FERMIN AVILA MORA", true),
    t(
      ", mayor casado una vez, comerciante, cédula uno- novecientos setenta- cero cincuenta y seis, vecino de El Carmen de Cajón de Pérez Zeledón, setecientos metros al norte de la escuela, el primero por si y el segundo en su condición de Apoderado Generalísimo sin límite de suma de "
    ),
    t("CESAR AVILA MORA", true),
    t(
      ', mayor, soltero, cédula uno- novecientos treinta y ocho- ciento noventa y seis, vecino de sesenta y ocho once Hallard Ct. Frederick, Meryland, Estados Unidos de América, personería que se encuentra vigente y de la cual la suscrita notaria da fe con vista del Registro de Personas jurídicas tomo dos mil veinte, asiento ciento setenta y un mil cero dieciocho- uno- uno, para los efectos de este contrato "El Arrendante" y '
    ),
    val(data.arrendatario, 40),
    t(" Cédula "),
    val(data.cedulaArrendatario, 18),
    t(", estado civil "),
    val(data.estadoCivil, 18),
    t(
      " vecino de Barrio Sinaí de Pérez Zeledón, entrada a la cancha sintética, Apartamento número "
    ),
    val(data.aptoNumero, 10),
    t(
      ', y para los efectos de este contrato "El arrendatario" hemos convenido en el siguiente contrato de arrendamiento de APARTAMENTO DE HABITACIÓN regido por las siguientes cláusulas:'
    ),
  ]);

  const clausulas: Run[][] = [
    [
      t("PRIMERA.- ", true),
      t(
        "Que la primera es dueño de la finca inscrita en el Registro Público de la propiedad bajo el sistema de Folio Real matrículas "
      ),
      t("CIENTO SESENTA Y NUEVE MIL NOVECIENTOS OCHENTA Y SIETE- CERO CERO CERO", true),
      t(
        " de la provincia de San José, que es terreno para construir con una casa. Situada en el distrito primero, cantón diecinueve, de la provincia de San José. Linda Norte: Rumaldo Concepción Granda, Sur: carretera interamericana, Este, calle pública y Oeste, Leovigildo Sánchez Cambronero. Mide: ciento treinta y seis metros con noventa y ocho decímetros cuadrados, plano SJ- ciento nueve mil seiscientos diecisiete- noventa y tres."
      ),
    ],
    [
      t("SEGUNDA.- ", true),
      t(
        "Que el primero le da arrendamiento a la segunda un apartamento identificado con el numero "
      ),
      val(data.aptoNumero, 10),
      t(", consta de "),
      val(data.descripcionApartamento, 40),
      t("."),
    ],
    [
      t("TERCERA ", true),
      t("El precio del alquiler es la suma total de "),
      money(data.montoTotal),
      t(
        ", para el primero año, pagadera por mensualidades adelantadas los días "
      ),
      val(data.diaPago, 6),
      t(" de cada mes, realizando el primer pago el día "),
      val(data.primerPago, 24),
      t(
        ". El precio del arrendamiento tendrá incrementos anual conforme a lo que dicte la ley para arrendamientos de casa de habitación."
      ),
    ],
    [
      t("CUARTA.- ", true),
      t("El plazo de este contrato es de "),
      t("TRES AÑOS", true),
      t(" a partir del "),
      val(data.contratoDesde, 24),
      t(" Y HASTA "),
      val(data.contratoHasta, 24),
      t("."),
    ],
    [t("QUINTA.- ", true), t("Queda prohibido el sub-arriendo.")],
    [
      t("SÉTIMA: ", true),
      t(
        "Agrega el arrendatario que este apartamento casa será únicamente utilizada como casa de habitación, no pudiendo dedicarla a negocios comercial o ninguna otra actividad distinta a la habitacional."
      ),
    ],
    [
      t("OCTAVA: ", true),
      t(
        "El costo de los servicios de agua y electricidad se encuentra incluido en el precio del alquiler, por lo que la arrendataria se compromete a hacer un uso adecuado y racional de los mismos."
      ),
    ],
    [
      t("NOVENA: ", true),
      t(
        "Una vez transcurrido el plazo de este contrato deberá celebrarse uno nuevo contrato donde se negociaran nuevo plazo y nuevo precio."
      ),
    ],
    [
      t("DECIMA: ", true),
      t(
        "El arrendante se reserva el derecho de realizar inspecciones a la propiedad cada vez que lo estime conveniente, previa comunicación o aviso al arrendatario."
      ),
    ],
    [
      t("DECIMA PRIMERA: ", true),
      t("El inquilino ha cancelado la suma de "),
      money(data.depositoGarantia),
      t(
        " como deposito de garantía, dinero que será devuelto al finalizar el presente contrato, siempre y cuando demuestra estar al día el pago de alquileres correspondientes y el buen estado de apartamento."
      ),
    ],
    [
      t("DECIMO SEGUNDA; ", true),
      t(
        "El inquilino se compromete a dar aviso al propietario de cualquier desperfecto o daño del inmueble que deba ser reparado lo más pronto posible para evitar gastos mayores."
      ),
    ],
    [
      t("DECIMA TERCERA: ", true),
      t(
        "Cualquier daño o pérdida del inmueble que se causare por negligencia, imprudencia, impericia del INQUILINO, será responsabilidad de éste y deberá reparar los daños causados. Queda liberado de los daños causados por terceros con mano criminal, caso fortuito y fuerza mayor."
      ),
    ],
  ];

  clausulas.forEach(drawParagraph);

  // Cierre.
  drawParagraph([
    t(
      "Estando ambos conformes con lo anteriormente manifestado, firmamos en San Isidro de Pérez Zeledón, el "
    ),
    val(data.fechaFirma, 30),
    t("."),
  ]);

  // Firmas.
  ensureSpace(90);
  y -= 50;
  const lineWidth = 200;
  const leftCenter = margin + lineWidth / 2;
  const rightCenter = width - margin - lineWidth / 2;
  page.drawLine({
    start: { x: margin, y },
    end: { x: margin + lineWidth, y },
    thickness: 1,
  });
  page.drawLine({
    start: { x: width - margin - lineWidth, y },
    end: { x: width - margin, y },
    thickness: 1,
  });

  // Texto centrado bajo cada línea de firma.
  const centered = (
    text: string,
    cx: number,
    yy: number,
    f = font,
    size = fontSize
  ) =>
    page.drawText(text, {
      x: cx - f.widthOfTextAtSize(text, size) / 2,
      y: yy,
      size,
      font: f,
    });

  // Arrendante: el dueño que da en alquiler (Fermín Ávila Mora). Su nombre va
  // bajo la etiqueta para evitar confusión con el arrendatario (el inquilino).
  centered("Arrendante", leftCenter, y - 15);
  centered("FERMIN AVILA MORA", leftCenter, y - 15 - lineGap, fontBold);
  centered("Arrendatario (a)", rightCenter, y - 15);

  const bytes = await pdf.save();
  const fileApto =
    String(data.aptoNumero ?? "").replace(/[^a-zA-Z0-9_-]/g, "") || "contrato";

  return new Response(bytes, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="contrato_${fileApto}.pdf"`,
    },
  });
}
