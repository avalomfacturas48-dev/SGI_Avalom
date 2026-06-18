"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import cookie from "js-cookie";
import { useRouter } from "next/navigation";
import { AvaEdificio, AvaPropiedad, Cliente } from "@/lib/types";
import { convertToUTCSV } from "@/utils/dateUtils";

const schema = z.object({
  alq_monto: z
    .string()
    .min(1, "El monto es requerido")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, {
      message: "Monto inválido",
    }),
  alq_fechapago: z.string().min(1, "La fecha de pago es requerida"),
  alq_estado: z.enum(["A", "F", "C"]),
});

export type NewRentFormInputs = z.infer<typeof schema>;

export function useNewRentWizard() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [buildings, setBuildings] = useState<AvaEdificio[]>([]);
  const [loadingBuildings, setLoadingBuildings] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<AvaEdificio | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<AvaPropiedad | null>(null);
  const [clients, setClients] = useState<Cliente[]>([]);
  const [clientsInRental, setClientsInRental] = useState<Cliente[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<NewRentFormInputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      alq_monto: "100000",
      alq_fechapago: "",
      alq_estado: "A",
    },
  });

  const fetchBuildings = async () => {
    setLoadingBuildings(true);
    try {
      const token = cookie.get("token");
      if (!token) return;
      const res = await axios.get("/api/building", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.data) setBuildings(res.data.data);
    } finally {
      setLoadingBuildings(false);
    }
  };

  const fetchClients = async () => {
    try {
      const token = cookie.get("token");
      if (!token) return;
      const res = await axios.get("/api/client", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClients(res.data.data ?? []);
    } catch {
      // silently fail — combobox stays empty
    }
  };

  const selectBuilding = (building: AvaEdificio) => {
    setSelectedBuilding(building);
    setSelectedProperty(null);
    setStep(2);
  };

  const selectProperty = (property: AvaPropiedad) => {
    setSelectedProperty(property);
    fetchClients();
    setStep(3);
  };

  const goBack = () => {
    if (step === 2) {
      setSelectedBuilding(null);
      setStep(1);
    } else if (step === 3) {
      setSelectedProperty(null);
      setStep(2);
    }
  };

  const handleClientSelect = (client: Cliente) => {
    if (
      client &&
      clientsInRental.length < 2 &&
      !clientsInRental.some((c) => c.cli_id === client.cli_id)
    ) {
      setClientsInRental((prev) => [...prev, client]);
    }
  };

  const handleClientRemove = (cliId: string) => {
    setClientsInRental((prev) => prev.filter((c) => c.cli_id !== cliId));
  };

  const onSubmit: SubmitHandler<NewRentFormInputs> = async (formData) => {
    if (!selectedProperty) return;
    setIsSubmitting(true);
    try {
      const token = cookie.get("token");
      if (!token) throw new Error("Token no disponible");

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const createRes = await axios.post(
        "/api/rent",
        {
          alq_monto: Number(formData.alq_monto),
          alq_fechapago: formData.alq_fechapago
            ? convertToUTCSV(formData.alq_fechapago)
            : null,
          alq_estado: formData.alq_estado,
          prop_id: selectedProperty.prop_id,
        },
        { headers }
      );

      if (!createRes.data.success) {
        throw new Error(createRes.data.error ?? "Error al crear el alquiler");
      }

      const alqId = createRes.data.data.alq_id;

      if (clientsInRental.length > 0) {
        await axios.put(
          `/api/rent/${alqId}`,
          {
            alq_monto: Number(formData.alq_monto),
            alq_fechapago: formData.alq_fechapago
              ? convertToUTCSV(formData.alq_fechapago)
              : null,
            alq_estado: formData.alq_estado,
            ava_clientexalquiler: clientsInRental.map((c) => ({
              cli_id: c.cli_id,
            })),
          },
          { headers }
        );
      }

      router.push(`/mantRent/edit/${alqId}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableProperties = (selectedBuilding?.ava_propiedad ?? []).filter(
    (p) => !p.ava_alquiler?.some((a) => a.alq_estado === "A")
  );

  return {
    step,
    buildings,
    loadingBuildings,
    selectedBuilding,
    selectedProperty,
    clients,
    clientsInRental,
    isSubmitting,
    form,
    availableProperties,
    fetchBuildings,
    selectBuilding,
    selectProperty,
    goBack,
    handleClientSelect,
    handleClientRemove,
    onSubmit,
  };
}
