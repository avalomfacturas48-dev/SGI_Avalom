"use client";

import { useMemo } from "react";
import type { AvaGasto } from "@/lib/types/entities";
import type { ExpenseStatistics } from "@/lib/types/forms";

export const useExpenseStatistics = (gastos: AvaGasto[]): ExpenseStatistics => {
  return useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const gastosActivos = gastos.filter((g) => g.gas_estado === "A");

    const mesActualGastos = gastosActivos.filter((g) => {
      const fecha = new Date(g.gas_fecha);
      return fecha.getMonth() === currentMonth && fecha.getFullYear() === currentYear;
    });

    const mesAnteriorGastos = gastosActivos.filter((g) => {
      const fecha = new Date(g.gas_fecha);
      return fecha.getMonth() === lastMonth && fecha.getFullYear() === lastMonthYear;
    });

    const anioActualGastos = gastosActivos.filter((g) => {
      const fecha = new Date(g.gas_fecha);
      return fecha.getFullYear() === currentYear;
    });

    const totalMesActual = mesActualGastos.reduce((sum, g) => sum + parseFloat(g.gas_monto), 0);
    const totalMesAnterior = mesAnteriorGastos.reduce((sum, g) => sum + parseFloat(g.gas_monto), 0);
    const totalAnioActual = anioActualGastos.reduce((sum, g) => sum + parseFloat(g.gas_monto), 0);

    const servicios = gastosActivos.filter((g) => g.gas_tipo === "S");
    const mantenimientos = gastosActivos.filter((g) => g.gas_tipo === "M");

    const cambioMesAnterior =
      totalMesAnterior > 0 ? ((totalMesActual - totalMesAnterior) / totalMesAnterior) * 100 : 0;

    return {
      totalMesActual: totalMesActual.toString(),
      totalAnioActual: totalAnioActual.toString(),
      totalTransacciones: gastosActivos.length,
      porcentajeServicios: gastosActivos.length > 0 ? (servicios.length / gastosActivos.length) * 100 : 0,
      porcentajeMantenimiento: gastosActivos.length > 0 ? (mantenimientos.length / gastosActivos.length) * 100 : 0,
      cantidadServicios: servicios.length,
      cantidadMantenimiento: mantenimientos.length,
      cambioMesAnterior,
    };
  }, [gastos]);
};

