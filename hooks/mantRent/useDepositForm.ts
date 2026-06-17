"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import cookie from "js-cookie";
import useRentalStore from "@/lib/zustand/useRentalStore";

const depositFormSchema = z.object({
  depo_total: z
    .string()
    .min(1, { message: "El monto es requerido" })
    .refine((value) => !isNaN(Number(value)) && Number(value) > 0, {
      message: "El monto debe ser un número positivo",
    }),
});

export type DepositFormInputs = z.infer<typeof depositFormSchema>;

export const useDepositForm = () => {
  const { deposit, setDeposit, selectedRental } = useRentalStore();
  const isEditing = Boolean(deposit);

  const form = useForm<DepositFormInputs>({
    resolver: zodResolver(depositFormSchema),
    defaultValues: {
      depo_total: deposit?.depo_total?.toString() || selectedRental?.alq_monto,
    },
  });

  const onSubmit: SubmitHandler<DepositFormInputs> = async (formData) => {
    try {
      const token = cookie.get("token");
      if (!token) throw new Error("Token no disponible");

      const endpoint = isEditing
        ? `/api/deposit/${deposit?.depo_id}`
        : "/api/deposit";
      const method = isEditing ? "put" : "post";

      const response = await axios[method](
        endpoint,
        { depo_total: formData.depo_total, alq_id: selectedRental?.alq_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response?.data?.success) {
        setDeposit(response.data.data);
      } else {
        throw new Error(
          response?.data?.error || "Error al guardar el depósito"
        );
      }
    } catch (error: any) {
      throw new Error(error.message || "Error al guardar el depósito");
    }
  };

  const isFormDisabled = Boolean(deposit?.ava_pago?.length);

  return {
    form,
    onSubmit,
    isFormDisabled,
    isEditing,
    deposit,
  };
};
