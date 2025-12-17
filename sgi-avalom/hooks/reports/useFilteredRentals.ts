import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import cookie from "js-cookie";

export interface Rental {
  alq_id: number;
  alq_fechainicio: string;
  alq_fechafin: string | null;
  alq_estado: string;
  alq_prop_id: number;
  ava_propiedad: {
    prop_identificador: string;
    prop_edi_id: number;
    ava_edificio: {
      edi_identificador: string;
      edi_nombre: string;
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

export const useFilteredRentals = () => {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>("");
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
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
      // Asegurar que siempre sea un array
      setRentals(Array.isArray(data) ? data : []);
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

  // Obtener edificios únicos
  const buildings = useMemo(() => {
    if (!Array.isArray(rentals) || rentals.length === 0) return [];
    
    const uniqueBuildings = new Map<number, { id: number; name: string; identifier: string }>();
    rentals.forEach((rental) => {
      const buildingId = rental.ava_propiedad?.prop_edi_id;
      if (buildingId && !uniqueBuildings.has(buildingId)) {
        uniqueBuildings.set(buildingId, {
          id: buildingId,
          identifier: rental.ava_propiedad.ava_edificio.edi_identificador,
          name: rental.ava_propiedad.ava_edificio.edi_nombre,
        });
      }
    });
    return Array.from(uniqueBuildings.values());
  }, [rentals]);

  // Obtener propiedades del edificio seleccionado
  const properties = useMemo(() => {
    if (!selectedBuildingId || !Array.isArray(rentals)) return [];
    
    const uniqueProperties = new Map<number, { id: number; identifier: string }>();
    rentals
      .filter((r) => r.ava_propiedad?.prop_edi_id?.toString() === selectedBuildingId)
      .forEach((rental) => {
        const propertyId = rental.alq_prop_id;
        if (propertyId && !uniqueProperties.has(propertyId)) {
          uniqueProperties.set(propertyId, {
            id: propertyId,
            identifier: rental.ava_propiedad.prop_identificador,
          });
        }
      });
    return Array.from(uniqueProperties.values());
  }, [rentals, selectedBuildingId]);

  // Filtrar rentals
  const filteredRentals = useMemo(() => {
    if (!Array.isArray(rentals)) return [];
    
    let filtered = rentals;

    // Filtrar por edificio
    if (selectedBuildingId) {
      filtered = filtered.filter(
        (r) => r.ava_propiedad.prop_edi_id.toString() === selectedBuildingId
      );
    }

    // Filtrar por propiedad
    if (selectedPropertyId) {
      filtered = filtered.filter((r) => r.alq_prop_id.toString() === selectedPropertyId);
    }

    // Filtrar por búsqueda de texto
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((rental) => {
        const cliente = rental.ava_clientexalquiler[0]?.ava_cliente;
        const clienteNombre = cliente
          ? `${cliente.cli_nombre} ${cliente.cli_papellido}`.toLowerCase()
          : "";
        const edificio = rental.ava_propiedad.ava_edificio.edi_identificador.toLowerCase();
        const propiedad = rental.ava_propiedad.prop_identificador.toLowerCase();
        const id = rental.alq_id.toString();

        return (
          clienteNombre.includes(term) ||
          edificio.includes(term) ||
          propiedad.includes(term) ||
          id.includes(term)
        );
      });
    }

    return filtered;
  }, [rentals, selectedBuildingId, selectedPropertyId, searchTerm]);

  const getRentalLabel = (rental: Rental): string => {
    const cliente = rental.ava_clientexalquiler[0]?.ava_cliente;
    const clienteNombre = cliente
      ? `${cliente.cli_nombre} ${cliente.cli_papellido}`
      : "Sin cliente";
    const propiedad = rental.ava_propiedad.prop_identificador;
    const edificio = rental.ava_propiedad.ava_edificio.edi_identificador;
    const estado = rental.alq_estado === "A" ? "Activo" : rental.alq_estado === "F" ? "Finalizado" : "Cancelado";
    
    return `#${rental.alq_id} - ${edificio}/${propiedad} - ${clienteNombre} [${estado}]`;
  };

  const resetFilters = () => {
    setSelectedBuildingId("");
    setSelectedPropertyId("");
    setSearchTerm("");
  };

  return {
    rentals: filteredRentals,
    allRentals: rentals,
    buildings,
    properties,
    loading,
    selectedBuildingId,
    selectedPropertyId,
    searchTerm,
    setSelectedBuildingId,
    setSelectedPropertyId,
    setSearchTerm,
    getRentalLabel,
    resetFilters,
    refetch: fetchRentals,
  };
};

