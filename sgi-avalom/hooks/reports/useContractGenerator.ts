import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import cookie from "js-cookie";

export interface ContractData {
  arrendante: string;
  cedulaArrendante: string;
  arrendatario: string;
  cedulaArrendatario: string;
  estadoCivil: string;
  direccion: string;
  aptoNumero: string;
  contratoDesde: string;
  contratoHasta: string;
  montoTotal: number;
  diaPago: number;
  duracionAnios: number;
}

const initialFormData: ContractData = {
  arrendante: "",
  cedulaArrendante: "",
  arrendatario: "",
  cedulaArrendatario: "",
  estadoCivil: "",
  direccion: "",
  aptoNumero: "",
  contratoDesde: "",
  contratoHasta: "",
  montoTotal: 0,
  diaPago: 1,
  duracionAnios: 1,
};

export const useContractGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ContractData>(initialFormData);
  const { toast } = useToast();

  const handleChange = (field: keyof ContractData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    const requiredFields = [
      "arrendante",
      "cedulaArrendante",
      "arrendatario",
      "cedulaArrendatario",
      "estadoCivil",
      "direccion",
      "aptoNumero",
      "contratoDesde",
      "contratoHasta",
    ];

    for (const field of requiredFields) {
      if (!formData[field as keyof ContractData]) {
        toast({
          title: "Error",
          description: "Todos los campos son requeridos",
          variant: "destructive",
        });
        return false;
      }
    }

    if (formData.montoTotal <= 0) {
      toast({
        title: "Error",
        description: "El monto mensual debe ser mayor a 0",
        variant: "destructive",
      });
      return false;
    }

    if (formData.diaPago < 1 || formData.diaPago > 31) {
      toast({
        title: "Error",
        description: "El día de pago debe estar entre 1 y 31",
        variant: "destructive",
      });
      return false;
    }

    if (formData.duracionAnios <= 0) {
      toast({
        title: "Error",
        description: "La duración debe ser mayor a 0 años",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const generateContract = async (): Promise<boolean> => {
    if (!validateForm()) return false;

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

      const response = await fetch("/api/generate-contract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Error al generar contrato");

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `contrato_${formData.aptoNumero}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);

      toast({
        title: "Éxito",
        description: "Contrato generado exitosamente",
      });

      // Reset form
      setFormData(initialFormData);
      return true;
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Error al generar el contrato",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
  };

  return {
    loading,
    formData,
    handleChange,
    generateContract,
    resetForm,
  };
};

