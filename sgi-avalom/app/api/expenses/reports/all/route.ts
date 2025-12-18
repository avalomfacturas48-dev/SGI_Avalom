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
      const fechaDesde = searchParams.get("fechaDesde");
      const fechaHasta = searchParams.get("fechaHasta");

      // Construir filtros de fecha
      const fromDate = fechaDesde ? new Date(fechaDesde) : undefined;
      const toDate = fechaHasta ? new Date(fechaHasta) : undefined;

      if (!fromDate || !toDate) {
        return new Response(
          JSON.stringify({ error: "fechaDesde y fechaHasta son requeridos" }),
          { status: 400 }
        );
      }

      // Obtener todos los gastos (servicios y mantenimientos) activos
      const where: any = {
        gas_estado: "A", // Solo activos, no anulados
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
          gas_fecha: "asc", // Ordenar por fecha ascendente
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

      const colWidths = [70, 80, 100, 120, 80, 80, 90, 90, 90];
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
      page.drawText("REPORTE GENERAL DE GASTOS", {
        x: marginX,
        y: cursorY + 20,
        size: 18,
        font: helveticaBold,
        color: rgb(0, 0, 0),
      });

      // Rango de fechas
      const fromLabel = formatInTimeZone(fromDate, "UTC", "dd/MM/yyyy", {
        locale: es,
      });
      const toLabel = formatInTimeZone(toDate, "UTC", "dd/MM/yyyy", {
        locale: es,
      });
      page.drawText(`Período: ${fromLabel} a ${toLabel}`, {
        x: marginX,
        y: cursorY - 10,
        size: 12,
        font: helveticaBold,
        color: rgb(0.2, 0.2, 0.2),
      });

      cursorY -= 40;

      // Cabecera tabla
      page.drawLine({
        start: { x: marginX - 10, y: cursorY + 10 },
        end: { x: marginX - 10 + tableWidth + 20, y: cursorY + 10 },
        thickness: 2,
        color: rgb(0, 0, 0),
      });

      const headers = [
        "Fecha",
        "Tipo",
        "Servicio",
        "Concepto",
        "Edificio",
        "Propiedad",
        "Método Pago",
        "Referencia",
        "Monto",
      ];
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
        thickness: 2,
        color: rgb(0, 0, 0),
      });

      cursorY -= rowH + 10;

      let total = 0;
      let totalServicios = 0;
      let totalMantenimientos = 0;
      let countServicios = 0;
      let countMantenimientos = 0;

      // Agrupar gastos por edificio (guardando también la info del edificio)
      type EdificioInfo = {
        nombre: string;
        descripcion?: string | null;
        direccion?: string | null;
        codigopostal?: string | null;
      };
      
      const gastosPorEdificio = new Map<string, { gastos: typeof gastos; info: EdificioInfo }>();
      
      for (const gasto of gastos) {
        const edificio = gasto.ava_edificio || gasto.ava_propiedad?.ava_edificio;
        const edificioNombre =
          edificio?.edi_identificador ||
          "Sin edificio";
        
        if (!gastosPorEdificio.has(edificioNombre)) {
          gastosPorEdificio.set(edificioNombre, {
            gastos: [],
            info: {
              nombre: edificioNombre,
              descripcion: edificio?.edi_descripcion || null,
              direccion: edificio?.edi_direccion || null,
              codigopostal: edificio?.edi_codigopostal || null,
            },
          });
        }
        gastosPorEdificio.get(edificioNombre)!.gastos.push(gasto);
      }

      // Ordenar edificios por nombre
      const edificiosOrdenados = Array.from(gastosPorEdificio.keys()).sort();

      // Filas de datos agrupadas por edificio
      for (const edificioNombre of edificiosOrdenados) {
        const { gastos: gastosEdificio, info: edificioInfo } = gastosPorEdificio.get(edificioNombre)!;
        
        // Título del edificio con información completa
        if (cursorY < 120) {
          page = pdf.addPage(A4);
          cursorY = marginTop;
        }
        
        page.drawText(`EDIFICIO: ${edificioInfo.nombre}`, {
          x: marginX,
          y: cursorY,
          size: 12,
          font: helveticaBold,
          color: rgb(0, 0.3, 0.6),
        });
        cursorY -= rowH + 5;
        
        // Información adicional del edificio
        if (edificioInfo.descripcion) {
          page.drawText(`Descripción: ${edificioInfo.descripcion}`, {
            x: marginX + 20,
            y: cursorY,
            size: 10,
            font: helvetica,
            color: rgb(0.3, 0.3, 0.3),
          });
          cursorY -= rowH;
        }
        
        if (edificioInfo.direccion) {
          page.drawText(`Dirección: ${edificioInfo.direccion}`, {
            x: marginX + 20,
            y: cursorY,
            size: 10,
            font: helvetica,
            color: rgb(0.3, 0.3, 0.3),
          });
          cursorY -= rowH;
        }
        
        if (edificioInfo.codigopostal) {
          page.drawText(`Código postal: ${edificioInfo.codigopostal}`, {
            x: marginX + 20,
            y: cursorY,
            size: 10,
            font: helvetica,
            color: rgb(0.3, 0.3, 0.3),
          });
          cursorY -= rowH;
        }
        
        cursorY -= 5; // Espacio antes de la tabla

        for (const gasto of gastosEdificio) {
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
        const tipo = gasto.gas_tipo === "S" ? "Servicio" : "Mantenimiento";
        const servicio =
          gasto.gas_tipo === "S"
            ? gasto.ava_servicio?.ser_nombre || "—"
            : "—";
        const concepto = gasto.gas_concepto || "—";
        const edificioNombre =
          gasto.ava_edificio?.edi_identificador ||
          gasto.ava_propiedad?.ava_edificio?.edi_identificador ||
          "—";
        const propiedad = gasto.ava_propiedad?.prop_identificador || "—";
        const metodoPago = gasto.gas_metodopago || "—";
        const referencia = gasto.gas_referencia || "—";
        const monto = `CRC ${Number(gasto.gas_monto).toLocaleString("es-CR")}`;

        total += Number(gasto.gas_monto);
        if (gasto.gas_tipo === "S") {
          totalServicios += Number(gasto.gas_monto);
          countServicios++;
        } else {
          totalMantenimientos += Number(gasto.gas_monto);
          countMantenimientos++;
        }

        const row = [
          fecha,
          tipo,
          servicio,
          concepto,
          edificioNombre,
          propiedad,
          metodoPago,
          referencia,
          monto,
        ];

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
        
        // Línea separadora entre edificios
        if (cursorY < 100) {
          page = pdf.addPage(A4);
          cursorY = marginTop;
        }
        page.drawLine({
          start: { x: marginX - 10, y: cursorY + 5 },
          end: { x: marginX - 10 + tableWidth + 20, y: cursorY + 5 },
          thickness: 1,
          color: rgb(0.5, 0.5, 0.5),
        });
        cursorY -= 10;
      }

      // Línea final
      if (cursorY < 120) {
        page = pdf.addPage(A4);
        cursorY = marginTop;
      }

      page.drawLine({
        start: { x: marginX - 10, y: cursorY + 10 },
        end: { x: marginX - 10 + tableWidth + 20, y: cursorY + 10 },
        thickness: 2,
        color: rgb(0, 0, 0),
      });

      cursorY -= 30;

      // Resumen detallado
      page.drawText("RESUMEN", {
        x: marginX,
        y: cursorY,
        size: 12,
        font: helveticaBold,
        color: rgb(0, 0, 0),
      });

      cursorY -= 20;

      page.drawText(
        `Total de gastos de servicios: ${countServicios} - Monto: CRC ${totalServicios.toLocaleString("es-CR")}`,
        {
          x: marginX,
          y: cursorY,
          size: 10,
          font: helvetica,
          color: rgb(0.2, 0.2, 0.2),
        }
      );

      cursorY -= 18;

      page.drawText(
        `Total de gastos de mantenimiento: ${countMantenimientos} - Monto: CRC ${totalMantenimientos.toLocaleString("es-CR")}`,
        {
          x: marginX,
          y: cursorY,
          size: 10,
          font: helvetica,
          color: rgb(0.2, 0.2, 0.2),
        }
      );

      cursorY -= 18;

      page.drawText(`Total de gastos: ${gastos.length}`, {
        x: marginX,
        y: cursorY,
        size: 10,
        font: helvetica,
        color: rgb(0.2, 0.2, 0.2),
      });

      cursorY -= 25;

      // Total general destacado
      page.drawRectangle({
        x: marginX - 10,
        y: cursorY - 15,
        width: tableWidth + 20,
        height: 30,
        color: rgb(0.9, 0.9, 0.9),
      });

      page.drawText(`TOTAL GENERAL: CRC ${total.toLocaleString("es-CR")}`, {
        x: marginX,
        y: cursorY,
        size: 16,
        font: helveticaBold,
        color: rgb(0, 0, 0),
      });

      // Finalizar PDF
      const pdfBytes = await pdf.save();
      const filename = `Reporte_General_Gastos_${fromLabel.replace(/\//g, "-")}_a_${toLabel.replace(/\//g, "-")}.pdf`
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
      console.error("Error generando reporte general de gastos:", error);
      return new Response(
        JSON.stringify({ error: "Error interno del servidor" }),
        { status: 500 }
      );
    }
  })(req, new NextResponse());
}

