import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import cookie from "js-cookie";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";

export interface ReportOptions {
  dateRange?: DateRange;
  id?: string;
}

export const useReportGenerator = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateReport = async (
    endpoint: string,
    filename: string,
    options?: ReportOptions
  ) => {
    setLoading(true);
    try {
      const token = cookie.get("token");
      if (!token) {
        toast({
          title: "Error",
          description: "No hay token de autenticación",
          variant: "destructive",
        });
        return false;
      }

      let url = endpoint;
      
      // Agregar ID si existe
      if (options?.id) {
        url += url.includes("?") ? `&alq_id=${options.id}` : `?alq_id=${options.id}`;
      }

      // Agregar rango de fechas si existe
      if (options?.dateRange?.from && options?.dateRange?.to) {
        const fromStr = format(options.dateRange.from, "yyyy-MM");
        const toStr = format(options.dateRange.to, "yyyy-MM");
        const separator = url.includes("?") ? "&" : "?";
        url += `${separator}from=${fromStr}&to=${toStr}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 400) {
          toast({
            title: "Error",
            description: "Datos inválidos para generar el reporte",
            variant: "destructive",
          });
        } else {
          throw new Error("Error al generar reporte");
        }
        return false;
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);

      toast({
        title: "Éxito",
        description: "Reporte generado exitosamente",
      });

      return true;
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Error al generar el reporte",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { loading, generateReport };
};

