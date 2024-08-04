"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { AvaPropiedad } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import usePropertyStore from "@/lib/zustand/propertyStore";
import useBuildingStore from "@/lib/zustand/buildStore";
import useTypeStore from "@/lib/zustand/typeStore"; // Importa el store de tipos de propiedad
import { useEffect, useState } from "react";
import axios from "axios";
import cookie from "js-cookie";

interface PropertyFormProps {
  action: "create" | "edit" | "view";
  property?: AvaPropiedad;
  entity?: number;
  onSuccess: () => void;
}

const PropertyForm: React.FC<PropertyFormProps> = ({
  action,
  property,
  entity,
  onSuccess,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AvaPropiedad>({
    defaultValues: property,
  });

  const { setSelectedProperty, updateSelectedProperty } = usePropertyStore();
  const { updateProperty, addProperty } = useBuildingStore();
  const { types, fetchTypes } = useTypeStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    reset(property);
  }, [property, reset]);

  useEffect(() => {
    const fetchPropertyTypes = async () => {
      // Verifica si ya se han cargado los tipos de propiedad
      if (types.length === 0) {
        await fetchTypes();
      }
    };
    fetchPropertyTypes();
  }, [fetchTypes, types]);

  const onSubmit: SubmitHandler<AvaPropiedad> = async (data) => {
    try {
      const token = cookie.get("token");
      if (!token) {
        throw new Error("No hay token disponible");
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // Convertir tipp_id a número si está presente
      const tippId = parseInt(String(data.tipp_id), 10);

      const propertyData = {
        ...data,
        tipp_id: tippId,
        edi_id: entity,
      };

      if (action === "create") {
        const response = await axios.post(`/api/property`, propertyData, {
          headers,
        });

        if (response.data) {
          setSelectedProperty(response.data);
          addProperty(entity || 0, response.data);
          onSuccess();
        }
      } else if (action === "edit") {
        const response = await axios.put(
          `/api/property/${data.prop_id}`,
          propertyData,
          { headers }
        );

        if (response.data) {
          updateSelectedProperty(response.data);
          updateProperty(property?.edi_id || 0, response.data);
          onSuccess();
        }
      }
    } catch (error: any) {
      console.error("Error al guardar propiedad:", error);
      setError("Hubo un error al guardar la propiedad.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-2 gap-4 m-3">
        <div>
          <Label htmlFor="prop_identificador">Identificador</Label>
          <Input
            id="prop_identificador"
            {...register("prop_identificador", {
              required: "El identificador es obligatorio",
            })}
            disabled={action === "view"}
          />
          {errors.prop_identificador && (
            <p className="text-red-500">{errors.prop_identificador.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="prop_descripcion">Descripción</Label>
          <Input
            id="prop_descripcion"
            {...register("prop_descripcion")}
            disabled={action === "view"}
          />
        </div>
        <div>
          <Label htmlFor="tipp_id">Tipo de Propiedad</Label>
          <select
            id="tipp_id"
            {...register("tipp_id", {
              required: "Selecciona un tipo de propiedad",
            })}
            disabled={action === "view"}
            className="w-full p-2 border rounded"
          >
            <option value="">Seleccionar Tipo</option>
            {types.map((type) => (
              <option key={type.tipp_id} value={type.tipp_id}>
                {type.tipp_nombre}
              </option>
            ))}
          </select>
          {errors.tipp_id && (
            <p className="text-red-500">{errors.tipp_id.message}</p>
          )}
        </div>
      </div>
      {action !== "view" && (
        <div className="pt-4 m-3">
          <Button type="submit">
            {action === "create" ? "Crear Propiedad" : "Guardar Cambios"}
          </Button>
        </div>
      )}
      {error && <Alert variant="destructive">{error}</Alert>}
    </form>
  );
};

export default PropertyForm;
