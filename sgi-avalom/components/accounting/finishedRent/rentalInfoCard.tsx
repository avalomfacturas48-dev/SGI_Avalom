"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import useRentalStore from "@/lib/zustand/useRentalStore";
import { format } from "date-fns";

export const RentalInfoCard = () => {
  const { selectedRental, deposit } = useRentalStore();

  if (!selectedRental || !deposit) return null;

  const propiedad = selectedRental.ava_propiedad;
  const clientes = selectedRental.ava_clientexalquiler.map(c => c.ava_cliente);
  const clienteNombre = clientes.map(c => `${c.cli_nombre} ${c.cli_papellido}`).join(", ");

  return (
    <Card className="bg-muted/40 border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg sm:text-xl font-semibold">
          Información del Alquiler
        </CardTitle>
      </CardHeader>

      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 sm:gap-x-8 text-sm sm:text-base text-muted-foreground">
        <InfoItem label="Propiedad" value={propiedad?.prop_identificador || "Sin identificar"} />
        <InfoItem label="Cliente(s)" value={clienteNombre} />
        <InfoItem label="Monto Alquiler" value={`₡${selectedRental.alq_monto}`} />
        <InfoItem label="Estado" value={getEstadoNombre(selectedRental.alq_estado)} />
        <InfoItem label="Fecha de Pago" value={format(new Date(selectedRental.alq_fechapago), "dd/MM/yyyy")} />
        <InfoItem label="Fecha de Creación" value={format(new Date(selectedRental.alq_fechacreacion!), "dd/MM/yyyy")} />
        <InfoItem label="Depósito Total" value={`₡${deposit.depo_total}`} />
        <InfoItem label="Depósito Actual" value={`₡${deposit.depo_montoactual}`} />
      </CardContent>
    </Card>
  );
};

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col">
    <span className="text-xs uppercase font-semibold text-muted-foreground tracking-wide">{label}</span>
    <span className="text-foreground font-medium">{value}</span>
  </div>
);

const getEstadoNombre = (estado: string) => {
  switch (estado) {
    case "A":
      return "Activo";
    case "F":
      return "Finalizado";
    case "C":
      return "Cancelado";
    default:
      return "Desconocido";
  }
};
