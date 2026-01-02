"use client";

import { useState, useCallback } from "react";
import axios from "axios";
import cookie from "js-cookie";
import { toast } from "sonner";
import type { ExpenseStatistics } from "@/lib/types/forms";

export const useExpenseStatisticsAPI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [statistics, setStatistics] = useState<ExpenseStatistics>({
    totalMesActual: "0",
    totalAnioActual: "0",
    totalTransacciones: 0,
    porcentajeServicios: 0,
    porcentajeMantenimiento: 0,
    cantidadServicios: 0,
    cantidadMantenimiento: 0,
    cambioMesAnterior: 0,
  });

  const fetchStatistics = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = cookie.get("token");
      if (!token) return;

      const response = await axios.get("/api/expenses/statistics", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setStatistics(response.data.data);
      }
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
      toast.error("No se pudieron cargar las estadísticas");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    statistics,
    isLoading,
    fetchStatistics,
  };
};

