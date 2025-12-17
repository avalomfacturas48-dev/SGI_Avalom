import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import cookie from "js-cookie";

export interface Building {
  edi_id: number;
  edi_identificador: string;
  edi_nombre: string;
  ava_propiedad: Property[];
}

export interface Property {
  prop_id: number;
  prop_identificador: string;
  prop_edi_id: number;
}

export const useBuildings = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchBuildings = async () => {
    setLoading(true);
    try {
      const token = cookie.get("token");
      if (!token) {
        toast({
          title: "Error",
          description: "No hay token de autenticación",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch("/api/building", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al cargar edificios");
      }

      const data = await response.json();
      // El API retorna { success: true, data: [...] }
      const buildingsData = data?.data || data;
      setBuildings(Array.isArray(buildingsData) ? buildingsData : []);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Error al cargar la lista de edificios",
        variant: "destructive",
      });
      setBuildings([]); // En caso de error, mantener array vacío
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuildings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getPropertiesByBuilding = (buildingId: number): Property[] => {
    if (!Array.isArray(buildings)) return [];
    const building = buildings.find((b) => b.edi_id === buildingId);
    return building?.ava_propiedad || [];
  };

  return { buildings, loading, getPropertiesByBuilding, refetch: fetchBuildings };
};

