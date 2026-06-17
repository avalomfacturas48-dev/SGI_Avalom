import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";

export async function GET(request: NextRequest) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      // Obtener todos los gastos activos para calcular estadísticas
      const gastos = await prisma.ava_gasto.findMany({
        where: {
          gas_estado: "A", // Solo gastos activos
        },
        select: {
          gas_monto: true,
          gas_fecha: true,
          gas_tipo: true,
          gas_estado: true,
        },
      });

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      // Tipo para los gastos seleccionados
      type GastoSeleccionado = {
        gas_monto: bigint;
        gas_fecha: Date;
        gas_tipo: string;
        gas_estado: string;
      };

      const gastosActivos: GastoSeleccionado[] = gastos.filter(
        (g: GastoSeleccionado) => g.gas_estado === "A"
      );

      const mesActualGastos = gastosActivos.filter((g: GastoSeleccionado) => {
        const fecha = new Date(g.gas_fecha);
        return (
          fecha.getMonth() === currentMonth &&
          fecha.getFullYear() === currentYear
        );
      });

      const mesAnteriorGastos = gastosActivos.filter((g: GastoSeleccionado) => {
        const fecha = new Date(g.gas_fecha);
        return (
          fecha.getMonth() === lastMonth &&
          fecha.getFullYear() === lastMonthYear
        );
      });

      const anioActualGastos = gastosActivos.filter((g: GastoSeleccionado) => {
        const fecha = new Date(g.gas_fecha);
        return fecha.getFullYear() === currentYear;
      });

      const totalMesActual = mesActualGastos.reduce(
        (sum: number, g: GastoSeleccionado) => sum + Number(g.gas_monto),
        0
      );
      const totalMesAnterior = mesAnteriorGastos.reduce(
        (sum: number, g: GastoSeleccionado) => sum + Number(g.gas_monto),
        0
      );
      const totalAnioActual = anioActualGastos.reduce(
        (sum: number, g: GastoSeleccionado) => sum + Number(g.gas_monto),
        0
      );

      const servicios = gastosActivos.filter((g: GastoSeleccionado) => g.gas_tipo === "S");
      const mantenimientos = gastosActivos.filter((g: GastoSeleccionado) => g.gas_tipo === "M");

      const cambioMesAnterior =
        totalMesAnterior > 0
          ? ((totalMesActual - totalMesAnterior) / totalMesAnterior) * 100
          : 0;

      const statistics = {
        totalMesActual: totalMesActual.toString(),
        totalAnioActual: totalAnioActual.toString(),
        totalTransacciones: gastosActivos.length,
        porcentajeServicios:
          gastosActivos.length > 0
            ? (servicios.length / gastosActivos.length) * 100
            : 0,
        porcentajeMantenimiento:
          gastosActivos.length > 0
            ? (mantenimientos.length / gastosActivos.length) * 100
            : 0,
        cantidadServicios: servicios.length,
        cantidadMantenimiento: mantenimientos.length,
        cambioMesAnterior,
      };

      return NextResponse.json(
        {
          success: true,
          data: statistics,
        },
        { status: 200 }
      );
    } catch (error: any) {
      console.error("Error al calcular estadísticas:", error?.message || error);
      return NextResponse.json(
        {
          success: false,
          error: "Error al calcular las estadísticas",
        },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
