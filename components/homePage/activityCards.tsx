"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  HomeIcon,
  UsersIcon,
  FilePenIcon,
  TrendingUpIcon,
  Receipt,
} from "lucide-react";

interface ActivityCardsProps {
  loading?: boolean;
  formatCurrency?: (value: number) => string;
  totalProperties?: number;
  totalClients?: number;
  activeRentals?: number;
  monthlyRevenue?: number;
  monthlyExpenses?: number;
}

export function ActivityCards({
  loading = false,
  formatCurrency = (value) =>
    new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: "CRC",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value),
  totalProperties = 0,
  totalClients = 0,
  activeRentals = 0,
  monthlyRevenue = 0,
  monthlyExpenses = 0,
}: ActivityCardsProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const countCards = [
    {
      id: "properties",
      title: "Propiedades",
      icon: HomeIcon,
      color: "text-indigo-500",
      bgColor: "bg-indigo-50 dark:bg-indigo-950",
      ringColor: "ring-indigo-500/30",
      value: totalProperties,
      href: "/mantBuild",
    },
    {
      id: "clients",
      title: "Clientes",
      icon: UsersIcon,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-950",
      ringColor: "ring-green-500/30",
      value: totalClients,
      href: "/mantClient",
    },
    {
      id: "activeRentals",
      title: "Alquileres",
      icon: FilePenIcon,
      color: "text-amber-500",
      bgColor: "bg-amber-50 dark:bg-amber-950",
      ringColor: "ring-amber-500/30",
      value: activeRentals,
      href: "/mantRent",
    },
  ];

  const revenueCard = {
    id: "monthlyRevenue",
    title: "Ingresos del Mes",
    icon: TrendingUpIcon,
    color: "text-emerald-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-950",
    ringColor: "ring-emerald-500/30",
    value: monthlyRevenue,
    href: "/accounting",
    isMonetary: true,
  };

  const gastosCard = {
    id: "monthlyExpenses",
    title: "Gastos del Mes",
    icon: Receipt,
    color: "text-rose-500",
    bgColor: "bg-rose-50 dark:bg-rose-950",
    ringColor: "ring-rose-500/30",
    value: monthlyExpenses,
    href: "/expenses",
    isMonetary: true,
  };

  const cardClass = (id: string, ringColor: string) =>
    `relative group h-full overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${
      hoveredCard === id ? `ring-2 ${ringColor}` : ""
    }`;

  return (
    <div className="space-y-2 sm:space-y-0">
      {/* Móvil: 3 compactos + 1 ancho */}
      <div className="sm:hidden space-y-2">
        <div className="grid grid-cols-3 gap-2">
          {countCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link href={card.href} key={card.id} className="block h-full">
                <Card
                  className={cardClass(card.id, card.ringColor)}
                  onMouseEnter={() => setHoveredCard(card.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <CardContent className="p-2.5">
                    <div className="flex items-center gap-1 mb-1.5">
                      <div className={`flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-md ${card.bgColor}`}>
                        <Icon className={`w-3 h-3 ${card.color}`} />
                      </div>
                      <span className="text-[10px] font-medium text-muted-foreground truncate">
                        {card.title}
                      </span>
                    </div>
                    {loading ? (
                      <Skeleton className="h-6 w-8" />
                    ) : (
                      <p className="text-2xl font-bold text-foreground leading-none">
                        {card.value}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Revenue + Gastos: anchos completos apilados */}
        {[revenueCard, gastosCard].map((card) => {
          const Icon = card.icon;
          return (
            <Link href={card.href} key={card.id} className="block">
              <Card
                className={cardClass(card.id, card.ringColor)}
                onMouseEnter={() => setHoveredCard(card.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg ${card.bgColor}`}>
                      <Icon className={`w-4 h-4 ${card.color}`} />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                      {card.title}
                    </span>
                  </div>
                  {loading ? (
                    <Skeleton className="h-7 w-28" />
                  ) : (
                    <p className="text-xl font-bold text-foreground">
                      {formatCurrency(card.value)}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Tablet: 2x2+1 — Desktop (lg+): los 5 en fila */}
      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[...countCards, revenueCard, gastosCard].map((card) => {
          const Icon = card.icon;
          return (
            <Link href={card.href} key={card.id} className="block h-full">
              <Card
                className={cardClass(card.id, card.ringColor)}
                onMouseEnter={() => setHoveredCard(card.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg ${card.bgColor}`}>
                      <Icon className={`w-4 h-4 ${card.color}`} />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground leading-tight">
                      {card.title}
                    </span>
                  </div>
                  {loading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <p className="text-2xl font-bold text-foreground truncate">
                      {"isMonetary" in card ? formatCurrency(card.value) : card.value}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default ActivityCards;
