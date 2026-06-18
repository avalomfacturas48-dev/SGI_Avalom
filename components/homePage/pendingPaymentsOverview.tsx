"use client";

import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircleIcon,
  BanknoteIcon as BankIcon,
  ArrowRightIcon,
} from "lucide-react";

interface ClientePendiente {
  cli_nombre: string;
  cli_papellido: string;
}

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
    ava_propiedad: { prop_identificador: string };
    ava_clientexalquiler: { ava_cliente: ClientePendiente }[];
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
    ava_propiedad: { prop_identificador: string };
    ava_clientexalquiler: { ava_cliente: ClientePendiente }[];
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
}

type FilaUnificada =
  | { tipo: "mensualidad"; item: MensualidadPendiente; fecha: string }
  | { tipo: "deposito"; item: DepositoPendiente; fecha: string };

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
}: PendingPaymentsOverviewProps) {
  const summaryCards = [
    {
      id: "mensualidades",
      title: "Mensualidades Impagas",
      icon: AlertCircleIcon,
      color: "text-amber-500",
      bgColor: "bg-amber-50 dark:bg-amber-950",
      value: data?.totals.mensualidadesImpagas ?? 0,
      href: "/accounting",
    },
    {
      id: "depositos",
      title: "Depósitos Pendientes",
      icon: BankIcon,
      color: "text-emerald-500",
      bgColor: "bg-emerald-50 dark:bg-emerald-950",
      value: data?.totals.depositosPendientes ?? 0,
      href: "/accounting",
    },
  ];

  const filas: FilaUnificada[] = [
    ...(data?.mensualidadesPendientes ?? []).map(
      (item): FilaUnificada => ({
        tipo: "mensualidad",
        item,
        fecha: item.alqm_fechainicio,
      })
    ),
    ...(data?.depositosPendientesList ?? []).map(
      (item): FilaUnificada => ({
        tipo: "deposito",
        item,
        fecha: item.depo_fechacreacion,
      })
    ),
  ].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

  return (
    <div className="space-y-4">
      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link href={card.href} key={card.id}>
              <Card className="group cursor-pointer hover:shadow-md transition-all duration-200 h-full">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full ${card.bgColor}`}
                    >
                      <Icon className={`w-5 h-5 ${card.color}`} />
                    </div>
                    <span className="font-medium text-sm">{card.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">
                      {loading ? (
                        <Skeleton className="h-7 w-10" />
                      ) : (
                        card.value
                      )}
                    </span>
                    <ArrowRightIcon className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Tabla unificada */}
      <Card className="border shadow-lg">
        <CardHeader className="border-b pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold">Pagos Pendientes</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircleIcon className="w-4 h-4 text-amber-500" />
              Requieren atención
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : filas.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
              No hay pagos pendientes
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Tipo</TableHead>
                    <TableHead>Propiedad</TableHead>
                    <TableHead className="hidden md:table-cell">Cliente</TableHead>
                    <TableHead className="hidden sm:table-cell">Período</TableHead>
                    <TableHead className="text-right">Pendiente</TableHead>
                    <TableHead className="w-[80px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filas.map((fila) => {
                    if (fila.tipo === "mensualidad") {
                      const item = fila.item;
                      const pendiente =
                        item.alqm_montototal - item.alqm_montopagado;
                      const cliente =
                        item.ava_alquiler.ava_clientexalquiler[0]?.ava_cliente;
                      const periodo = `${format(new Date(item.alqm_fechainicio), "d MMM", { locale: es })} – ${format(new Date(item.alqm_fechafin), "d MMM yyyy", { locale: es })}`;
                      return (
                        <TableRow key={`m-${item.alqm_id}`}>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="bg-amber-500/10 text-amber-700 border-amber-400/40 text-xs"
                            >
                              Mensualidad
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium text-sm">
                            {item.ava_alquiler.ava_propiedad.prop_identificador}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                            {cliente
                              ? `${cliente.cli_nombre} ${cliente.cli_papellido}`
                              : "—"}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                            {periodo}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-amber-700 text-sm">
                            {formatCurrency(pendiente)}
                          </TableCell>
                          <TableCell>
                            <Button asChild size="sm" variant="ghost" className="h-7 px-2">
                              <Link
                                href={`/accounting/payments/payment/${item.alqm_id}`}
                              >
                                <ArrowRightIcon className="w-4 h-4" />
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    } else {
                      const item = fila.item;
                      const pendiente = item.depo_total - item.depo_montoactual;
                      const cliente =
                        item.ava_alquiler.ava_clientexalquiler[0]?.ava_cliente;
                      return (
                        <TableRow key={`d-${item.depo_id}`}>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="bg-emerald-500/10 text-emerald-700 border-emerald-400/40 text-xs"
                            >
                              Depósito
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium text-sm">
                            {item.ava_alquiler.ava_propiedad.prop_identificador}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                            {cliente
                              ? `${cliente.cli_nombre} ${cliente.cli_papellido}`
                              : "—"}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                            {format(
                              new Date(item.depo_fechacreacion),
                              "d MMM yyyy",
                              { locale: es }
                            )}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-emerald-700 text-sm">
                            {formatCurrency(pendiente)}
                          </TableCell>
                          <TableCell>
                            <Button asChild size="sm" variant="ghost" className="h-7 px-2">
                              <Link
                                href={`/accounting/payments/depositpayment/${item.depo_id}`}
                              >
                                <ArrowRightIcon className="w-4 h-4" />
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    }
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default PendingPaymentsOverview;
