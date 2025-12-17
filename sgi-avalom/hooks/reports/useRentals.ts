import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import cookie from "js-cookie";

export interface Rental {
  alq_id: number;
  alq_fechainicio: string;
  alq_fechafin: string | null;
  alq_estado: string;
  ava_propiedad: {
    prop_identificador: string;
    ava_edificio: {
      edi_identificador: string;
    };
  };
  ava_clientexalquiler: Array<{
    ava_cliente: {
      cli_nombre: string;
      cli_papellido: string;
      cli_sapellido: string | null;
    };
  }>;
}

export const useRentals = () => {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchRentals = async () => {
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

      const response = await fetch("/api/rent", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al cargar alquileres");
      }

      const data = await response.json();
      // El API puede retornar { success: true, data: [...] } o directamente un array
      const rentalsData = data?.data || data;
      setRentals(Array.isArray(rentalsData) ? rentalsData : []);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Error al cargar la lista de alquileres",
        variant: "destructive",
      });
      setRentals([]); // En caso de error, mantener array vacío
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getRentalLabel = (rental: Rental): string => {
    const cliente = rental.ava_clientexalquiler?.[0]?.ava_cliente;
    const clienteNombre = cliente
      ? `${cliente.cli_nombre} ${cliente.cli_papellido}`
      : "Sin cliente";
    const propiedad = rental.ava_propiedad?.prop_identificador || "N/A";
    const edificio = rental.ava_propiedad?.ava_edificio?.edi_identificador || "N/A";
    
    return `#${rental.alq_id} - ${edificio}/${propiedad} - ${clienteNombre}`;
  };

  return { rentals, loading, getRentalLabel, refetch: fetchRentals };
};

