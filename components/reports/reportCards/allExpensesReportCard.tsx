"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Receipt, Download, Loader2 } from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import type { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { useExpenseReportGenerator } from "@/hooks/reports/useExpenseReportGenerator";
import { toast } from "sonner";

export function AllExpensesReportCard() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const { loading, generateExpenseReport } = useExpenseReportGenerator();

  const handleGenerateReport = async () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast.error("Debe seleccionar un rango de fechas");
      return;
    }

    const options = {
      fechaDesde: format(dateRange.from, "yyyy-MM-dd"),
      fechaHasta: format(dateRange.to, "yyyy-MM-dd"),
    };

    const filename = `reporte_gastos_general_${format(new Date(), "yyyy-MM-dd")}.pdf`;
    await generateExpenseReport("all", filename, options);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary" />
          Reporte General de Gastos
        </CardTitle>
        <CardDescription>
          Reporte completo de todos los gastos (servicios y mantenimientos) en un rango de fechas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>
            Rango de fechas <span className="text-red-500">*</span>
          </Label>
          <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
          <p className="text-xs text-muted-foreground">
            Este reporte incluye todos los edificios y propiedades
          </p>
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
              Generar Reporte
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

