"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, Zap, Wrench, TrendingDown } from "lucide-react";
import type { ExpenseStatistics } from "@/lib/types/forms";
import { formatCurrency } from "@/lib/utils";

interface StatisticsCardsProps {
  statistics: ExpenseStatistics;
}

export function StatisticsCards({ statistics }: StatisticsCardsProps) {
  const isPositiveChange = statistics.cambioMesAnterior >= 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="transition-all hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Gastos del Mes</CardTitle>
          <div className="flex size-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
            <Calendar className="size-5 text-blue-600 dark:text-blue-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(statistics.totalMesActual)}</div>
          <div className="mt-2 flex items-center gap-2 text-xs">
            {isPositiveChange ? (
              <TrendingUp className="size-4 text-green-600" />
            ) : (
              <TrendingDown className="size-4 text-red-600" />
            )}
            <span className={isPositiveChange ? "text-green-600" : "text-red-600"}>
              {Math.abs(statistics.cambioMesAnterior).toFixed(1)}%
            </span>
            <span className="text-muted-foreground">vs mes anterior</span>
          </div>
        </CardContent>
      </Card>

      <Card className="transition-all hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Gastos del Año</CardTitle>
          <div className="flex size-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20">
            <TrendingUp className="size-5 text-purple-600 dark:text-purple-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(statistics.totalAnioActual)}</div>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {statistics.totalTransacciones} transacciones
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="transition-all hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Gastos por Servicios</CardTitle>
          <div className="flex size-10 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-900/20">
            <Zap className="size-5 text-cyan-600 dark:text-cyan-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statistics.porcentajeServicios.toFixed(1)}%</div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">del total</span>
            <Badge variant="outline" className="text-xs">
              {statistics.cantidadServicios} gastos
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="transition-all hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Gastos por Mantenimiento</CardTitle>
          <div className="flex size-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
            <Wrench className="size-5 text-orange-600 dark:text-orange-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statistics.porcentajeMantenimiento.toFixed(1)}%</div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">del total</span>
            <Badge variant="outline" className="text-xs">
              {statistics.cantidadMantenimiento} gastos
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
