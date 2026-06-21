"use client";

import React, { useEffect, useState } from "react";
import useRentalStore from "@/lib/zustand/useRentalStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  HandCoins,
  BanIcon,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpDown,
  Gift,
  History,
  Ban,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { formatToCR } from "@/utils/dateUtils";
import { cn } from "@/lib/utils";
import { StatusFilter } from "@/components/dataTable/status-filter";
import Link from "next/link";
import { formatCurrencyNoDecimals } from "@/utils/currencyConverter";
import { toast } from "sonner";
import AlertDialog from "@/components/alertDialog";
import { AvaAlquilerMensual } from "@/lib/types";

const ITEMS_PER_PAGE = 8;

const MonthlyRentsView: React.FC = () => {
  const { monthlyRents, setRentStatus } = useRentalStore();
  const [rents, setRents] = useState(monthlyRents);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [movementRent, setMovementRent] = useState<AvaAlquilerMensual | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setRents(monthlyRents);
  }, [monthlyRents]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatuses, sortOrder]);

  const getStatusColor = (rent: AvaAlquilerMensual) => {
    const now = new Date();
    const endDate = new Date(rent.alqm_fechafin);
    const isPastDue = endDate < now && rent.alqm_estado !== "P";
    const isIncomplete = Number(rent.alqm_montopagado) < Number(rent.alqm_montototal);

    if (rent.alqm_estado === "P")
      return "bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50";
    if (rent.alqm_estado === "R")
      return "bg-pink-500/10 border-pink-500/30 hover:border-pink-500/50";
    if (isPastDue) return "bg-red-500/10 border-red-500/30 hover:border-red-500/50";
    if (isIncomplete)
      return "bg-amber-500/10 border-amber-500/30 hover:border-amber-500/50";
    return "bg-muted/50 border-border hover:border-primary/30";
  };

  const getStatusIcon = (rent: AvaAlquilerMensual) => {
    const now = new Date();
    const endDate = new Date(rent.alqm_fechafin);

    if (rent.alqm_estado === "P")
      return <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
    if (rent.alqm_estado === "R")
      return <Gift className="h-4 w-4 text-pink-600 dark:text-pink-400" />;
    if (rent.alqm_estado === "A" || endDate < now)
      return <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
    return <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
  };

  const getStatusLabel = (rent: AvaAlquilerMensual) => {
    const now = new Date();
    const endDate = new Date(rent.alqm_fechafin);
    if (rent.alqm_estado === "P") return { label: "Pagado", color: "text-emerald-600" };
    if (rent.alqm_estado === "R") return { label: "Regalado", color: "text-pink-600" };
    if (endDate < now) return { label: "Atrasado", color: "text-red-600" };
    return { label: "Pendiente", color: "text-amber-600" };
  };

  const getRentStatus = (rent: AvaAlquilerMensual) => {
    const now = new Date();
    const endDate = new Date(rent.alqm_fechafin);
    const isPastDue = endDate < now && rent.alqm_estado !== "P";
    const isIncomplete = Number(rent.alqm_montopagado) < Number(rent.alqm_montototal);

    if (rent.alqm_estado === "P") return "pagados";
    if (rent.alqm_estado === "R") return "regalados";
    if (isPastDue) return "atrasados";
    if (isIncomplete) return "incompletos";
    return "pendientes";
  };

  const toggleSort = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const filteredAndSortedRents = rents
    .filter((rent) => {
      if (selectedStatuses.length === 0) return true;
      return selectedStatuses.includes(getRentStatus(rent));
    })
    .sort((a, b) => {
      const dateA = new Date(a.alqm_fechainicio).getTime();
      const dateB = new Date(b.alqm_fechafin).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedRents.length / ITEMS_PER_PAGE));
  const paginatedRents = filteredAndSortedRents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleGiftToggle = async (rent: AvaAlquilerMensual) => {
    const isGifted = rent.alqm_estado !== "R";
    try {
      const res = await fetch(`/api/accounting/payment/gift/${rent.alqm_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isGifted }),
      });
      const body = await res.json();
      if (!body.success) throw new Error(body.error);

      setRentStatus(
        "monthlyRents",
        rent.alqm_id.toString(),
        body.data.alqm_estado
      );

      toast.success(
        isGifted ? "Mes marcado como regalado 🎁" : "Regalo removido del mes"
      );
    } catch (err: any) {
      toast.error("No se pudo actualizar el estado", {
        description: err.message,
      });
    }
  };

  return (
    <>
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            onClick={toggleSort}
            variant="outline"
            size="sm"
            className="flex items-center"
          >
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Ordenar {sortOrder === "asc" ? "Descendente" : "Ascendente"}
          </Button>

          <div className="w-full sm:w-auto">
            <StatusFilter
              filterName="Estado"
              selectedStatuses={selectedStatuses}
              onStatusChange={setSelectedStatuses}
              statuses={[
                { label: "Pagados", value: "pagados" },
                { label: "Atrasados", value: "atrasados" },
                { label: "Incompletos", value: "incompletos" },
                { label: "Regalados", value: "regalados" },
              ]}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
          {paginatedRents.map((rent) => {
            const isPaid = rent.alqm_estado === "P";
            const isGifted = rent.alqm_estado === "R";
            const isSettled = isPaid || isGifted;

            const progress = Number(rent.alqm_montototal) > 0
              ? (Number(rent.alqm_montopagado) / Number(rent.alqm_montototal)) * 100
              : 0;
            const pendingAmount = Number(rent.alqm_montototal) - Number(rent.alqm_montopagado);
            const { label: statusLabel, color: statusColor } = getStatusLabel(rent);
            const movCount = rent.ava_pago?.length ?? 0;

            return (
              <Card
                key={rent.alqm_id}
                className={cn(
                  "transition-all duration-200 ease-in-out hover:shadow-md border-2 flex flex-col",
                  getStatusColor(rent)
                )}
              >
                <CardHeader className="pb-1.5 px-3 pt-3">
                  <div className="flex items-start justify-between gap-1">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-xs font-bold text-foreground truncate">
                        {rent.alqm_identificador}
                      </CardTitle>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                        {formatToCR(rent.alqm_fechainicio)} – {formatToCR(rent.alqm_fechafin)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className={cn("text-[10px] font-semibold hidden sm:inline", statusColor)}>
                        {statusLabel}
                      </span>
                      {getStatusIcon(rent)}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-2 flex-1 px-3 pb-2">
                  {/* Progreso */}
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className={cn("font-semibold sm:hidden", statusColor)}>{statusLabel}</span>
                      <span className="font-bold text-foreground ml-auto">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-1" indicatorClassName="bg-primary" />
                  </div>

                  {/* Montos */}
                  <div className="divide-y divide-border pt-1.5 border-t">
                    <div className="flex items-center justify-between py-0.5 min-w-0">
                      <span className="text-[10px] text-muted-foreground flex-shrink-0">Total</span>
                      <span className="text-[10px] font-bold text-foreground ml-2 truncate text-right">
                        {formatCurrencyNoDecimals(Number(rent.alqm_montototal))}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-0.5 min-w-0">
                      <span className="text-[10px] text-muted-foreground flex-shrink-0">Pagado</span>
                      <span className="text-[10px] font-semibold text-emerald-600 ml-2 truncate text-right">
                        {formatCurrencyNoDecimals(Number(rent.alqm_montopagado))}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-0.5 min-w-0">
                      <span className="text-[10px] text-muted-foreground flex-shrink-0">Pendiente</span>
                      <span className={cn("text-[10px] font-semibold ml-2 truncate text-right", pendingAmount > 0 ? "text-amber-600" : "text-emerald-600")}>
                        {formatCurrencyNoDecimals(pendingAmount)}
                      </span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-1.5 px-3 pt-2 pb-3 border-t">
                  {/* Pagar — solo visible si no está pagado ni regalado */}
                  {!isSettled && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-[11px] h-7"
                      asChild
                    >
                      <Link href={`/accounting/payments/payment/${rent.alqm_id}`}>
                        <HandCoins className="h-3 w-3 mr-1" />
                        Pagar
                      </Link>
                    </Button>
                  )}

                  <div className="flex gap-1.5 w-full">
                    {/* Anular */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-[11px] h-7"
                      disabled={isGifted}
                      asChild
                    >
                      <Link href={`/accounting/payments/cancelpayment/${rent.alqm_id}`}>
                        <BanIcon className="h-3 w-3 mr-1" />
                        Anular
                      </Link>
                    </Button>

                    {/* Regalar — solo si no está pagado */}
                    {!isPaid && (
                      <AlertDialog
                        title={isGifted ? "¿Quitar regalo?" : "¿Regalar mes?"}
                        description={
                          isGifted
                            ? "Este mes volverá a considerarse atrasado o incompleto según los pagos."
                            : "Marcarás este mes como regalo, no contará como pago."
                        }
                        triggerText={""}
                        cancelText="Cancelar"
                        actionText={isGifted ? "Quitar regalo" : "Regalar mes"}
                        variant="ghost"
                        classn="text-[11px] p-1 h-7 w-7"
                        icon={<Gift size={12} />}
                        onAction={() => handleGiftToggle(rent)}
                      />
                    )}
                  </div>

                  {/* Ver movimientos del mes */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-[11px] h-7 text-muted-foreground hover:text-foreground"
                    onClick={() => setMovementRent(rent)}
                  >
                    <History className="h-3 w-3 mr-1" />
                    Movimientos
                    {movCount > 0 && (
                      <Badge variant="secondary" className="ml-1 h-4 px-1 text-[9px]">
                        {movCount}
                      </Badge>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedRents.length)} de {filteredAndSortedRents.length}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs font-medium px-2">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Dialog de movimientos del mes */}
      <Dialog open={!!movementRent} onOpenChange={(open) => !open && setMovementRent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-4 w-4 text-primary" />
              Movimientos — {movementRent?.alqm_identificador}
            </DialogTitle>
            <p className="text-xs text-muted-foreground">
              {movementRent && `${formatToCR(movementRent.alqm_fechainicio)} – ${formatToCR(movementRent.alqm_fechafin)}`}
            </p>
          </DialogHeader>

          {(movementRent?.ava_pago?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No hay movimientos registrados para este mes.
            </p>
          ) : (
            <>
              {/* Vista de tabla — desktop */}
              <div className="hidden sm:block rounded-md border min-w-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead>Referencia</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movementRent?.ava_pago?.map((pago) => {
                      const anulado = pago.pag_estado === "D" || !!pago.ava_anulacionpago?.length;
                      return (
                        <TableRow key={pago.pag_id} className={cn(anulado && "bg-red-500/5")}>
                          <TableCell className="text-sm whitespace-nowrap">
                            {formatToCR(pago.pag_fechapago)}
                          </TableCell>
                          <TableCell
                            className={cn(
                              "text-right font-semibold whitespace-nowrap",
                              anulado && "line-through text-muted-foreground"
                            )}
                          >
                            {formatCurrencyNoDecimals(Number(pago.pag_monto))}
                          </TableCell>
                          <TableCell className="text-sm">
                            {pago.pag_metodopago ? (
                              <span>
                                {pago.pag_metodopago}
                                {pago.pag_banco && (
                                  <span className="text-muted-foreground"> · {pago.pag_banco}</span>
                                )}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {pago.pag_referencia || "—"}
                          </TableCell>
                          <TableCell>
                            {anulado ? (
                              <Badge
                                variant="outline"
                                className="gap-1 bg-red-500/10 text-red-700 border-red-500/30 dark:text-red-400"
                              >
                                <Ban className="h-3 w-3" />
                                Anulado
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-400"
                              >
                                Activo
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Vista de tarjetas — móvil */}
              <div className="space-y-2 sm:hidden">
                {movementRent?.ava_pago?.map((pago) => {
                  const anulado = pago.pag_estado === "D" || !!pago.ava_anulacionpago?.length;
                  return (
                    <div
                      key={pago.pag_id}
                      className={cn(
                        "rounded-md border p-3 space-y-2",
                        anulado && "bg-red-500/5"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium whitespace-nowrap">
                          {formatToCR(pago.pag_fechapago)}
                        </span>
                        <span
                          className={cn(
                            "text-sm font-bold whitespace-nowrap",
                            anulado && "line-through text-muted-foreground"
                          )}
                        >
                          {formatCurrencyNoDecimals(Number(pago.pag_monto))}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-muted-foreground">Método</span>
                        <span className="text-right">
                          {pago.pag_metodopago ? (
                            <>
                              {pago.pag_metodopago}
                              {pago.pag_banco && (
                                <span className="text-muted-foreground"> · {pago.pag_banco}</span>
                              )}
                            </>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-muted-foreground">Referencia</span>
                        <span className="text-right text-muted-foreground break-all">
                          {pago.pag_referencia || "—"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-muted-foreground">Estado</span>
                        {anulado ? (
                          <Badge
                            variant="outline"
                            className="gap-1 bg-red-500/10 text-red-700 border-red-500/30 dark:text-red-400"
                          >
                            <Ban className="h-3 w-3" />
                            Anulado
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-400"
                          >
                            Activo
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MonthlyRentsView;
