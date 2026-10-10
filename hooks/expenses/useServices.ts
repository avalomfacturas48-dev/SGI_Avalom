"use client";

import { useState, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
import type { ServiceFormValues } from "@/lib/schemas/expenseSchemas";

interface UseServicesOptions {
  onSuccess?: () => void;
}

export const useServices = (options?: UseServicesOptions) => {
  const [isLoading, setIsLoading] = useState(false);

  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/expenses/servicios");

      return response.data.data || [];
    } catch (error) {
      console.error("Error al cargar servicios:", error);
      toast.error("No se pudieron cargar los servicios");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createService = useCallback(
    async (data: ServiceFormValues) => {
      try {
        const response = await axios.post("/api/expenses/servicios", data);

        toast.success("Servicio creado exitosamente");
        options?.onSuccess?.();
        return response.data.data;
      } catch (error: any) {
        console.error("Error al crear servicio:", error);
        const errorMessage = error.response?.data?.error || "Error al crear el servicio";
        toast.error(errorMessage);
        throw error;
      }
    },
    [options]
  );

  const updateService = useCallback(
    async (id: string, data: ServiceFormValues) => {
      try {
        const response = await axios.put(`/api/expenses/servicios/${id}`, data);

        toast.success("Servicio actualizado exitosamente");
        options?.onSuccess?.();
        return response.data.data;
      } catch (error: any) {
        console.error("Error al actualizar servicio:", error);
        const errorMessage = error.response?.data?.error || "Error al actualizar el servicio";
        toast.error(errorMessage);
        throw error;
      }
    },
    [options]
  );

  const deleteService = useCallback(
    async (id: string) => {
      try {
        await axios.delete(`/api/expenses/servicios/${id}`);

        toast.success("Servicio eliminado exitosamente");
        options?.onSuccess?.();
      } catch (error: any) {
        console.error("Error al eliminar servicio:", error);
        const errorMessage = error.response?.data?.error || "Error al eliminar el servicio";
        
        // Si el error es porque tiene gastos relacionados, mostrar mensaje más claro
        if (error.response?.status === 409) {
          toast.error(errorMessage, {
            description: "No se puede eliminar un servicio que está siendo utilizado en gastos registrados.",
            duration: 5000,
          });
        } else {
          toast.error(errorMessage);
        }
        throw error;
      }
    },
    [options]
  );

  return {
    isLoading,
    fetchServices,
    createService,
    updateService,
    deleteService,
  };
};

