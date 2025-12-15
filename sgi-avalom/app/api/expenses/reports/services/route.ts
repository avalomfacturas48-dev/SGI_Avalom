import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { es } from "date-fns/locale";
import { formatInTimeZone } from "date-fns-tz";

export async function GET(req: NextRequest) {
  return authenticate(async (request: NextRequest, res: NextResponse) => {
    try {
      const { searchParams } = req.nextUrl;
      const edi_id = searchParams.get("edi_id");
      const fechaDesde = searchParams.get("fechaDesde");
      const fechaHasta = searchParams.get("fechaHasta");

      if (!edi_id) {
        return new Response(
          JSON.stringify({ error: "edi_id es requerido" }),
          { status: 400 }
        );
      }

      // Construir filtros de fecha
      const fromDate = fechaDesde ? new Date(fechaDesde) : undefined;
      const toDate = fechaHasta ? new Date(fechaHasta) : undefined;

      // Obtener edificio
      const edificio = await prisma.ava_edificio.findUnique({
        where: { edi_id: BigInt(edi_id) },
      });

      if (!edificio) {
        return new Response(
          JSON.stringify({ error: "Edificio no encontrado" }),
          { status: 404 }
        );
      }

      // Obtener gastos de servicios del edificio
      const where: any = {
        edi_id: BigInt(edi_id),
        gas_tipo: "S", // Solo servicios
        gas_estado: "A", // Solo activos
      };

      if (fromDate || toDate) {
        where.gas_fecha = {};
        if (fromDate) {
          where.gas_fecha.gte = fromDate;
        }
        if (toDate) {
          where.gas_fecha.lte = toDate;
        }
      }

      const gastos = await prisma.ava_gasto.findMany({
        where,
        include: {
          ava_servicio: true,
          ava_propiedad: {
            include: {
              ava_edificio: true,
            },
          },
          ava_edificio: true,
          ava_usuario: true,
        },
        orderBy: {
          gas_fecha: "asc", // Ordenar por fecha ascendente (más antiguos primero)
        },
      });

      // Crear PDF
      const pdf = await PDFDocument.create();
      const helvetica = await pdf.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdf.embedFont(StandardFonts.HelveticaBold);

      const A4: [number, number] = [841.89, 595.28]; // A4 landscape
      const marginX = 50;
      const marginTop = A4[1] - 50;
      const rowH = 18;

      const colWidths = [70, 100, 120, 80, 80, 90, 90, 90];
      const colXs = colWidths.reduce<number[]>(
        (acc, w, i) =>
          i === 0 ? [marginX] : [...acc, acc[i - 1] + colWidths[i - 1]],
        []
      );
      const tableWidth = colWidths.reduce((a, b) => a + b, 0);

      let page = pdf.addPage(A4);
      let cursorY = marginTop;
      
      // Fecha de generación del reporte
      const fechaGeneracion = formatInTimeZone(
        new Date(),
        "UTC",
        "dd/MM/yyyy HH:mm",
        { locale: es }
      );
      page.drawText(`Generado el: ${fechaGeneracion}`, {
        x: A4[0] - 200,
        y: cursorY + 20,
        size: 9,
        font: helvetica,
        color: rgb(0.4, 0.4, 0.4),
      });

      // Título principal
      page.drawText("REPORTE DE GASTOS - SERVICIOS", {
        x: marginX,
        y: cursorY + 20,
        size: 16,
        font: helveticaBold,
        color: rgb(0, 0, 0),
      });

      // Información del edificio
      page.drawText(`Edificio: ${edificio.edi_identificador}`, {
        x: marginX,
        y: cursorY - 10,
        size: 12,
        font: helveticaBold,
        color: rgb(0.2, 0.2, 0.2),
      });

      // Rango de fechas si existe
      if (fromDate || toDate) {
        const fromLabel = fromDate
          ? formatInTimeZone(fromDate, "UTC", "dd/MM/yyyy", { locale: es })
          : "";
        const toLabel = toDate
          ? formatInTimeZone(toDate, "UTC", "dd/MM/yyyy", { locale: es })
          : "";
        page.drawText(`Rango: ${fromLabel} a ${toLabel}`, {
          x: marginX,
          y: cursorY - 30,
          size: 10,
          font: helvetica,
          color: rgb(0.4, 0.4, 0.4),
        });
        cursorY -= 20;
      }

      cursorY -= 40;

      // Cabecera tabla
      page.drawLine({
        start: { x: marginX - 10, y: cursorY + 10 },
        end: { x: marginX - 10 + tableWidth + 20, y: cursorY + 10 },
        thickness: 1,
        color: rgb(0, 0, 0),
      });

      const headers = ["Fecha", "Servicio", "Concepto", "Edificio", "Propiedad", "Método Pago", "Referencia", "Monto"];
      headers.forEach((h, i) => {
        page.drawText(h, {
          x: colXs[i],
          y: cursorY - rowH + 15,
          size: 10,
          font: helveticaBold,
          color: rgb(0, 0, 0),
        });
      });

      page.drawLine({
        start: { x: marginX - 10, y: cursorY - rowH + 10 },
        end: { x: marginX - 10 + tableWidth + 20, y: cursorY - rowH + 10 },
        thickness: 1,
        color: rgb(0, 0, 0),
      });

      cursorY -= rowH + 10;

      let total = 0;

      // Filas de datos
      for (const gasto of gastos) {
        if (cursorY < 80) {
          page = pdf.addPage(A4);
          cursorY = marginTop;
        }

        const fecha = formatInTimeZone(
          new Date(gasto.gas_fecha),
          "UTC",
          "dd/MM/yyyy",
          { locale: es }
        );
        const servicio = gasto.ava_servicio?.ser_nombre || "—";
        const concepto = gasto.gas_concepto || "—";
        const edificioNombre = gasto.ava_edificio?.edi_identificador || gasto.ava_propiedad?.ava_edificio?.edi_identificador || "—";
        const propiedad = gasto.ava_propiedad?.prop_identificador || "—";
        const metodoPago = gasto.gas_metodopago || "—";
        const referencia = gasto.gas_referencia || "—";
        const monto = `CRC ${Number(gasto.gas_monto).toLocaleString("es-CR")}`;

        total += Number(gasto.gas_monto);

        const row = [fecha, servicio, concepto, edificioNombre, propiedad, metodoPago, referencia, monto];

        row.forEach((text, i) => {
          // Truncar texto si es muy largo
          const maxWidth = colWidths[i] - 5;
          let displayText = text;
          if (helvetica.widthOfTextAtSize(text, 9) > maxWidth) {
            while (
              helvetica.widthOfTextAtSize(displayText + "...", 9) > maxWidth &&
              displayText.length > 0
            ) {
              displayText = displayText.slice(0, -1);
            }
            displayText += "...";
          }

          page.drawText(displayText, {
            x: colXs[i],
            y: cursorY,
            size: 9,
            font: helvetica,
            color: rgb(0.1, 0.1, 0.1),
          });
        });

        cursorY -= rowH;
      }

      // Línea final
      if (cursorY < 80) {
        page = pdf.addPage(A4);
        cursorY = marginTop;
      }

      page.drawLine({
        start: { x: marginX - 10, y: cursorY + 10 },
        end: { x: marginX - 10 + tableWidth + 20, y: cursorY + 10 },
        thickness: 1,
        color: rgb(0, 0, 0),
      });

      cursorY -= 20;

      cursorY -= 10;
      
      // Resumen
      page.drawText(`Total de gastos: ${gastos.length}`, {
        x: marginX,
        y: cursorY,
        size: 10,
        font: helvetica,
        color: rgb(0.2, 0.2, 0.2),
      });
      
      cursorY -= 15;
      
      // Total
      page.drawText(`Total: CRC ${total.toLocaleString("es-CR")}`, {
        x: marginX,
        y: cursorY,
        size: 14,
        font: helveticaBold,
        color: rgb(0, 0, 0),
      });

      // Finalizar PDF
      const pdfBytes = await pdf.save();
      const filename = `Reporte_Servicios_${edificio.edi_identificador}_${fechaDesde || ""}_${fechaHasta || ""}.pdf`
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
    } catch (error: any) {
      console.error("Error generando reporte de servicios:", error);
      return new Response(
        JSON.stringify({ error: "Error interno del servidor" }),
        { status: 500 }
      );
    }
  })(req, new NextResponse());
}

