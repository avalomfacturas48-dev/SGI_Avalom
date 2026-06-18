"use client";

import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">

      {/* Gastos del Mes */}
      <Card className="overflow-hidden transition-all hover:shadow-lg animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: "0ms" }}>
        <CardContent className="p-3 sm:p-6">
          {/* Móvil: horizontal */}
          <div className="flex items-center gap-3 sm:hidden">
            <div className="flex-shrink-0 flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/30">
              <Calendar className="size-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Gastos del Mes</p>
              <p className="text-base font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                {formatCurrency(statistics.totalMesActual)}
              </p>
            </div>
            <div className="flex-shrink-0 flex items-center gap-1">
              {isPositiveChange
                ? <TrendingUp className="size-3.5 text-green-600" />
                : <TrendingDown className="size-3.5 text-red-600" />}
              <Badge variant={isPositiveChange ? "default" : "destructive"} className="text-[10px] px-1 h-4">
                {Math.abs(statistics.cambioMesAnterior).toFixed(1)}%
              </Badge>
            </div>
          </div>

          {/* Desktop: vertical */}
          <div className="hidden sm:block">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Gastos del Mes</p>
              <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/30">
                <Calendar className="size-4 text-white" />
              </div>
            </div>
            <p className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              {formatCurrency(statistics.totalMesActual)}
            </p>
            <div className="mt-2 flex items-center gap-2 text-xs">
              {isPositiveChange
                ? <TrendingUp className="size-4 text-green-600 animate-pulse" />
                : <TrendingDown className="size-4 text-red-600 animate-pulse" />}
              <Badge variant={isPositiveChange ? "default" : "destructive"} className="text-xs">
                {Math.abs(statistics.cambioMesAnterior).toFixed(1)}%
              </Badge>
              <span className="text-muted-foreground">vs mes anterior</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gastos del Año */}
      <Card className="overflow-hidden transition-all hover:shadow-lg animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: "100ms" }}>
        <CardContent className="p-3 sm:p-6">
          <div className="flex items-center gap-3 sm:hidden">
            <div className="flex-shrink-0 flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-600 shadow-md shadow-purple-500/30">
              <DollarSign className="size-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Gastos del Año</p>
              <p className="text-base font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
                {formatCurrency(statistics.totalAnioActual)}
              </p>
            </div>
            <Badge variant="secondary" className="flex-shrink-0 text-[10px] px-1 h-4">
              {statistics.totalTransacciones} trx
            </Badge>
          </div>

          <div className="hidden sm:block">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Gastos del Año</p>
              <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-600 shadow-md shadow-purple-500/30">
                <DollarSign className="size-4 text-white" />
              </div>
            </div>
            <p className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
              {formatCurrency(statistics.totalAnioActual)}
            </p>
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs font-semibold">
                {statistics.totalTransacciones} transacciones
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Servicios */}
      <Card className="overflow-hidden transition-all hover:shadow-lg animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: "200ms" }}>
        <CardContent className="p-3 sm:p-6">
          <div className="flex items-center gap-3 sm:hidden">
            <div className="flex-shrink-0 flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-md shadow-cyan-500/30">
              <Zap className="size-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Servicios</p>
              <p className="text-base font-bold bg-gradient-to-r from-cyan-600 to-cyan-500 bg-clip-text text-transparent">
                {statistics.porcentajeServicios.toFixed(1)}%
              </p>
            </div>
            <div className="flex-shrink-0 w-16">
              <Progress value={statistics.porcentajeServicios} className="h-1.5" />
              <p className="text-[10px] text-muted-foreground text-right mt-0.5">{statistics.cantidadServicios} gastos</p>
            </div>
          </div>

          <div className="hidden sm:block">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Gastos por Servicios</p>
              <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-md shadow-cyan-500/30">
                <Zap className="size-4 text-white" />
              </div>
            </div>
            <p className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-cyan-500 bg-clip-text text-transparent">
              {statistics.porcentajeServicios.toFixed(1)}%
            </p>
            <div className="mt-3 space-y-2">
              <Progress value={statistics.porcentajeServicios} className="h-2" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">del total</span>
                <Badge variant="outline" className="text-xs">{statistics.cantidadServicios} gastos</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mantenimiento */}
      <Card className="overflow-hidden transition-all hover:shadow-lg animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: "300ms" }}>
        <CardContent className="p-3 sm:p-6">
          <div className="flex items-center gap-3 sm:hidden">
            <div className="flex-shrink-0 flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 shadow-md shadow-orange-500/30">
              <Wrench className="size-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Mantenimiento</p>
              <p className="text-base font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                {statistics.porcentajeMantenimiento.toFixed(1)}%
              </p>
            </div>
            <div className="flex-shrink-0 w-16">
              <Progress value={statistics.porcentajeMantenimiento} className="h-1.5" />
              <p className="text-[10px] text-muted-foreground text-right mt-0.5">{statistics.cantidadMantenimiento} gastos</p>
            </div>
          </div>

          <div className="hidden sm:block">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Gastos por Mantenimiento</p>
              <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 shadow-md shadow-orange-500/30">
                <Wrench className="size-4 text-white" />
              </div>
            </div>
            <p className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
              {statistics.porcentajeMantenimiento.toFixed(1)}%
            </p>
            <div className="mt-3 space-y-2">
              <Progress value={statistics.porcentajeMantenimiento} className="h-2" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">del total</span>
                <Badge variant="outline" className="text-xs">{statistics.cantidadMantenimiento} gastos</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
});
