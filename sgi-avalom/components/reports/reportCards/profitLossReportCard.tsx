"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { TrendingUp, Download, Loader2 } from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import type { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { useExpenseReportGenerator } from "@/hooks/reports/useExpenseReportGenerator";
import { useToast } from "@/hooks/use-toast";

export function ProfitLossReportCard() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const { loading, generateExpenseReport } = useExpenseReportGenerator();
  const { toast } = useToast();

  const handleGenerateReport = async () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast({
        title: "Error",
        description: "Debe seleccionar un rango de fechas",
        variant: "destructive",
      });
      return;
    }

    const options = {
      fechaDesde: format(dateRange.from, "yyyy-MM-dd"),
      fechaHasta: format(dateRange.to, "yyyy-MM-dd"),
    };

    const filename = `reporte_ganancias_perdidas_${format(new Date(), "yyyy-MM-dd")}.pdf`;
    await generateExpenseReport("profit-loss", filename, options);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow border-2">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Reporte Contable - Ganancias/Pérdidas
        </CardTitle>
        <CardDescription>
          Reporte ejecutivo con análisis completo de ingresos, gastos y rentabilidad
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div className="space-y-2">
          <Label>
            Rango de fechas <span className="text-red-500">*</span>
          </Label>
          <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
        </div>
        
        <div className="rounded-lg bg-muted/50 p-4 space-y-2">
          <p className="text-sm font-semibold text-primary">Incluye:</p>
          <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
            <li>Resumen ejecutivo con KPIs principales</li>
            <li>Serie mensual de ingresos y gastos</li>
            <li>Ranking de edificios por ganancia</li>
            <li>Ranking de propiedades más rentables</li>
            <li>Distribución de gastos por tipo</li>
            <li>Insights y alertas automáticas</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleGenerateReport}
          disabled={loading || !dateRange?.from || !dateRange?.to}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generando...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Generar Reporte Ejecutivo
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

