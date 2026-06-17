"use client";

import { useEffect, useMemo } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import cookie from "js-cookie";
import axios from "axios";
import useClientStore from "@/lib/zustand/clientStore";
import { ClienteFormProps } from "@/lib/typesForm";

const clienteFormSchema = z.object({
  cli_nombre: z
    .string()
    .min(1, "El nombre es requerido")
    .max(30, "El nombre no puede tener más de 30 caracteres"),
  cli_papellido: z
    .string()
    .min(1, "El primer apellido es requerido")
    .max(30, "El primer apellido no puede tener más de 30 caracteres"),
  cli_sapellido: z
    .string()
    .max(30, "El segundo apellido no puede tener más de 30 caracteres"),
  cli_cedula: z
    .string()
    .min(1, "La cédula es requerida")
    .max(15, "La cédula no puede tener más de 15 caracteres")
    .regex(/^\d+$/, "La cédula solo puede contener números"),
  cli_telefono: z
    .string()
    .min(1, "El teléfono es requerido")
    .max(15, "El teléfono no puede tener más de 15 caracteres"),
  cli_correo: z
    .string()
    .min(1, "El correo es requerido")
    .email("Correo inválido")
    .max(50, "El correo no puede tener más de 50 caracteres"),
  cli_direccion: z
    .string()
    .max(200, "La dirección no puede tener más de 200 caracteres")
    .optional(),
  cli_estadocivil: z
    .string()
    .max(20, "El estado civil no puede tener más de 20 caracteres")
    .optional(),
});

type ClienteFormInputs = z.infer<typeof clienteFormSchema>;

export const useClientForm = ({
  action,
  entity,
  onSuccess,
}: ClienteFormProps) => {
  const { addClient, updateClient } = useClientStore((state) => ({
    addClient: state.addClient,
    updateClient: state.updateClient,
  }));

  const defaultValues = useMemo(() => {
    return entity
      ? {
          cli_nombre: entity.cli_nombre || "",
          cli_papellido: entity.cli_papellido || "",
          cli_sapellido: entity.cli_sapellido || "",
          cli_cedula: entity.cli_cedula || "",
          cli_telefono: entity.cli_telefono || "",
          cli_correo: entity.cli_correo || "",
          cli_direccion: entity.cli_direccion || "",
          cli_estadocivil: entity.cli_estadocivil || "",
        }
      : {
          cli_nombre: "",
          cli_papellido: "",
          cli_sapellido: "",
          cli_cedula: "",
          cli_telefono: "",
          cli_correo: "",
          cli_direccion: "",
          cli_estadocivil: "",
        };
  }, [entity]);

  const form = useForm<ClienteFormInputs>({
    resolver: zodResolver(clienteFormSchema),
    defaultValues,
  });

  const { handleSubmit, reset } = form;

  useEffect(() => {
    if (action === "edit") {
      reset(defaultValues);
    }
  }, [entity, action, reset, defaultValues]);

  const onSubmit: SubmitHandler<ClienteFormInputs> = async (formData) => {
    try {
      const token = cookie.get("token");
      if (!token) {
        throw new Error("No hay token disponible");
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      let response;

      if (action === "create") {
        response = await axios.post("/api/client", formData, { headers });
      } else if (action === "edit" && entity?.cli_id) {
        response = await axios.put(`/api/client/${entity.cli_id}`, formData, {
          headers,
        });
      }

      if (response?.data?.success) {
        action === "create"
          ? addClient(response.data.data)
          : updateClient(response.data.data);
        onSuccess();
        reset(defaultValues);
      } else {
        throw new Error(response?.data?.error || "Error desconocido");
      }
    } catch (error: any) {
      const message =
        error.response?.data?.error || error.message || "Error desconocido";
      throw new Error(message);
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
