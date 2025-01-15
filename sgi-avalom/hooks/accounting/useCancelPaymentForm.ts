"use client";

import { useMemo, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import cookie from "js-cookie";
import { toast } from "sonner";
import { AvaPago } from "@/lib/types";

const cancelPaymentFormSchema = z.object({
  anp_motivo: z
    .string()
    .min(5, { message: "El motivo debe tener al menos 5 caracteres." }),
  anp_descripcion: z
    .string()
    .min(10, { message: "La descripción debe tener al menos 10 caracteres." }),
});

type CancelPaymentFormInputs = z.infer<typeof cancelPaymentFormSchema>;

export const useCancelPaymentForm = ({
  payment,
  onSuccess,
}: {
  payment: AvaPago;
  onSuccess: () => void;
}) => {
  const form = useForm<CancelPaymentFormInputs>({
    resolver: zodResolver(cancelPaymentFormSchema),
    defaultValues: {
      anp_motivo: "",
      anp_descripcion: "",
    },
  });

  const { reset, handleSubmit } = form;

  const onSubmit: SubmitHandler<CancelPaymentFormInputs> = async (data) => {
    try {
      const token = cookie.get("token");
      if (!token) throw new Error("Token no disponible");

      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.post(
        `/api/accounting/canceledpayment`,
        {
          ...data,
          anp_montooriginal: "0",
          anp_montofinal: "0",
          anp_fechaanulacion: new Date().toISOString(),
          pag_id: payment.pag_id,
        },
        { headers }
      );

      if (response?.data?.success) {
        onSuccess();
        reset();
      } else {
        throw new Error(response?.data?.error || "Error desconocido");
      }
    } catch (error: any) {
      throw new Error(error.message || "Error al anular el pago");
    }
  };

  const handleClear = () => {
    reset();
  };

  return {
    form,
    onSubmit,
    handleSubmit,
    handleClear,
  };
};
