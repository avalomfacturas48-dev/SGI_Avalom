"use client";

import { useEffect, useMemo } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import cookie from "js-cookie";
import useBuildingStore from "@/lib/zustand/buildStore";
import { BuildFormProps } from "@/lib/typesForm";

const buildingFormSchema = z.object({
  edi_identificador: z
    .string()
    .min(1, "Identificador es requerido")
    .max(15, "El identificador no puede tener más de 15 caracteres"),
  edi_descripcion: z
    .string()
    .max(50, "La descripción no puede tener más de 50 caracteres"),
});

type BuildingFormInputs = z.infer<typeof buildingFormSchema>;

export const useBuildForm = ({
  action,
  building,
  onSuccess,
}: BuildFormProps) => {
  const { addBuilding, updateBuilding } = useBuildingStore();

  const defaultValues = useMemo(() => {
    return action === "create"
      ? {
          edi_identificador: "",
          edi_descripcion: "",
        }
      : {
          edi_identificador: building?.edi_identificador || "",
          edi_descripcion: building?.edi_descripcion || "",
        };
  }, [action, building]);

  const form = useForm<BuildingFormInputs>({
    resolver: zodResolver(buildingFormSchema),
    defaultValues,
  });

  const { handleSubmit, reset } = form;

  useEffect(() => {
    if (action === "edit") {
      reset(defaultValues);
    }
  }, [building, action, reset, defaultValues]);

  const onSubmit: SubmitHandler<BuildingFormInputs> = async (data) => {
    try {
      const token = cookie.get("token");
      if (!token) {
        console.error("No hay token disponible");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      if (action === "create") {
        const response = await axios.post("/api/building", data, { headers });
        if (response.data) {
          addBuilding(response.data);
          onSuccess();
          reset(defaultValues);
        }
      } else if (action === "edit" && building?.edi_id) {
        const response = await axios.put(
          `/api/building/${building.edi_id}`,
          data,
          { headers }
        );
        if (response.data) {
          updateBuilding(response.data);
          onSuccess();
          reset(defaultValues);
        }
      }
    } catch (error: any) {
      console.error("Error al guardar el Edificio:", error);
    }
  };

  const handleClear = () => {
    reset(defaultValues);
  };

  return {
    form,
    handleSubmit,
    onSubmit,
    handleClear,
  };
};
