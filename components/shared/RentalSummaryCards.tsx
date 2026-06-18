"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Flag, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RentalSummaryCardsProps {
  activeCount: number;
  finishedCount: number;
  canceledCount: number;
  /** Filtro de estado actualmente activo (array de códigos). */
  statusFilter?: string[];
  /** Si se pasa, las tarjetas se vuelven clicables y filtran por estado. */
  onFilter?: (status: string[]) => void;
}

const CARDS = [
  {
    status: "A",
    label: "Activos",
    icon: CheckCircle2,
    text: "text-emerald-600",
    dot: "bg-emerald-500",
    bg: "bg-emerald-500/10",
    ring: "ring-emerald-500/40",
  },
  {
    status: "F",
    label: "Finalizados",
    icon: Flag,
    text: "text-blue-600",
    dot: "bg-blue-500",
    bg: "bg-blue-500/10",
    ring: "ring-blue-500/40",
  },
  {
    status: "C",
    label: "Cancelados",
    icon: XCircle,
    text: "text-red-600",
    dot: "bg-red-500",
    bg: "bg-red-500/10",
    ring: "ring-red-500/40",
  },
] as const;

/**
 * Tarjetas de resumen de alquileres (Activos / Finalizados / Cancelados).
 * Reutilizadas en Alquileres y Contabilidad. Si se pasa `onFilter`, al hacer
 * clic en una tarjeta se filtra la tabla por ese estado (toggle).
 */
export function RentalSummaryCards({
  activeCount,
  finishedCount,
  canceledCount,
  statusFilter = [],
  onFilter,
}: RentalSummaryCardsProps) {
  const counts: Record<string, number> = {
    A: activeCount,
    F: finishedCount,
    C: canceledCount,
  };

  const clickable = typeof onFilter === "function";

  const handleClick = (status: string) => {
    if (!onFilter) return;
    const isOnlyThis =
      statusFilter.length === 1 && statusFilter[0] === status;
    onFilter(isOnlyThis ? [] : [status]);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {CARDS.map((card) => {
        const Icon = card.icon;
        const isActive =
          statusFilter.length === 1 && statusFilter[0] === card.status;
        return (
          <Card
            key={card.status}
            onClick={() => handleClick(card.status)}
            role={clickable ? "button" : undefined}
            tabIndex={clickable ? 0 : undefined}
            onKeyDown={(e) => {
              if (clickable && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                handleClick(card.status);
              }
            }}
            className={cn(
              "border shadow-sm transition-all",
              clickable && "cursor-pointer hover:shadow-md",
              isActive && `ring-2 ${card.ring}`
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {card.label}
                  </p>
                  <p className={cn("text-3xl font-bold", card.text)}>
                    {counts[card.status]}
                  </p>
                </div>
                <div className={cn("p-3 rounded-full", card.bg)}>
                  <Icon className={cn("h-6 w-6", card.text)} />
                </div>
              </div>
              {clickable && (
                <p className="text-[11px] text-muted-foreground mt-2">
                  {isActive ? "Mostrando solo estos · clic para ver todos" : "Clic para filtrar"}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default RentalSummaryCards;
