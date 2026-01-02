"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Wrench, Download, Loader2 } from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import type { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { useExpenseReportGenerator } from "@/hooks/reports/useExpenseReportGenerator";
import { useBuildings } from "@/hooks/reports/useBuildings";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ServicesReportCard() {
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const { loading: reportLoading, generateExpenseReport } = useExpenseReportGenerator();
  const { buildings, loading: buildingsLoading } = useBuildings();

  const handleGenerateReport = async () => {
    if (!selectedBuildingId) {
      return;
    }

    const options = {
      ediId: selectedBuildingId,
      fechaDesde: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
      fechaHasta: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
    };

    const filename = `reporte_servicios_${format(new Date(), "yyyy-MM-dd")}.pdf`;
    await generateExpenseReport("services", filename, options);
  };

  const isLoading = reportLoading || buildingsLoading;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5 text-primary" />
          Reporte de Gastos - Servicios
        </CardTitle>
        <CardDescription>Reporte detallado de gastos por servicios de un edificio específico</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="building-select-services">
            Seleccione el Edificio <span className="text-red-500">*</span>
          </Label>
          <Select
            value={selectedBuildingId}
            onValueChange={setSelectedBuildingId}
            disabled={buildingsLoading}
          >
            <SelectTrigger id="building-select-services">
              <SelectValue placeholder={buildingsLoading ? "Cargando edificios..." : "Seleccione un edificio"} />
            </SelectTrigger>
            <SelectContent>
              {buildings.map((building) => (
                <SelectItem key={building.edi_id} value={building.edi_id.toString()}>
                  {building.edi_identificador} - {building.edi_nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Rango de fechas (opcional)</Label>
          <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleGenerateReport}
          disabled={isLoading || !selectedBuildingId}
          className="w-full"
        >
          {reportLoading ? (
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

