"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isMontoEntero, MONTO_ENTERO_MSG } from "@/lib/schemas/formFields";
import axios from "axios";
import useRentalStore from "@/lib/zustand/useRentalStore";

const depositFormSchema = z.object({
  depo_total: z
    .string()
    .min(1, { message: "El monto es requerido" })
    .refine((value) => isMontoEntero(value) && Number(value) > 0, {
      message: `${MONTO_ENTERO_MSG}, mayor a 0`,
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
      const endpoint = isEditing
        ? `/api/deposit/${deposit?.depo_id}`
        : "/api/deposit";
      const method = isEditing ? "put" : "post";

      const response = await axios[method](
        endpoint,
        { depo_total: formData.depo_total, alq_id: selectedRental?.alq_id }
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

  // El depósito puede editarse aunque tenga pagos asociados; solo se advierte.
  const hasPayments = Boolean(deposit?.ava_pago?.length);

  return {
    form,
    onSubmit,
    hasPayments,
    isEditing,
    deposit,
  };
};
