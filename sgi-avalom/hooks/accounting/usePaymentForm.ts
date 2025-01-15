"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import cookie from "js-cookie";
import usePaymentStore from "@/lib/zustand/monthlyRentStore";
import { useEffect, useState } from "react";

const paymentFormSchema = z.object({
  pag_descripcion: z
    .string()
    .min(1, "La descripción debe tener al menos 1 caracter.")
    .max(50, "La descripción debe tener como máximo 50 caracteres."),
  pag_cuenta: z
    .string()
    .min(1, "La cuenta debe tener al menos 1 caracter.")
    .max(50, "La cuenta debe tener como máximo 50 caracteres."),
});

type PaymentFormInputs = z.infer<typeof paymentFormSchema>;

interface PaymentFormData extends PaymentFormInputs {
  amountToPay: number;
}

export const usePaymentForm = () => {
  const { selectedMonthlyRent, selectMonthlyRent, addPayment } =
    usePaymentStore();
  const form = useForm<PaymentFormInputs>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      pag_descripcion: "",
      pag_cuenta: "",
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amountToPay, setAmountToPay] = useState<string>("");

  const handlePaymentSubmit = async (formData: PaymentFormData) => {
    try {
      const { pag_descripcion, pag_cuenta, amountToPay } = formData;

      if (!selectedMonthlyRent) {
        throw new Error("No hay alquiler mensual seleccionado.");
      }

      const paymentData = {
        pag_monto: amountToPay,
        pag_fechapago: new Date().toISOString(),
        pag_estado: "A",
        pag_descripcion,
        pag_cuenta,
        alqm_id: selectedMonthlyRent.alqm_id,
      };

      const token = cookie.get("token");
      if (!token) throw new Error("Token no disponible");

      setIsSubmitting(true);

      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.post(
        `/api/accounting/payment`,
        paymentData,
        { headers }
      );

      if (response?.data?.success) {
        addPayment(response.data.data.payment);
        selectMonthlyRent(response.data.data.updatedMonthlyRent);
      } else {
        throw new Error(response?.data?.error || "Error desconocido.");
      }
    } catch (error: any) {
      throw new Error(error.message || "Error al realizar el pago.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    handlePaymentSubmit,
    amountToPay,
    setAmountToPay,
  };
};
