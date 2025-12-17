import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import cookie from "js-cookie";
import { format } from "date-fns";

export interface ExpenseReportOptions {
  ediId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

export const useExpenseReportGenerator = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateExpenseReport = async (
    reportType: "services" | "maintenance" | "all" | "profit-loss",
    filename: string,
    options: ExpenseReportOptions
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

      // Construir URL con parámetros
      const params = new URLSearchParams();
      if (options.ediId) params.append("edi_id", options.ediId);
      if (options.fechaDesde) params.append("fechaDesde", options.fechaDesde);
      if (options.fechaHasta) params.append("fechaHasta", options.fechaHasta);

      const url = `/api/expenses/reports/${reportType}?${params.toString()}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Verificar el content-type antes de procesar
      const contentType = response.headers.get("content-type") || "";

      if (!response.ok) {
        let errorMessage = "Error al generar el reporte";
        
        // Si la respuesta es JSON (error del servidor), leer el mensaje
        if (contentType.includes("application/json")) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch (e) {
            errorMessage = response.statusText || errorMessage;
          }
        } else {
          errorMessage = response.statusText || errorMessage;
        }

        toast({
          title: "Error",
          description: response.status === 400
            ? "Faltan parámetros requeridos para generar el reporte"
            : response.status === 401
            ? "No autorizado. Por favor, inicia sesión nuevamente"
            : errorMessage,
          variant: "destructive",
        });
        return false;
      }

      // Verificar que la respuesta sea un PDF
      if (!contentType.includes("application/pdf")) {
        // Si no es PDF, intentar leer el error como JSON
        try {
          const errorData = await response.json();
          const errorMsg = errorData.error || errorData.message || "La respuesta del servidor no es un PDF válido";
          toast({
            title: "Error",
            description: errorMsg,
            variant: "destructive",
          });
        } catch {
          toast({
            title: "Error",
            description: "La respuesta del servidor no es un PDF válido",
            variant: "destructive",
          });
        }
        return false;
      }

      const blob = await response.blob();
      
      // Verificar que el blob no esté vacío y tenga el tamaño correcto
      if (blob.size === 0) {
        toast({
          title: "Error",
          description: "El reporte generado está vacío",
          variant: "destructive",
        });
        return false;
      }

      // Verificar que sea realmente un PDF (los PDFs empiezan con %PDF)
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const pdfHeader = String.fromCharCode(...uint8Array.slice(0, 4));
      
      if (pdfHeader !== "%PDF") {
        // No es un PDF, intentar leer como JSON para ver el error
        const text = await blob.text();
        try {
          const errorData = JSON.parse(text);
          toast({
            title: "Error",
            description: errorData.error || "El servidor retornó un error",
            variant: "destructive",
          });
        } catch {
          toast({
            title: "Error",
            description: `Respuesta inválida del servidor: ${text.substring(0, 100)}`,
            variant: "destructive",
          });
        }
        return false;
      }

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
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      console.error("Error al generar reporte de gastos:", errorMessage);
      toast({
        title: "Error",
        description: "Error al generar el reporte de gastos",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { loading, generateExpenseReport };
};

