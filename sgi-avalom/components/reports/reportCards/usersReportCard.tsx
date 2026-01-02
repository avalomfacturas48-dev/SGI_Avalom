"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Download, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useReportGenerator } from "@/hooks/reports/useReportGenerator";

export function UsersReportCard() {
  const { loading, generateReport } = useReportGenerator();

  const handleGenerateReport = async () => {
    const filename = `reporte_usuarios_${format(new Date(), "yyyy-MM-dd")}.pdf`;
    await generateReport("/api/export-users", filename);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Reporte de Usuarios
        </CardTitle>
        <CardDescription>Listado de usuarios del sistema con roles y estados</CardDescription>
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
