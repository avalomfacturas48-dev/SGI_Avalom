"use client";

import { useState, useCallback } from "react";
import axios from "axios";
import cookie from "js-cookie";
import { toast } from "sonner";
import useExpensesStore from "@/lib/zustand/expensesStore";
import type { AvaGasto } from "@/lib/types/entities";
import type { ExpenseFormValues, CancellationFormValues } from "@/lib/schemas/expenseSchemas";

interface UseExpensesOptions {
  onSuccess?: () => void;
}

export const useExpenses = (options?: UseExpensesOptions) => {
  const { setExpenses } = useExpensesStore();
  const [isLoading, setIsLoading] = useState(false);

  const fetchExpenses = useCallback(
    async (
      page: number = 1,
      limit: number = 10,
      estado?: string,
      tipo?: string
    ) => {
      setIsLoading(true);
      try {
        const token = cookie.get("token");
        if (!token) return { data: [], pagination: null };

        const params: Record<string, string | number> = {
          page,
          limit,
        };

        // Solo agregar estado si se especifica (si es "all", no se envía)
        if (estado && estado !== "all") {
          params.estado = estado;
        }

        // Solo agregar tipo si se especifica (si es "all", no se envía)
        if (tipo && tipo !== "all") {
          params.tipo = tipo;
        }

        const response = await axios.get("/api/expenses", {
          params,
          headers: { Authorization: `Bearer ${token}` },
        });

        setExpenses(response.data.data);

        return {
          data: response.data.data,
          pagination: response.data.pagination,
        };
      } catch (error) {
        console.error("Error al cargar gastos:", error);
        toast.error("No se pudieron cargar los gastos");
        return { data: [], pagination: null };
      } finally {
        setIsLoading(false);
      }
    },
    [setExpenses]
  );

  const fetchAllExpenses = useCallback(async (estado: string = "A") => {
    try {
      const token = cookie.get("token");
      if (!token) return [];

      const response = await axios.get("/api/expenses", {
        params: { estado },
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data.data || [];
    } catch (error) {
      console.error("Error al cargar todos los gastos:", error);
      toast.error("No se pudieron cargar los gastos");
      return [];
    }
  }, []);

  const createExpense = useCallback(
    async (data: ExpenseFormValues) => {
      try {
        const token = cookie.get("token");
        if (!token) return null;

        const response = await axios.post("/api/expenses", data, {
          headers: { Authorization: `Bearer ${token}` },
        });

        toast.success("Gasto creado exitosamente");
        options?.onSuccess?.();
        return response.data.data;
      } catch (error: any) {
        console.error("Error al crear gasto:", error);
        const errorMessage = error.response?.data?.error || "Error al crear el gasto";
        toast.error(errorMessage);
        throw error;
      }
    },
    [options]
  );

  const updateExpense = useCallback(
    async (id: string, data: ExpenseFormValues) => {
      try {
        const token = cookie.get("token");
        if (!token) return null;

        const response = await axios.put(`/api/expenses/${id}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });

        toast.success("Gasto actualizado exitosamente");
        options?.onSuccess?.();
        return response.data.data;
      } catch (error: any) {
        console.error("Error al actualizar gasto:", error);
        const errorMessage = error.response?.data?.error || "Error al actualizar el gasto";
        toast.error(errorMessage);
        throw error;
      }
    },
    [options]
  );

  const cancelExpense = useCallback(
    async (id: string, data: CancellationFormValues) => {
      try {
        const token = cookie.get("token");
        if (!token) {
          toast.error("No hay token de autenticación");
          throw new Error("No hay token de autenticación");
        }

        const response = await axios.post(`/api/expenses/cancel/${id}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          toast.success("Gasto anulado exitosamente");
          options?.onSuccess?.();
          return response.data.data;
        } else {
          const errorMessage = response.data.error || "Error al anular el gasto";
          toast.error(errorMessage);
          throw new Error(errorMessage);
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.error || error.message || "Error al anular el gasto";
        toast.error(errorMessage);
        throw error;
      }
    },
    [options]
  );

  return {
    isLoading,
    fetchExpenses,
    fetchAllExpenses,
    createExpense,
    updateExpense,
    cancelExpense,
  };
};

