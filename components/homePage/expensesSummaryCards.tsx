"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarIcon, WrenchIcon, ZapIcon } from "lucide-react";

interface ExpensesSummary {
  total: number;
  monthly: number;
  yearly: number;
  services: number;
  maintenance: number;
}

interface ExpensesSummaryCardsProps {
  data?: ExpensesSummary;
  loading?: boolean;
  formatCurrency?: (value: number) => string;
  compact?: boolean;
}

export function ExpensesSummaryCards({
  data,
  loading = false,
  formatCurrency = (value) =>
    new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: "CRC",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value),
  compact = false,
}: ExpensesSummaryCardsProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const cards = [
    {
      id: "monthly",
      title: "Gastos del Mes",
      icon: CalendarIcon,
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-950",
      ringColor: "ring-orange-500/30",
      value: data?.monthly || 0,
    },
    {
      id: "services",
      title: "Servicios",
      icon: ZapIcon,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950",
      ringColor: "ring-blue-500/30",
      value: data?.services || 0,
    },
    {
      id: "maintenance",
      title: "Mantenimiento",
      icon: WrenchIcon,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950",
      ringColor: "ring-purple-500/30",
      value: data?.maintenance || 0,
    },
  ];

  if (compact) {
    const formatCompact = (value: number) => {
      const abs = Math.abs(value);
      if (abs >= 1_000_000) return `₡${(abs / 1_000_000).toFixed(1)}M`;
      if (abs >= 1_000) return `₡${Math.round(abs / 1_000)}K`;
      return `₡${abs}`;
    };

    return (
      <div className="grid grid-cols-3 gap-2">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link href="/expenses" key={card.id} className="block">
              <Card
                className={`group cursor-pointer hover:shadow-md transition-all duration-200 ${
                  hoveredCard === card.id ? `ring-2 ${card.ringColor}` : ""
                }`}
                onMouseEnter={() => setHoveredCard(card.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <CardContent className="p-2.5 flex flex-col items-center text-center gap-1">
                  <div className={`flex items-center justify-center w-6 h-6 rounded-md ${card.bgColor} shrink-0`}>
                    <Icon className={`w-3 h-3 ${card.color}`} />
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-tight w-full truncate">
                    {card.title}
                  </p>
                  {loading ? (
                    <Skeleton className="h-4 w-12" />
                  ) : (
                    <p className="text-sm font-bold text-foreground leading-tight">
                      {formatCompact(Number(card.value))}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Link href="/expenses" key={card.id} className="block h-full">
            <Card
              className={`relative group h-full overflow-hidden border-2 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer ${
                hoveredCard === card.id ? `ring-2 ${card.ringColor}` : ""
              }`}
              onMouseEnter={() => setHoveredCard(card.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-xl ${card.bgColor} group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                  {card.title}
                </h3>
                <div className="text-2xl font-bold text-foreground">
                  {loading ? (
                    <Skeleton className="h-7 w-24" />
                  ) : (
                    formatCurrency(Number(card.value))
                  )}
                </div>
                <div
                  className={`absolute bottom-0 left-0 right-0 h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left ${card.color.replace("text-", "bg-")}`}
                />
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

export default ExpensesSummaryCards;
