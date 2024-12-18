"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { toDate, toZonedTime } from "date-fns-tz";
import useRentalStore from "@/lib/zustand/useRentalStore";
import { AvaAlquilerMensual } from "@/lib/types";

const monthlyRentSchema = z.object({
  alqm_identificador: z.string().min(1, { message: "Identificador requerido" }),
  alqm_montototal: z
    .string()
    .refine((value) => !isNaN(Number(value)) && Number(value) > 0, {
      message: "El monto debe ser un número positivo",
    }),
  alqm_fechainicio: z.string().refine((value) => !!value, {
    message: "Fecha de inicio requerida",
  }),
  alqm_fechafin: z.string().refine((value) => !!value, {
    message: "Fecha de fin requerida",
  }),
  alqm_fechapago: z.string().optional(),
  alqm_estado: z.enum(["A", "P", "I"]),
});

export type MonthlyRentFormInputs = z.infer<typeof monthlyRentSchema>;

export const useMonthlyRentForm = ({
  alqm_id,
  onSuccess,
}: {
  alqm_id: string | null;
  onSuccess: () => void;
}) => {
  const { monthlyRents, updateMonthlyRent } = useRentalStore();
  const [rentId, setRentId] = useState<string | null>(alqm_id);
  const rent = useMemo(
    () => monthlyRents.find((r) => r.alqm_id === rentId),
    [rentId, monthlyRents]
  );

  const defaultValues = useMemo(() => {
    return rent
      ? {
          alqm_identificador: rent.alqm_identificador,
          alqm_montototal: rent.alqm_montototal.toString(),
          alqm_fechainicio: rent.alqm_fechainicio
            ? format(
                toDate(
                  toZonedTime(
                    new Date(rent.alqm_fechainicio),
                    "America/Costa_Rica"
                  )
                ),
                "yyyy-MM-dd"
              )
            : "",
          alqm_fechafin: rent.alqm_fechafin
            ? format(
                toDate(
                  toZonedTime(
                    new Date(rent.alqm_fechafin),
                    "America/Costa_Rica"
                  )
                ),
                "yyyy-MM-dd"
              )
            : "",
          alqm_fechapago: rent.alqm_fechapago
            ? format(
                toDate(
                  toZonedTime(
                    new Date(rent.alqm_fechapago),
                    "America/Costa_Rica"
                  )
                ),
                "yyyy-MM-dd"
              )
            : "",
          alqm_estado: rent.alqm_estado,
        }
      : {
          alqm_identificador: "",
          alqm_montototal: "",
          alqm_fechainicio: "",
          alqm_fechafin: "",
          alqm_fechapago: "",
          alqm_estado: "A" as "A" | "P" | "I",
        };
  }, [rent]);

  const form = useForm<MonthlyRentFormInputs>({
    resolver: zodResolver(monthlyRentSchema),
    defaultValues,
  });

  const { reset } = form;

  useEffect(() => {
    if (rent) {
      reset(defaultValues);
    }
  }, [rent, reset, defaultValues]);

  const onSubmit: SubmitHandler<MonthlyRentFormInputs> = (formData) => {
    if (!rent) return;

    const updatedRent: AvaAlquilerMensual = {
      ...rent,
      alqm_identificador: formData.alqm_identificador,
      alqm_montototal: formData.alqm_montototal,
      alqm_fechainicio: new Date(
        `${formData.alqm_fechainicio}T00:00:00`
      ).toISOString(),
      alqm_fechafin: new Date(
        `${formData.alqm_fechafin}T00:00:00`
      ).toISOString(),
      alqm_fechapago: formData.alqm_fechapago
        ? new Date(`${formData.alqm_fechapago}T00:00:00`).toISOString()
        : undefined,
      alqm_estado: formData.alqm_estado,
    };

    updateMonthlyRent(updatedRent);
    onSuccess();
  };

  return {
    form,
    handleSubmit: form.handleSubmit,
    onSubmit,
    setRentId,
  };
};
