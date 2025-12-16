"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import { formatCurrency, formatDate } from "@/lib/utils";

interface ExportExpensesProps {
  expenses: any[];
  disabled?: boolean;
}

export function ExportExpenses({ expenses, disabled }: ExportExpensesProps) {
  const handleExport = () => {
    if (!expenses || expenses.length === 0) {
      return;
    }

    // Preparar datos para exportar con formato profesional
    const dataToExport = expenses.map((expense, index) => ({
      "No.": index + 1,
      "ID Gasto": expense.gas_id,
      "Tipo": expense.gas_tipo === "fijo" ? "Fijo" : "Variable",
      "Concepto": expense.gas_concepto,
      "Descripción": expense.gas_descripcion || "N/A",
      "Monto": parseFloat(expense.gas_monto.toString()),
      "Fecha": formatDate(expense.gas_fecha),
      "Estado": 
        expense.gas_estado === "activo" ? "Activo" :
        expense.gas_estado === "anulado" ? "Anulado" : "Inactivo",
      "Método de Pago": 
        expense.gas_metodopago === "efectivo" ? "Efectivo" :
        expense.gas_metodopago === "transferencia" ? "Transferencia" :
        expense.gas_metodopago === "tarjeta" ? "Tarjeta" :
        expense.gas_metodopago === "cheque" ? "Cheque" : "N/A",
      "Cuenta": expense.gas_cuenta || "N/A",
      "Banco": expense.gas_banco || "N/A",
      "Referencia": expense.gas_referencia || "N/A",
      "Edificio": expense.ava_edificio?.edi_identificador || "N/A",
      "Propiedad": expense.ava_propiedad?.prop_identificador || "N/A",
      "Servicio": expense.ava_servicio?.ser_nombre || "N/A",
      "Usuario": expense.ava_usuario 
        ? `${expense.ava_usuario.usu_nombre} ${expense.ava_usuario.usu_papellido}`
        : "N/A",
      "Anulación": expense.ava_anulaciongasto?.[0]?.ang_motivo || "N/A",
    }));

    // Calcular totales y estadísticas
    const totalGastos = expenses.length;
    const totalMonto = expenses
      .filter(e => e.gas_estado === "activo")
      .reduce((sum, e) => sum + parseFloat(e.gas_monto.toString()), 0);
    const gastosActivos = expenses.filter(e => e.gas_estado === "activo").length;
    const gastosAnulados = expenses.filter(e => e.gas_estado === "anulado").length;
    const gastosFijos = expenses.filter(e => e.gas_tipo === "fijo").length;
    const gastosVariables = expenses.filter(e => e.gas_tipo === "variable").length;

    // Crear el libro de Excel
    const wb = XLSX.utils.book_new();

    // Hoja 1: Resumen Ejecutivo
    const summaryData = [
      ["REPORTE DE GASTOS - SISTEMA AVALOM"],
      ["Fecha de Generación:", new Date().toLocaleDateString("es-CR", { 
        year: "numeric", 
        month: "long", 
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })],
      [],
      ["RESUMEN GENERAL"],
      ["Total de Gastos:", totalGastos],
      ["Monto Total (Activos):", totalMonto],
      ["Gastos Activos:", gastosActivos],
      ["Gastos Anulados:", gastosAnulados],
      [],
      ["DISTRIBUCIÓN POR TIPO"],
      ["Gastos Fijos:", gastosFijos],
      ["Gastos Variables:", gastosVariables],
      [],
      ["DISTRIBUCIÓN POR MÉTODO DE PAGO"],
      ["Efectivo:", expenses.filter(e => e.gas_metodopago === "efectivo" && e.gas_estado === "activo").length],
      ["Transferencia:", expenses.filter(e => e.gas_metodopago === "transferencia" && e.gas_estado === "activo").length],
      ["Tarjeta:", expenses.filter(e => e.gas_metodopago === "tarjeta" && e.gas_estado === "activo").length],
      ["Cheque:", expenses.filter(e => e.gas_metodopago === "cheque" && e.gas_estado === "activo").length],
    ];

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Estilo para el resumen
    wsSummary["!cols"] = [
      { wch: 30 },
      { wch: 20 }
    ];

    XLSX.utils.book_append_sheet(wb, wsSummary, "Resumen");

    // Hoja 2: Detalle de Gastos
    const ws = XLSX.utils.json_to_sheet(dataToExport);

    // Configurar anchos de columna
    ws["!cols"] = [
      { wch: 6 },  // No.
      { wch: 10 }, // ID
      { wch: 12 }, // Tipo
      { wch: 25 }, // Concepto
      { wch: 35 }, // Descripción
      { wch: 15 }, // Monto
      { wch: 12 }, // Fecha
      { wch: 10 }, // Estado
      { wch: 15 }, // Método Pago
      { wch: 20 }, // Cuenta
      { wch: 20 }, // Banco
      { wch: 20 }, // Referencia
      { wch: 20 }, // Edificio
      { wch: 20 }, // Propiedad
      { wch: 25 }, // Servicio
      { wch: 25 }, // Usuario
      { wch: 30 }, // Anulación
    ];

    // Aplicar formato de moneda a la columna de Monto
    const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
    for (let row = 1; row <= range.e.r; row++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: 5 }); // Columna F (Monto)
      if (ws[cellAddress] && typeof ws[cellAddress].v === "number") {
        ws[cellAddress].z = "₡#,##0.00";
      }
    }

    XLSX.utils.book_append_sheet(wb, ws, "Detalle de Gastos");

    // Hoja 3: Gastos por Servicio
    const serviceGroups = expenses
      .filter(e => e.gas_estado === "activo" && e.ava_servicio)
      .reduce((acc, expense) => {
        const serviceName = expense.ava_servicio.ser_nombre;
        if (!acc[serviceName]) {
          acc[serviceName] = {
            servicio: serviceName,
            codigo: expense.ava_servicio.ser_codigo,
            cantidad: 0,
            total: 0,
          };
        }
        acc[serviceName].cantidad++;
        acc[serviceName].total += parseFloat(expense.gas_monto.toString());
        return acc;
      }, {} as Record<string, any>);

    const serviceData = Object.values(serviceGroups).map((item: any) => ({
      "Código": item.codigo,
      "Servicio": item.servicio,
      "Cantidad de Gastos": item.cantidad,
      "Monto Total": item.total,
    }));

    if (serviceData.length > 0) {
      const wsServices = XLSX.utils.json_to_sheet(serviceData);
      wsServices["!cols"] = [
        { wch: 15 },
        { wch: 30 },
        { wch: 18 },
        { wch: 15 },
      ];

      // Formato moneda
      const serviceRange = XLSX.utils.decode_range(wsServices["!ref"] || "A1");
      for (let row = 1; row <= serviceRange.e.r; row++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: 3 });
        if (wsServices[cellAddress] && typeof wsServices[cellAddress].v === "number") {
          wsServices[cellAddress].z = "₡#,##0.00";
        }
      }

      XLSX.utils.book_append_sheet(wb, wsServices, "Gastos por Servicio");
    }

    // Hoja 4: Gastos por Edificio
    const buildingGroups = expenses
      .filter(e => e.gas_estado === "activo" && e.ava_edificio)
      .reduce((acc, expense) => {
        const buildingName = expense.ava_edificio.edi_identificador;
        if (!acc[buildingName]) {
          acc[buildingName] = {
            edificio: buildingName,
            cantidad: 0,
            total: 0,
          };
        }
        acc[buildingName].cantidad++;
        acc[buildingName].total += parseFloat(expense.gas_monto.toString());
        return acc;
      }, {} as Record<string, any>);

    const buildingData = Object.values(buildingGroups).map((item: any) => ({
      "Edificio": item.edificio,
      "Cantidad de Gastos": item.cantidad,
      "Monto Total": item.total,
    }));

    if (buildingData.length > 0) {
      const wsBuildings = XLSX.utils.json_to_sheet(buildingData);
      wsBuildings["!cols"] = [
        { wch: 30 },
        { wch: 18 },
        { wch: 15 },
      ];

      // Formato moneda
      const buildingRange = XLSX.utils.decode_range(wsBuildings["!ref"] || "A1");
      for (let row = 1; row <= buildingRange.e.r; row++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: 2 });
        if (wsBuildings[cellAddress] && typeof wsBuildings[cellAddress].v === "number") {
          wsBuildings[cellAddress].z = "₡#,##0.00";
        }
      }

      XLSX.utils.book_append_sheet(wb, wsBuildings, "Gastos por Edificio");
    }

    // Hoja 5: Gastos Anulados
    const canceledExpenses = expenses
      .filter(e => e.gas_estado === "anulado" && e.ava_anulaciongasto?.[0])
      .map((expense, index) => ({
        "No.": index + 1,
        "ID Gasto": expense.gas_id,
        "Concepto": expense.gas_concepto,
        "Monto Original": parseFloat(expense.gas_monto.toString()),
        "Fecha Gasto": formatDate(expense.gas_fecha),
        "Motivo Anulación": expense.ava_anulaciongasto[0].ang_motivo,
        "Descripción Anulación": expense.ava_anulaciongasto[0].ang_descripcion || "N/A",
        "Fecha Anulación": formatDate(expense.ava_anulaciongasto[0].ang_fechaanulacion),
        "Usuario Anulación": expense.ava_anulaciongasto[0].ava_usuario 
          ? `${expense.ava_anulaciongasto[0].ava_usuario.usu_nombre} ${expense.ava_anulaciongasto[0].ava_usuario.usu_papellido}`
          : "N/A",
      }));

    if (canceledExpenses.length > 0) {
      const wsCanceled = XLSX.utils.json_to_sheet(canceledExpenses);
      wsCanceled["!cols"] = [
        { wch: 6 },
        { wch: 10 },
        { wch: 25 },
        { wch: 15 },
        { wch: 12 },
        { wch: 20 },
        { wch: 35 },
        { wch: 15 },
        { wch: 25 },
      ];

      // Formato moneda
      const canceledRange = XLSX.utils.decode_range(wsCanceled["!ref"] || "A1");
      for (let row = 1; row <= canceledRange.e.r; row++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: 3 });
        if (wsCanceled[cellAddress] && typeof wsCanceled[cellAddress].v === "number") {
          wsCanceled[cellAddress].z = "₡#,##0.00";
        }
      }

      XLSX.utils.book_append_sheet(wb, wsCanceled, "Gastos Anulados");
    }

    // Generar nombre de archivo con fecha
    const fileName = `Reporte_Gastos_${new Date().toLocaleDateString("es-CR").replace(/\//g, "-")}.xlsx`;

    // Exportar archivo
    XLSX.writeFile(wb, fileName);
  };

  return (
    <Button
      onClick={handleExport}
      disabled={disabled || !expenses || expenses.length === 0}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <Download className="h-4 w-4" />
      Exportar a Excel
    </Button>
  );
}
