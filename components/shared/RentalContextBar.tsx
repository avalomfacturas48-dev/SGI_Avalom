"use client";

import { Building2, Home, User, Wallet, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "./StatusBadge";
import { AvaAlquiler } from "@/lib/types";
import { formatCurrencyNoDecimals } from "@/utils/currencyConverter";
import { getPrimaryTenant, getClientFullName, getRentalTenants } from "@/utils/rentalHelpers";

interface RentalContextBarProps {
  rental?: AvaAlquiler | null;
}

interface ContextItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
}

function ContextItem({ icon: Icon, label, value }: ContextItemProps) {
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </p>
        <div className="text-sm font-semibold text-foreground truncate">
          {value}
        </div>
      </div>
    </div>
  );
}

/**
 * Barra de contexto del alquiler para pantallas de detalle
 * (Realizar movimiento / Modificar alquiler). Deja claro a qué
 * edificio, propiedad e inquilino pertenece el alquiler.
 *
 * Requiere que el alquiler venga con ava_propiedad (+ ava_edificio,
 * ava_tipopropiedad) y ava_clientexalquiler.ava_cliente incluidos.
 */
export function RentalContextBar({ rental }: RentalContextBarProps) {
  if (!rental) return null;

  const edificio = rental.ava_propiedad?.ava_edificio?.edi_identificador;
  const propiedad = rental.ava_propiedad?.prop_identificador;
  const tipo = rental.ava_propiedad?.ava_tipopropiedad?.tipp_nombre;
  const tenants = getRentalTenants(rental);
  const primary = getPrimaryTenant(rental);
  const monto = Number(rental.alq_monto);

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <ContextItem
            icon={Building2}
            label="Edificio"
            value={edificio || "—"}
          />
          <ContextItem
            icon={Home}
            label="Propiedad"
            value={propiedad || "—"}
          />
          <ContextItem
            icon={Tag}
            label="Tipo"
            value={
              tipo ? <span className="capitalize">{tipo}</span> : "—"
            }
          />
          <ContextItem
            icon={User}
            label="Inquilino"
            value={
              primary ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="truncate">{getClientFullName(primary)}</span>
                  {tenants.length > 1 && (
                    <Badge variant="secondary" className="flex-shrink-0">
                      +{tenants.length - 1}
                    </Badge>
                  )}
                </span>
              ) : (
                <span className="text-muted-foreground italic font-normal">
                  Sin inquilino
                </span>
              )
            }
          />
          <ContextItem
            icon={Wallet}
            label="Monto mensual"
            value={
              <span className="flex items-center gap-2">
                {formatCurrencyNoDecimals(monto)}
                <StatusBadge status={rental.alq_estado} />
              </span>
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default RentalContextBar;
