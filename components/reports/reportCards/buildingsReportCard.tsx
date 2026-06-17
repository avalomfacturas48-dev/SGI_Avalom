"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Building, Download, Loader2 } from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import type { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { useReportGenerator } from "@/hooks/reports/useReportGenerator";

export function BuildingsReportCard() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const { loading, generateReport } = useReportGenerator();

  const handleGenerateReport = async () => {
    const filename = `reporte_edificios_${format(new Date(), "yyyy-MM-dd")}.pdf`;
    await generateReport("/api/export-buildings", filename, { dateRange });
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5 text-primary" />
          Reporte de Edificios y Propiedades
        </CardTitle>
        <CardDescription>Genera un reporte completo de edificios, propiedades y mensualidades</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Rango de fechas (opcional)</Label>
          <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleGenerateReport} disabled={loading} className="w-full">
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
