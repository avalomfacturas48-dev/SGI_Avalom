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
} from "lucide-react";

interface ActivityCardsProps {
  loading?: boolean;
  formatCurrency?: (value: number) => string;
  totalProperties?: number;
  totalClients?: number;
  activeRentals?: number;
  monthlyRevenue?: number;
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
}: ActivityCardsProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const kpiCards = [
    {
      id: "properties",
      title: "Propiedades",
      icon: HomeIcon,
      color: "text-indigo-500",
      bgColor: "bg-indigo-50 dark:bg-indigo-950",
      ringColor: "ring-indigo-500/30",
      value: totalProperties,
      type: "count" as const,
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
      type: "count" as const,
      href: "/mantClient",
    },
    {
      id: "activeRentals",
      title: "Alquileres Activos",
      icon: FilePenIcon,
      color: "text-amber-500",
      bgColor: "bg-amber-50 dark:bg-amber-950",
      ringColor: "ring-amber-500/30",
      value: activeRentals,
      type: "count" as const,
      href: "/mantRent",
    },
    {
      id: "monthlyRevenue",
      title: "Ingresos del Mes",
      icon: TrendingUpIcon,
      color: "text-emerald-500",
      bgColor: "bg-emerald-50 dark:bg-emerald-950",
      ringColor: "ring-emerald-500/30",
      value: monthlyRevenue,
      type: "currency" as const,
      href: "/accounting",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpiCards.map((card) => {
        const Icon = card.icon;
        return (
          <Link href={card.href} key={card.id} className="block h-full">
            <Card
              className={`relative group h-full overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${
                hoveredCard === card.id ? `ring-2 ${card.ringColor}` : ""
              }`}
              onMouseEnter={() => setHoveredCard(card.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`flex items-center justify-center w-9 h-9 rounded-lg ${card.bgColor} transition-colors`}
                  >
                    <Icon className={`w-4 h-4 ${card.color}`} />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground leading-tight">
                    {card.title}
                  </span>
                </div>
                {loading ? (
                  <Skeleton className="h-8 w-24" />
                ) : card.type === "currency" ? (
                  <p className="text-xl font-bold text-foreground">
                    {formatCurrency(card.value)}
                  </p>
                ) : (
                  <p className="text-3xl font-bold text-foreground">
                    {card.value}
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

export default ActivityCards;
