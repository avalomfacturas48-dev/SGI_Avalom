import { NextRequest } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { prisma } from "@/lib/prisma";
import { es } from "date-fns/locale";
import { formatInTimeZone } from "date-fns-tz";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const fromDate = from ? new Date(`${from}-01T00:00:00.000Z`) : undefined;

  let toDate: Date | undefined = undefined;
  if (to) {
    const nextMonth = new Date(`${to}-01T00:00:00.000Z`);
    nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);
    toDate = new Date(nextMonth.getTime() - 1);
  }

  const esRango = Boolean(fromDate || toDate);
  const fechaGeneracion = new Date();

  // ============================================
  // 1. Obtener pagos activos (no depósitos) en el rango
  // ============================================
  const whereClause: any = {
    pag_estado: "A",
    alqm_id: { not: null },
    depo_id: null,
  };

  if (fromDate || toDate) {
    whereClause.pag_fechapago = {};
    if (fromDate) whereClause.pag_fechapago.gte = fromDate;
    if (toDate) whereClause.pag_fechapago.lte = toDate;
  }

  const pagos = await prisma.ava_pago.findMany({
    where: whereClause,
    include: {
      ava_alquilermensual: {
        include: {
          ava_alquiler: {
            include: {
              ava_clientexalquiler: { include: { ava_cliente: true } },
              ava_propiedad: {
                include: {
                  ava_tipopropiedad: true,
                  ava_edificio: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { pag_fechapago: "asc" },
  });

  // ============================================
  // 2. Obtener estructura de edificios/propiedades
  // ============================================
  const edificios = await prisma.ava_edificio.findMany({
    orderBy: { edi_identificador: "asc" },
    include: {
      ava_propiedad: {
        orderBy: { prop_identificador: "asc" },
        include: {
          ava_tipopropiedad: true,
          ava_alquiler: true,
        },
      },
    },
  });

  // ============================================
  // 3. Agrupar pagos por propiedad
  // ============================================
  type PaymentRow = {
    pag_fechapago: Date;
    pag_monto: number;
    pag_metodopago: string | null;
    pag_referencia: string | null;
    alqm_fechainicio: Date;
    alqm_fechafin: Date;
    clienteNombre: string;
    estadoAlquiler: string;
  };

  const pagosPorPropiedad = new Map<string, PaymentRow[]>();

  pagos.forEach((pago) => {
    const mens = pago.ava_alquilermensual;
    if (!mens?.ava_alquiler?.ava_propiedad) return;

    const propId = mens.ava_alquiler.ava_propiedad.prop_id.toString();
    const cliente = mens.ava_alquiler.ava_clientexalquiler[0]?.ava_cliente;

    const row: PaymentRow = {
      pag_fechapago: pago.pag_fechapago,
      pag_monto: Number(pago.pag_monto),
      pag_metodopago: pago.pag_metodopago,
      pag_referencia: pago.pag_referencia,
      alqm_fechainicio: mens.alqm_fechainicio,
      alqm_fechafin: mens.alqm_fechafin,
      clienteNombre: cliente
        ? `${cliente.cli_nombre} ${cliente.cli_papellido}`
        : "—",
      estadoAlquiler: mens.ava_alquiler.alq_estado,
    };

    if (!pagosPorPropiedad.has(propId)) {
      pagosPorPropiedad.set(propId, []);
    }
    pagosPorPropiedad.get(propId)!.push(row);
  });

  // ============================================
  // 4. Calcular estadísticas generales
  // ============================================
  const totalEdificios = edificios.length;
  const totalPropiedades = edificios.reduce(
    (sum, ed) => sum + ed.ava_propiedad.length,
    0
  );
  const propiedadesOcupadas = edificios.reduce(
    (sum, ed) =>
      sum +
      ed.ava_propiedad.filter((p) =>
        p.ava_alquiler.some((a) => a.alq_estado === "A")
      ).length,
    0
  );
  const tasaOcupacion =
    totalPropiedades > 0
      ? ((propiedadesOcupadas / totalPropiedades) * 100).toFixed(1)
      : "0.0";

  const totalPagado = pagos.reduce((sum, p) => sum + Number(p.pag_monto), 0);
  const cantidadPagos = pagos.length;

  // ============================================
  // 5. Generar PDF
  // ============================================
  const pdf = await PDFDocument.create();
  const helvetica = await pdf.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const A4: [number, number] = [841.89, 595.28]; // A4 landscape
  const marginX = 50;
  const marginTop = A4[1] - 50;
  const rowH = 18;

  // Columnas: Fecha Pago | Período Alq. | Cliente | Estado Alq. | Monto | Método
  const colWidths = [80, 100, 140, 70, 90, 90];
  const colXs = colWidths.reduce<number[]>(
    (acc, w, i) =>
      i === 0 ? [marginX] : [...acc, acc[i - 1] + colWidths[i - 1]],
    []
  );
  const tableWidth = colWidths.reduce((a, b) => a + b, 0);

  let page = pdf.addPage(A4);
  let cursorY = marginTop;

  // Título principal
  page.drawText(
    esRango
      ? "REPORTE CONTABLE DE EDIFICIOS - POR RANGO"
      : "REPORTE CONTABLE DE EDIFICIOS - TOTAL",
    {
      x: marginX,
      y: cursorY + 20,
      size: 16,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    }
  );

  // Fecha de generación
  const fechaGenStr = formatInTimeZone(
    fechaGeneracion,
    "America/Costa_Rica",
    "PPpp",
    { locale: es }
  );
  page.drawText(`Generado: ${fechaGenStr}`, {
    x: marginX,
    y: cursorY,
    size: 9,
    font: helvetica,
    color: rgb(0.3, 0.3, 0.3),
  });

  cursorY -= 20;

  // Subtítulo de fechas si hay rango
  if (esRango && fromDate && toDate) {
    const fromLabel = fromDate
      ? formatInTimeZone(fromDate, "UTC", "MMMM yyyy", { locale: es })
      : "";
    const toLabel = toDate
      ? formatInTimeZone(toDate, "UTC", "MMMM yyyy", { locale: es })
      : "";
    page.drawText(`Período: ${fromLabel} a ${toLabel}`, {
      x: marginX,
      y: cursorY,
      size: 11,
      font: helvetica,
    });
    cursorY -= 25;
  } else {
    cursorY -= 10;
  }

  // Sección de estadísticas generales
  page.drawRectangle({
    x: marginX - 10,
    y: cursorY - 80,
    width: tableWidth + 20,
    height: 85,
    color: rgb(0.95, 0.95, 0.95),
    borderColor: rgb(0.7, 0.7, 0.7),
    borderWidth: 1,
  });

  page.drawText("RESUMEN EJECUTIVO", {
    x: marginX,
    y: cursorY - 15,
    size: 13,
    font: helveticaBold,
    color: rgb(0, 0.3, 0.6),
  });

  cursorY -= 35;

  const estadisticas = [
    `Total de Edificios: ${totalEdificios}`,
    `Total de Propiedades: ${totalPropiedades}`,
    `Propiedades Ocupadas: ${propiedadesOcupadas}`,
    `Tasa de Ocupación: ${tasaOcupacion}%`,
    `Total Pagado: CRC ${totalPagado.toLocaleString("es-CR")}`,
    `Cantidad de Pagos: ${cantidadPagos}`,
  ];

  const colGap = 200;
  estadisticas.forEach((stat, i) => {
    const x = marginX + (i % 3) * colGap;
    const y = cursorY - Math.floor(i / 3) * 20;
    page.drawText(stat, {
      x,
      y,
      size: 10,
      font: helvetica,
      color: rgb(0, 0, 0),
    });
  });

  cursorY -= 90;

  let grandTotalPagado = 0;

  // ============================================
  // 6. Iterar por edificios
  // ============================================
  for (const ed of edificios) {
    // Verificar si este edificio tiene alguna propiedad con pagos
    const edificioTienePagos = ed.ava_propiedad.some((prop) =>
      pagosPorPropiedad.has(prop.prop_id.toString())
    );

    if (!edificioTienePagos && esRango) {
      continue;
    }

    // Nueva página si es necesario
    if (cursorY < 120) {
      page = pdf.addPage(A4);
      cursorY = marginTop;
    }

    // Encabezado del Edificio
    page.drawRectangle({
      x: marginX - 10,
      y: cursorY - 5,
      width: tableWidth + 20,
      height: 25,
      color: rgb(0, 0.3, 0.6),
    });

    page.drawText(`EDIFICIO: ${ed.edi_identificador}`, {
      x: marginX,
      y: cursorY + 5,
      size: 14,
      font: helveticaBold,
      color: rgb(1, 1, 1),
    });

    cursorY -= 35;

    // Iterar por propiedades del edificio
    for (const prop of ed.ava_propiedad) {
      const propId = prop.prop_id.toString();
      const pagosPropiedad = pagosPorPropiedad.get(propId) || [];
      let subtotalPagado = 0;

      if (cursorY < 100) {
        page = pdf.addPage(A4);
        cursorY = marginTop;
      }

      // Encabezado de la propiedad
      page.drawRectangle({
        x: marginX - 5,
        y: cursorY - 5,
        width: tableWidth + 10,
        height: 20,
        color: rgb(0.85, 0.85, 0.85),
      });

      const tipoPropiedad = prop.ava_tipopropiedad?.tipp_nombre || "—";
      page.drawText(
        `Propiedad: ${prop.prop_identificador} (${tipoPropiedad})`,
        {
          x: marginX,
          y: cursorY,
          size: 12,
          font: helveticaBold,
          color: rgb(0.1, 0.1, 0.1),
        }
      );

      cursorY -= 25;

      // Si no hay pagos, mostrar mensaje
      if (pagosPropiedad.length === 0) {
        page.drawText(
          esRango
            ? "[!] Esta propiedad no tiene pagos en el período seleccionado"
            : "[!] Esta propiedad no tiene pagos registrados",
          {
            x: marginX + 20,
            y: cursorY,
            size: 10,
            font: helvetica,
            color: rgb(0.5, 0.5, 0.5),
          }
        );
        cursorY -= 25;
        continue;
      }

      // Cabecera de tabla
      const headers = [
        "Fecha Pago",
        "Período Alq.",
        "Cliente",
        "Estado Alq.",
        "Monto",
        "Método",
      ];

      headers.forEach((h, i) => {
        page.drawText(h, {
          x: colXs[i],
          y: cursorY,
          size: 10,
          font: helveticaBold,
          color: rgb(0, 0, 0),
        });
      });

      page.drawLine({
        start: { x: marginX - 5, y: cursorY - 2 },
        end: { x: marginX - 5 + tableWidth + 5, y: cursorY - 2 },
        thickness: 0.5,
        color: rgb(0, 0, 0),
      });

      cursorY -= rowH;

      // Imprimir las filas de pagos
      for (const pago of pagosPropiedad) {
        if (cursorY < 60) {
          page = pdf.addPage(A4);
          cursorY = marginTop;
        }

        const fechaPago = formatInTimeZone(
          pago.pag_fechapago,
          "UTC",
          "dd/MM/yyyy",
          { locale: es }
        );

        const periodoInicio = formatInTimeZone(
          pago.alqm_fechainicio,
          "UTC",
          "MMM yyyy",
          { locale: es }
        );
        const periodoFin = formatInTimeZone(
          pago.alqm_fechafin,
          "UTC",
          "MMM yyyy",
          { locale: es }
        );
        const periodo = `${periodoInicio}-${periodoFin}`;

        const estado =
          pago.estadoAlquiler === "A"
            ? "Activo"
            : pago.estadoAlquiler === "F"
            ? "Finalizado"
            : "Cancelado";

        const montoPagado = pago.pag_monto;
        const metodoPago = pago.pag_metodopago || "—";

        subtotalPagado += montoPagado;
        grandTotalPagado += montoPagado;

        const row = [
          fechaPago,
          periodo,
          pago.clienteNombre,
          estado,
          `CRC ${montoPagado.toLocaleString("es-CR")}`,
          metodoPago,
        ];

        row.forEach((text, i) => {
          const fontSize = 9;
          const textColor =
            i === 3 && estado === "Cancelado"
              ? rgb(0.8, 0.4, 0)
              : i === 3 && estado === "Activo"
              ? rgb(0, 0.5, 0)
              : rgb(0, 0, 0);

          page.drawText(text, {
            x: colXs[i],
            y: cursorY,
            size: fontSize,
            font: helvetica,
            color: textColor,
            maxWidth: colWidths[i] - 6,
          });
        });

        page.drawLine({
          start: { x: marginX - 5, y: cursorY - 2 },
          end: { x: marginX - 5 + tableWidth + 5, y: cursorY - 2 },
          thickness: 0.3,
          color: rgb(0.7, 0.7, 0.7),
        });

        cursorY -= rowH;
      }

      // Subtotales de la propiedad
      if (cursorY < 80) {
        page = pdf.addPage(A4);
        cursorY = marginTop;
      }

      // El rectángulo se dibuja completamente por debajo del último row (que quedó en cursorY+rowH)
      // para evitar que tape el último pago de la tabla
      page.drawRectangle({
        x: marginX - 5,
        y: cursorY - 22,
        width: tableWidth + 10,
        height: 22,
        color: rgb(0.95, 0.95, 1),
      });

      page.drawText(
        `Subtotal ${prop.prop_identificador} - Pagado: CRC ${subtotalPagado.toLocaleString(
          "es-CR"
        )} (${pagosPropiedad.length} pago${pagosPropiedad.length !== 1 ? "s" : ""})`,
        {
          x: marginX,
          y: cursorY - 13,
          size: 10,
          font: helveticaBold,
          color: rgb(0, 0.3, 0.6),
        }
      );

      cursorY -= 38;
    }

    // Espacio entre edificios
    cursorY -= 10;
  }

  // ============================================
  // 7. Resumen financiero final
  // ============================================
  if (cursorY < 150) {
    page = pdf.addPage(A4);
    cursorY = marginTop;
  }

  cursorY -= 30;

  // Caja de resumen final
  page.drawRectangle({
    x: marginX - 10,
    y: cursorY - 60,
    width: tableWidth + 20,
    height: 65,
    color: rgb(0.98, 0.98, 1),
    borderColor: rgb(0, 0.3, 0.6),
    borderWidth: 2,
  });

  page.drawText("RESUMEN FINANCIERO", {
    x: marginX,
    y: cursorY - 15,
    size: 14,
    font: helveticaBold,
    color: rgb(0, 0.3, 0.6),
  });

  cursorY -= 40;

  page.drawText(
    `Total Pagado: CRC ${grandTotalPagado.toLocaleString("es-CR")}`,
    {
      x: marginX,
      y: cursorY,
      size: 11,
      font: helveticaBold,
      color: rgb(0, 0.5, 0),
    }
  );

  page.drawText(
    `Cantidad de Pagos: ${cantidadPagos}`,
    {
      x: marginX + 350,
      y: cursorY,
      size: 11,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    }
  );

  // ============================================
  // 8. Guardar y retornar PDF
  // ============================================
  const pdfBytes = await pdf.save();

  const fromLabel = fromDate
    ? formatInTimeZone(fromDate, "UTC", "MMMM-yyyy", { locale: es })
    : "";
  const toLabel = toDate
    ? formatInTimeZone(toDate, "UTC", "MMMM-yyyy", { locale: es })
    : "";

  let filename = "Reporte_edificios.pdf";
  if (from && to) {
    filename = `Reporte_edificios_${fromLabel}_a_${toLabel}.pdf`;
  }
  filename = filename
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_\-\.]/g, "");

  return new Response(new Uint8Array(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
