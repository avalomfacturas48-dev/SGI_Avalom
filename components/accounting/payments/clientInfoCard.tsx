"use client";

import type React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Phone, Mail, CreditCard, MapPin, Heart } from "lucide-react";
import { Cliente } from "@/lib/types";

interface ClientInfoCardProps {
  cliente: Cliente;
  className?: string;
}

export const ClientInfoCard: React.FC<ClientInfoCardProps> = ({
  cliente,
  className = "",
}) => {
  const getFullName = () =>
    `${cliente.cli_nombre} ${cliente.cli_papellido} ${cliente.cli_sapellido || ""}`.trim();

  const getFormattedPhone = () => {
    const phone = cliente.cli_telefono;
    if (!phone) return "—";
    if (phone.length === 8) return `${phone.slice(0, 4)}-${phone.slice(4)}`;
    return phone;
  };

  const fields = [
    { icon: CreditCard, label: "Cédula", value: cliente.cli_cedula },
    { icon: Phone, label: "Teléfono", value: getFormattedPhone() },
    { icon: Mail, label: "Correo", value: cliente.cli_correo || "—" },
    ...(cliente.cli_direccion && cliente.cli_direccion !== "n/a"
      ? [{ icon: MapPin, label: "Dirección", value: cliente.cli_direccion }]
      : []),
    ...(cliente.cli_estadocivil && cliente.cli_estadocivil !== "n/a"
      ? [{ icon: Heart, label: "Estado civil", value: cliente.cli_estadocivil }]
      : []),
  ];

  return (
    <Card className={`w-full border shadow-md ${className}`}>
      <CardHeader className="py-3 px-4 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-primary" />
            Información del Cliente
          </CardTitle>
          <Badge variant="outline" className="text-[10px] font-mono">
            ID {cliente.cli_id}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="px-4 py-3 space-y-2.5">
        <p className="text-sm font-bold text-foreground">{getFullName()}</p>

        <div className="divide-y divide-border">
          {fields.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-2 py-1.5 min-w-0">
              <Icon className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                {label}
              </span>
              <span className="ml-auto text-xs font-medium text-foreground truncate text-right pl-2 min-w-0">
                {value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
