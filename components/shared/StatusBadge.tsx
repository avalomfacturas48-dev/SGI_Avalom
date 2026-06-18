"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type RentalStatus = "A" | "F" | "C" | string;

const RENTAL_STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  A: {
    label: "Activo",
    className:
      "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-400",
  },
  F: {
    label: "Finalizado",
    className:
      "bg-blue-500/10 text-blue-700 border-blue-500/30 dark:text-blue-400",
  },
  C: {
    label: "Cancelado",
    className:
      "bg-red-500/10 text-red-700 border-red-500/30 dark:text-red-400",
  },
};

const FALLBACK = {
  label: "Desconocido",
  className: "bg-gray-500/10 text-gray-700 border-gray-500/30",
};

interface StatusBadgeProps {
  status: RentalStatus;
  className?: string;
}

/**
 * Badge unificado para el estado de un alquiler (A/F/C).
 * Centraliza la configuración que antes estaba duplicada en
 * columnsRent.tsx y columnsAccounting.tsx.
 */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = RENTAL_STATUS_CONFIG[status] ?? FALLBACK;

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}

export default StatusBadge;
