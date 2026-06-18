"use client";

import { User } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { AvaAlquiler } from "@/lib/types";
import {
  getClientFullName,
  getClientInitials,
  getRentalTenants,
} from "@/utils/rentalHelpers";

interface TenantCellProps {
  rental: AvaAlquiler;
}

/**
 * Celda de tabla que muestra el inquilino principal de un alquiler
 * (avatar de iniciales + nombre + cédula). Si hay más de un inquilino,
 * muestra un badge con el total y los lista en un tooltip.
 */
export function TenantCell({ rental }: TenantCellProps) {
  const tenants = getRentalTenants(rental);
  const primary = tenants[0];

  if (!primary) {
    return (
      <span className="text-muted-foreground text-sm italic">Sin inquilino</span>
    );
  }

  const extra = tenants.length - 1;

  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
        <span className="text-xs font-semibold text-primary">
          {getClientInitials(primary)}
        </span>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {getClientFullName(primary)}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {primary.cli_cedula}
        </p>
      </div>
      {extra > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="secondary" className="ml-1 flex-shrink-0">
                +{extra}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <ul className="space-y-1">
                {tenants.slice(1).map((t) => (
                  <li key={t.cli_id} className="text-xs">
                    {getClientFullName(t)}
                  </li>
                ))}
              </ul>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}

/** Versión compacta que solo muestra el icono + nombre (sin avatar). */
export function TenantInline({ rental }: TenantCellProps) {
  const tenants = getRentalTenants(rental);
  const primary = tenants[0];

  if (!primary) {
    return (
      <span className="text-muted-foreground text-sm italic inline-flex items-center gap-1">
        <User className="h-3.5 w-3.5" /> Sin inquilino
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <User className="h-3.5 w-3.5 text-muted-foreground" />
      {getClientFullName(primary)}
      {tenants.length > 1 && (
        <Badge variant="secondary" className="ml-1">
          +{tenants.length - 1}
        </Badge>
      )}
    </span>
  );
}

export default TenantCell;
