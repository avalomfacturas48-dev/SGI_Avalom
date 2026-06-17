"use client";

import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, TrendingUp, Zap, Wrench, TrendingDown, DollarSign } from "lucide-react";
import type { ExpenseStatistics } from "@/lib/types/forms";
import { formatCurrency } from "@/lib/utils";

interface StatisticsCardsProps {
  statistics: ExpenseStatistics;
}

export const StatisticsCards = memo(function StatisticsCards({ statistics }: StatisticsCardsProps) {
  const isPositiveChange = statistics.cambioMesAnterior >= 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="overflow-hidden transition-all hover:shadow-lg animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '0ms' }}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Gastos del Mes</CardTitle>
          <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/50">
            <Calendar className="size-5 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
            {formatCurrency(statistics.totalMesActual)}
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs">
            {isPositiveChange ? (
              <TrendingUp className="size-4 text-green-600 animate-pulse" />
            ) : (
              <TrendingDown className="size-4 text-red-600 animate-pulse" />
            )}
            <Badge variant={isPositiveChange ? "default" : "destructive"} className="text-xs">
              {Math.abs(statistics.cambioMesAnterior).toFixed(1)}%
            </Badge>
            <span className="text-muted-foreground">vs mes anterior</span>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden transition-all hover:shadow-lg animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '100ms' }}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Gastos del Año</CardTitle>
          <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/50">
            <DollarSign className="size-5 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
            {formatCurrency(statistics.totalAnioActual)}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="secondary" className="text-xs font-semibold">
              {statistics.totalTransacciones} transacciones
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden transition-all hover:shadow-lg animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '200ms' }}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Gastos por Servicios</CardTitle>
          <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-lg shadow-cyan-500/50">
            <Zap className="size-5 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-cyan-500 bg-clip-text text-transparent">
            {statistics.porcentajeServicios.toFixed(1)}%
          </div>
          <div className="mt-3 space-y-2">
            <Progress value={statistics.porcentajeServicios} className="h-2" />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">del total</span>
              <Badge variant="outline" className="text-xs">
                {statistics.cantidadServicios} gastos
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden transition-all hover:shadow-lg animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '300ms' }}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Gastos por Mantenimiento</CardTitle>
          <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/50">
            <Wrench className="size-5 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
            {statistics.porcentajeMantenimiento.toFixed(1)}%
          </div>
          <div className="mt-3 space-y-2">
            <Progress value={statistics.porcentajeMantenimiento} className="h-2" />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">del total</span>
              <Badge variant="outline" className="text-xs">
                {statistics.cantidadMantenimiento} gastos
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
