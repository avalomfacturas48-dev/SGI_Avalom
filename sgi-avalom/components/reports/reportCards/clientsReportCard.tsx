"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Download, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useReportGenerator } from "@/hooks/reports/useReportGenerator";

export function ClientsReportCard() {
  const { loading, generateReport } = useReportGenerator();

  const handleGenerateReport = async () => {
    const filename = `reporte_clientes_${format(new Date(), "yyyy-MM-dd")}.pdf`;
    await generateReport("/api/export-clients", filename);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Reporte de Clientes
        </CardTitle>
        <CardDescription>Listado completo de clientes con su información de contacto</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">Este reporte no requiere filtros adicionales</p>
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
