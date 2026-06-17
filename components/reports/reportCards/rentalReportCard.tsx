"use client";

import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileSpreadsheet, Download, Loader2, Search } from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import type { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { useReportGenerator } from "@/hooks/reports/useReportGenerator";
import { useRentals } from "@/hooks/reports/useRentals";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

export function RentalReportCard() {
  const [selectedRentalId, setSelectedRentalId] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const { loading: reportLoading, generateReport } = useReportGenerator();
  const { rentals, loading: rentalsLoading, getRentalLabel } = useRentals();

  // Filtrar rentals por búsqueda
  const filteredRentals = useMemo(() => {
    if (!Array.isArray(rentals)) return [];
    if (!searchTerm.trim()) return rentals;

    const term = searchTerm.toLowerCase();
    return rentals.filter((rental) => {
      const cliente = rental.ava_clientexalquiler?.[0]?.ava_cliente;
      const clienteNombre = cliente
        ? `${cliente.cli_nombre} ${cliente.cli_papellido}`.toLowerCase()
        : "";
      const edificio = rental.ava_propiedad?.ava_edificio?.edi_identificador?.toLowerCase() || "";
      const propiedad = rental.ava_propiedad?.prop_identificador?.toLowerCase() || "";
      const id = rental.alq_id.toString();

      return (
        clienteNombre.includes(term) ||
        edificio.includes(term) ||
        propiedad.includes(term) ||
        id.includes(term)
      );
    });
  }, [rentals, searchTerm]);

  const handleGenerateReport = async () => {
    if (!selectedRentalId) return;

    const filename = `reporte_alquiler_${selectedRentalId}_${format(new Date(), "yyyy-MM-dd")}.pdf`;
    await generateReport("/api/export-rental", filename, {
      id: selectedRentalId,
      dateRange,
    });
  };

  const isLoading = reportLoading || rentalsLoading;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-primary" />
          Reporte de Alquiler Detallado
        </CardTitle>
        <CardDescription>Reporte completo de un alquiler específico con mensualidades y pagos</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Búsqueda simple */}
        <div className="space-y-2">
          <Label htmlFor="search-rental">Buscar alquiler (opcional)</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search-rental"
              placeholder="Buscar por ID, cliente, edificio o propiedad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Selector de alquiler */}
        <div className="space-y-2">
          <Label htmlFor="rental-select">
            Seleccione el Alquiler <span className="text-red-500">*</span>
          </Label>
          <Select
            value={selectedRentalId}
            onValueChange={setSelectedRentalId}
            disabled={rentalsLoading || filteredRentals.length === 0}
          >
            <SelectTrigger id="rental-select">
              <SelectValue
                placeholder={
                  rentalsLoading
                    ? "Cargando alquileres..."
                    : filteredRentals.length === 0
                    ? searchTerm
                      ? "No se encontraron resultados"
                      : "No hay alquileres disponibles"
                    : "Seleccione un alquiler"
                }
              />
            </SelectTrigger>
            <SelectContent>
              <ScrollArea className="h-[250px]">
                {filteredRentals.map((rental) => (
                  <SelectItem key={rental.alq_id} value={rental.alq_id.toString()}>
                    {getRentalLabel(rental)}
                  </SelectItem>
                ))}
              </ScrollArea>
            </SelectContent>
          </Select>
          {searchTerm && filteredRentals.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {filteredRentals.length} resultado{filteredRentals.length !== 1 ? "s" : ""} encontrado{filteredRentals.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Rango de fechas */}
        <div className="space-y-2">
          <Label>Rango de mensualidades (opcional)</Label>
          <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleGenerateReport}
          disabled={isLoading || !selectedRentalId}
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
