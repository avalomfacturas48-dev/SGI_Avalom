"use client";

import { useEffect, useMemo } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import cookie from "js-cookie";
import useUserStore from "@/lib/zustand/userStore";
import { UserFormProps } from "@/lib/typesForm";
import { useUser } from "@/lib/UserContext";

const userFormSchema = z.object({
  usu_nombre: z
    .string()
    .min(1, "Nombre es requerido")
    .max(30, "El nombre no puede tener más de 30 caracteres"),
  usu_papellido: z
    .string()
    .min(1, "Primer Apellido es requerido")
    .max(30, "El primer apellido no puede tener más de 30 caracteres"),
  usu_sapellido: z
    .string()
    .max(30, "El segundo apellido no puede tener más de 30 caracteres"),
  usu_cedula: z
    .string()
    .min(1, "Cédula es requerida")
    .max(15, "La cédula no puede tener más de 15 caracteres"),
  usu_telefono: z
    .string()
    .max(15, "El teléfono no puede tener más de 15 caracteres"),
  usu_correo: z
    .string()
    .min(1, "Correo es requerido")
    .email("Correo no válido")
    .max(50, "El correo no puede tener más de 50 caracteres"),
  usu_contrasena: z
    .string()
    .min(1, "Contraseña es requerida")
    .max(500, "La contraseña no puede tener más de 30 caracteres"),
  usu_estado: z.enum(["A", "I"]),
  usu_rol: z.enum(["A", "J", "E", "R"]),
});

type UserFormInputs = z.infer<typeof userFormSchema>;

export const useUserForm = ({ action, entity, onSuccess }: UserFormProps) => {
  const { user: currentUser } = useUser();
  const { addUser, updateUser } = useUserStore((state) => ({
    addUser: state.addUser,
    updateUser: state.updateUser,
  }));

  const defaultValues = useMemo(() => {
    return entity
      ? {
          usu_nombre: entity.usu_nombre || "",
          usu_papellido: entity.usu_papellido || "",
          usu_sapellido: entity.usu_sapellido || "",
          usu_cedula: entity.usu_cedula || "",
          usu_telefono: entity.usu_telefono || "",
          usu_correo: entity.usu_correo || "",
          usu_contrasena: entity.usu_contrasena || "",
          usu_estado: entity.usu_estado as "A" | "I",
          usu_rol: entity.usu_rol as "A" | "J" | "E" | "R",
        }
      : {
          usu_nombre: "",
          usu_papellido: "",
          usu_sapellido: "",
          usu_cedula: "",
          usu_telefono: "",
          usu_correo: "",
          usu_contrasena: "",
          usu_estado: "A" as const,
          usu_rol: "R" as const,
        };
  }, [entity]);

  const form = useForm<UserFormInputs>({
    resolver: zodResolver(userFormSchema),
    defaultValues,
  });

  const { handleSubmit, reset } = form;

  useEffect(() => {
    if (action === "edit") {
      reset(defaultValues);
    }
  }, [entity, action, reset, defaultValues]);

  const onSubmit: SubmitHandler<UserFormInputs> = async (formData) => {
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
        const response = await axios.post("/api/users", formData, { headers });
        if (response.data) {
          addUser(response.data);
          onSuccess();
          reset(defaultValues);
        }
      } else if (action === "edit" && entity?.usu_id) {
        const response = await axios.put(
          `/api/users/${entity.usu_id}`,
          formData,
          { headers }
        );
        if (response.data) {
          updateUser(response.data);
          onSuccess();
          reset(defaultValues);
        }
      }
    } catch (error: any) {
      console.error("Error al guardar el usuario:", error);
    }
  };

  const handleClear = () => {
    reset(defaultValues);
  };

  const disableRoleSelection =
    (currentUser?.usu_rol === "E" && entity?.usu_rol === "A") ||
    (currentUser?.usu_rol === "E" && entity?.usu_rol === "J");

  return {
    form,
    handleSubmit,
    onSubmit,
    handleClear,
    disableRoleSelection,
  };
};
