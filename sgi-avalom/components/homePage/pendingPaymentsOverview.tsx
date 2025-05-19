"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  AlertCircleIcon,
  BanknoteIcon as BankIcon,
  ArrowRightIcon,
} from "lucide-react";

interface MensualidadPendiente {
  alqm_id: string;
  alqm_identificador: string;
  alqm_fechainicio: string;
  alqm_fechafin: string;
  alqm_montototal: number;
  alqm_montopagado: number;
  ava_alquiler: {
    alq_id: string;
    prop_id: string;
    ava_propiedad: {
      prop_identificador: string;
    };
  };
}

interface DepositoPendiente {
  depo_id: string;
  depo_montoactual: number;
  depo_total: number;
  depo_fechacreacion: string;
  ava_alquiler: {
    alq_id: string;
    prop_id: string;
    ava_propiedad: {
      prop_identificador: string;
    };
  };
}

interface PendingPaymentsData {
  totals: {
    mensualidadesImpagas: number;
    depositosPendientes: number;
  };
  mensualidadesPendientes: MensualidadPendiente[];
  depositosPendientesList: DepositoPendiente[];
}

interface PendingPaymentsOverviewProps {
  data?: PendingPaymentsData;
  loading?: boolean;
  formatCurrency?: (value: number) => string;
  mensualidadesRoute?: string;
  depositosRoute?: string;
  mensualidadDetailRoute?: string;
  depositoDetailRoute?: string;
}

export function PendingPaymentsOverview({
  data,
  loading = false,
  formatCurrency = (value) =>
    new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: "CRC",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value),
  mensualidadesRoute = "/accounting",
  depositosRoute = "/accounting",
  mensualidadDetailRoute = "/accounting/payments/payment",
  depositoDetailRoute = "/accounting/payments/depositpayment",
}: PendingPaymentsOverviewProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const summaryCards = [
    {
      id: "mensualidades",
      title: "Mensualidades Impagas",
      icon: AlertCircleIcon,
      color: "text-amber-500",
      bgColor: "bg-amber-50",
      ringColor: "ring-amber-500/30",
      value: data?.totals.mensualidadesImpagas || 0,
      route: mensualidadesRoute,
    },
    {
      id: "depositos",
      title: "Depósitos Pendientes",
      icon: BankIcon,
      color: "text-emerald-500",
      bgColor: "bg-emerald-50",
      ringColor: "ring-emerald-500/30",
      value: data?.totals.depositosPendientes || 0,
      route: depositosRoute,
    },
  ];

  console.log("PendingPaymentsOverview data", data);

  return (
    <div className="space-y-6">
      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <Link href={card.route} key={card.id}>
              <Card
                className={`relative group h-full overflow-hidden border--border/40 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer ${
                  hoveredCard === card.id ? `ring-2 ${card.ringColor}` : ""
                }`}
                onMouseEnter={() => setHoveredCard(card.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div
                  className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                />

                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-full ${card.bgColor} group-hover:bg-white/20 transition-colors duration-300`}
                    >
                      <Icon
                        className={`w-6 h-6 ${card.color}  transition-colors duration-300`}
                      />
                    </div>
                    <div className="flex items-center">
                      <span className="text-3xl font-bold  transition-colors duration-300">
                        {loading ? (
                          <Skeleton className="h-8 w-16" />
                        ) : (
                          card.value
                        )}
                      </span>
                      <ArrowRightIcon className="ml-2 w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 " />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium  transition-colors duration-300">
                    {card.title}
                  </h3>

                  <div
                    className={`absolute bottom-0 left-0 right-0 h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left bg-${
                      card.color.split("-")[1]
                    }-500`}
                  />
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Tabs para las listas de pendientes */}
      <Card>
        <CardHeader>
          <CardTitle>Pagos Pendientes</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="mensualidades">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="mensualidades">Mensualidades</TabsTrigger>
              <TabsTrigger value="depositos">Depósitos</TabsTrigger>
            </TabsList>

            {/* Tab de Mensualidades Pendientes */}
            <TabsContent value="mensualidades" className="mt-4">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    ))
                  ) : data?.mensualidadesPendientes &&
                    data.mensualidadesPendientes.length > 0 ? (
                    data.mensualidadesPendientes.map((item) => (
                      <Link
                        href={`${mensualidadDetailRoute}/${item.alqm_id}`}
                        key={item.alqm_id}
                      >
                        <div className="m-2 p-4 rounded-lg border border-border/50 hover:border-amber-300 hover:bg-amber-50/30 transition-colors duration-200">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-medium">
                                {item.alqm_identificador}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Propiedad:{" "}
                                {
                                  item.ava_alquiler.ava_propiedad
                                    .prop_identificador
                                }
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className="bg-emerald-50 text-emerald-700 border-emerald-200"
                            >
                              Pagado: {formatCurrency(item.alqm_montopagado)}
                            </Badge>
                            <ArrowRightIcon className="ml-2 w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 " />
                            <Badge
                              variant="outline"
                              className="bg-emerald-50 text-emerald-700 border-emerald-200"
                            >
                              Total: {formatCurrency(item.alqm_montototal)}
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>
                                Período:{" "}
                                {format(
                                  new Date(item.alqm_fechainicio),
                                  "d MMM",
                                  { locale: es }
                                )}{" "}
                                -{" "}
                                {format(
                                  new Date(item.alqm_fechafin),
                                  "d MMM yyyy",
                                  { locale: es }
                                )}
                              </span>
                              <span>
                                {Math.round(
                                  (item.alqm_montopagado /
                                    item.alqm_montototal) *
                                    100
                                )}
                                % pagado
                              </span>
                            </div>
                            <Progress
                              value={
                                (item.alqm_montopagado / item.alqm_montototal) *
                                100
                              }
                              className="h-2 bg-amber-100"
                              indicatorClassName="bg-amber-500"
                            />
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-40">
                      <p className="text-muted-foreground">
                        No hay mensualidades pendientes
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Tab de Depósitos Pendientes */}
            <TabsContent value="depositos" className="mt-4">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    ))
                  ) : data?.depositosPendientesList &&
                    data.depositosPendientesList.length > 0 ? (
                    data.depositosPendientesList.map((item) => (
                      <Link
                        href={`${depositoDetailRoute}/${item.depo_id}`}
                        key={item.depo_id}
                      >
                        <div className="m-2 p-4 rounded-lg border border-border/50 hover:border-emerald-300 hover:bg-emerald-50/30 transition-colors duration-200">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-medium">
                                Depósito #{item.depo_id}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Propiedad:{" "}
                                {
                                  item.ava_alquiler.ava_propiedad
                                    .prop_identificador
                                }
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className="bg-emerald-50 text-emerald-700 border-emerald-200"
                            >
                              Pagado: {formatCurrency(item.depo_montoactual)}
                            </Badge>
                            <ArrowRightIcon className="ml-2 w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 " />
                            <Badge
                              variant="outline"
                              className="bg-emerald-50 text-emerald-700 border-emerald-200"
                            >
                              Total: {formatCurrency(item.depo_total)}
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>
                                Creado:{" "}
                                {format(
                                  new Date(item.depo_fechacreacion),
                                  "d MMM yyyy",
                                  { locale: es }
                                )}
                              </span>
                              <span>
                                {Math.round(
                                  (item.depo_montoactual / item.depo_total) *
                                    100
                                )}
                                % completado
                              </span>
                            </div>
                            <Progress
                              value={
                                (item.depo_montoactual / item.depo_total) * 100
                              }
                              className="h-2 bg-emerald-100"
                              indicatorClassName="bg-emerald-500"
                            />
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-40">
                      <p className="text-muted-foreground">
                        No hay depósitos pendientes
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default PendingPaymentsOverview;
