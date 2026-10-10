"use client";

import { useState, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
import type { AvaServicio, AvaEdificio, AvaPropiedad } from "@/lib/types/entities";

export const useExpenseStaticData = () => {
  const [servicios, setServicios] = useState<AvaServicio[]>([]);
  const [edificios, setEdificios] = useState<AvaEdificio[]>([]);
  const [propiedades, setPropiedades] = useState<AvaPropiedad[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStaticData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [serviciosRes, edificiosRes, propiedadesRes] = await Promise.all([
        axios.get("/api/expenses/servicios"),
        axios.get("/api/building"),
        axios.get("/api/property"),
      ]);

      setServicios(serviciosRes.data.data);
      setEdificios(edificiosRes.data.data);
      setPropiedades(propiedadesRes.data.data);
    } catch (error) {
      console.error("Error al cargar datos estáticos:", error);
      toast.error("No se pudieron cargar los datos");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    servicios,
    edificios,
    propiedades,
    isLoading,
    fetchStaticData,
  };
};

