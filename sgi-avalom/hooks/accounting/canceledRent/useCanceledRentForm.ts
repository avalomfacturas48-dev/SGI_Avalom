"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import cookie from "js-cookie";
import { useParams } from "next/navigation";
import useRentalStore from "@/lib/zustand/useRentalStore";

const schema = z.object({
  depo_montodevuelto: z
    .string()
    .min(1, "Campo requerido")
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Debe ser un número mayor o igual a 0",
    }),
  depo_descmontodevuelto: z.string().optional(),
  depo_montocastigo: z
    .string()
    .min(1, "Campo requerido")
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Debe ser un número mayor o igual a 0",
    }),
  depo_descrmontocastigo: z.string().optional(),

  depo_fechadevolucion: z
    .string()
    .min(1, "La fecha de devolución es obligatoria")
    .refine((val) => !isNaN(Date.parse(val)), { message: "Fecha inválida" }),

  alqc_motivo: z.string().min(1, "El motivo es requerido"),
  alqc_montodevuelto: z
    .string()
    .min(1)
    .refine((val) => Number(val) >= 0),
  alqc_castigo: z
    .string()
    .min(1)
    .refine((val) => Number(val) >= 0),
  alqc_motivomontodevuelto: z.string().optional(),
  alqc_motivocastigo: z.string().optional(),
  alqc_fecha_cancelacion: z
    .string()
    .min(1)
    .refine((val) => !isNaN(Date.parse(val)), { message: "Fecha inválida" }),
});

type FormData = z.infer<typeof schema>;

export const useCanceledRentForm = () => {
  const { alqId } = useParams();
  const { deposit } = useRentalStore();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      depo_montodevuelto: "",
      depo_descmontodevuelto: "",
      depo_montocastigo: "",
      depo_descrmontocastigo: "",
      depo_fechadevolucion: "",
      alqc_motivo: "",
      alqc_montodevuelto: "",
      alqc_castigo: "",
      alqc_motivomontodevuelto: "",
      alqc_motivocastigo: "",
      alqc_fecha_cancelacion: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const handleCancelSubmit = async (data: FormData) => {
    const montoActual = Number(deposit?.depo_montoactual || 0);
    const montoDevuelto = Number(data.depo_montodevuelto);
    const montoCastigo = Number(data.depo_montocastigo);
    const totalDevuelto = montoDevuelto + montoCastigo;

    if (totalDevuelto > montoActual) {
      throw new Error(
        "La suma del monto devuelto y castigo no puede superar el depósito actual."
      );
    }

    if (data.alqc_fecha_cancelacion && deposit?.ava_alquiler?.alq_fechapago) {
      const cancelDate = new Date(data.alqc_fecha_cancelacion);
      const rentStart = new Date(deposit.ava_alquiler.alq_fechapago);
      if (cancelDate < rentStart) {
        throw new Error(
          "La fecha de cancelación no puede ser anterior al inicio del alquiler."
        );
      }
    }

    try {
      const token = cookie.get("token");
      const response = await axios.put(
        `/api/accounting/canceledrent/${alqId}`,
        {
          ...data,
          depo_fechadevolucion: new Date(
            `${data.depo_fechadevolucion}T00:00:00`
          ).toISOString(),
          alqc_fecha_cancelacion: new Date(
            `${data.alqc_fecha_cancelacion}T00:00:00`
          ).toISOString(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response?.data?.success) {
        throw new Error(response?.data?.error || "Error desconocido");
      }

      form.reset();
    } catch (error: any) {
      throw new Error(error.message || "Error al cancelar el alquiler");
    }
  };

  return { form, handleCancelSubmit, isSubmitting };
};
