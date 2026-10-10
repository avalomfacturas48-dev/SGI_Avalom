"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isMontoEntero, MONTO_ENTERO_MSG } from "@/lib/schemas/formFields";
import axios from "axios";
import useRentalStore from "@/lib/zustand/useRentalStore";
import { Cliente } from "@/lib/types";
import { format, toDate, toZonedTime } from "date-fns-tz";
import { convertToCostaRicaTime, convertToUTCSV } from "@/utils/dateUtils";

const rentalFormSchema = z.object({
  alq_monto: z.string().refine((value) => isMontoEntero(value) && Number(value) > 0, {
    message: `${MONTO_ENTERO_MSG}, mayor a 0`,
  }),
  alq_fechapago: z.string(),
  alq_estado: z.enum(["A", "F", "C"]),
});

export type RentalFormInputs = z.infer<typeof rentalFormSchema>;

export const useRentalForm = ({
  action,
  onSuccess,
}: {
  action: string;
  onSuccess: () => void;
}) => {
  const {
    selectedRental,
    setSelectedRental,
    monthlyRents,
    setRents,
    addRent,
    updateRent,
    deleteRent,
  } = useRentalStore();

  const [clientsInRental, setClientsInRental] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPayments, setHasPayments] = useState(false);

  const fetchHasPayments = async (alqId: string) => {
    try {
      const response = await axios.get(`/api/rent/haspayments/${alqId}`);

      if (response?.data?.success) {
        setHasPayments(response.data.data.hasPayments);
      }
    } catch (error) {
      console.error("Error verificando pagos del alquiler:", error);
    }
  };

  const getAlqEstado = (value: string | undefined): "A" | "F" | "C" => {
    if (["A", "F", "C"].includes(value || "")) {
      return value as "A" | "F" | "C";
    }
    return "A";
  };

  const defaultValues: RentalFormInputs = useMemo(() => {
    return selectedRental
      ? {
          alq_monto: selectedRental.alq_monto?.toString() || "0",
          alq_fechapago: selectedRental?.alq_fechapago
            ? convertToCostaRicaTime(selectedRental.alq_fechapago)
            : "",
          alq_estado: getAlqEstado(selectedRental?.alq_estado),
        }
      : {
          alq_monto: "0",
          alq_fechapago: "",
          alq_estado: "A",
        };
  }, [selectedRental]);

  const form = useForm<RentalFormInputs>({
    resolver: zodResolver(rentalFormSchema),
    defaultValues,
  });

  const { handleSubmit, reset } = form;

  useEffect(() => {
    if (selectedRental) {
      reset(defaultValues);
      setClientsInRental(
        selectedRental.ava_clientexalquiler?.map((rel) => rel.ava_cliente) || []
      );
      setRents("monthlyRents", selectedRental.ava_alquilermensual || []);
      fetchHasPayments(selectedRental.alq_id);
    }
  }, [selectedRental, reset, defaultValues, setRents]);

  const onSubmit: SubmitHandler<RentalFormInputs> = async (formData) => {
    try {
      setIsLoading(true);


      let response;
      if (selectedRental?.alq_id) {
        response = await axios.put(
          `/api/rent/${selectedRental.alq_id}`,
          {
            ...formData,
            alq_fechapago: formData.alq_fechapago
              ? convertToUTCSV(formData.alq_fechapago)
              : null,
            ava_clientexalquiler: clientsInRental.map((c) => ({
              cli_id: c.cli_id,
            })),
          }
        );
      }

      if (response?.data?.success) {
        setSelectedRental(response.data.data);
        onSuccess();
      } else {
        throw new Error(response?.data?.error || "Error desconocido");
      }
    } catch (error: any) {
      throw new Error(error.message || "Error en el envío del formulario");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClientSelect = (client: Cliente) => {
    if (client && !clientsInRental.some((c) => c.cli_id === client.cli_id)) {
      setClientsInRental((prev) => [...prev, client]);
    }
  };

  const handleClientRemove = (clientId: string) => {
    setClientsInRental((prev) =>
      prev.filter((client) => client.cli_id !== clientId)
    );
  };

  const handleClear = () => {
    reset({
      alq_monto: "0",
      alq_fechapago: "",
      alq_estado: "A",
    });
    setClientsInRental([]);
    setSelectedRental(null);
    setRents("monthlyRents", []);
  };

  const isFormDisabled = action === "view";
  const disableEstadoField = action === "edit" && hasPayments;

  return {
    form,
    handleSubmit,
    onSubmit,
    handleClear,
    clientsInRental,
    handleClientSelect,
    handleClientRemove,
    isLoading,
    selectedRental,
    isFormDisabled,
    disableEstadoField,
  };
};
