"use client";

import { useMemo, useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StatusFilter } from "@/components/dataTable/status-filter";
import {
  History,
  Wallet,
  HandCoins,
  TrendingUp,
  TrendingDown,
  Ban,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import useRentalStore from "@/lib/zustand/useRentalStore";
import { formatToCR } from "@/utils/dateUtils";
import { formatCurrencyNoDecimals } from "@/utils/currencyConverter";
import { AvaPago } from "@/lib/types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

interface Movement {
  id: string;
  date: string;
  tipo: "Mensualidad" | "Depósito";
  concepto: string;
  monto: number;
  metodo?: string;
  banco?: string;
  referencia?: string;
  anulado: boolean;
  anulacionMotivo?: string;
  anulacionDescripcion?: string;
  anulacionFecha?: string;
  anulacionUsuario?: string;
}

function mapPayment(
  pago: AvaPago,
  tipo: Movement["tipo"],
  concepto: string
): Movement {
  const anulacion = pago.ava_anulacionpago?.[0];
  const anulado = pago.pag_estado === "D" || !!anulacion;
  const usuario = anulacion?.ava_usuario;
  return {
    id: `${tipo}-${pago.pag_id}`,
    date: pago.pag_fechapago,
    tipo,
    concepto,
    monto: Number(pago.pag_monto),
    metodo: pago.pag_metodopago || undefined,
    banco: pago.pag_banco || undefined,
    referencia: pago.pag_referencia || undefined,
    anulado,
    anulacionMotivo: anulacion?.anp_motivo,
    anulacionDescripcion: anulacion?.anp_descripcion,
    anulacionFecha: anulacion?.anp_fechaanulacion,
    anulacionUsuario: usuario
      ? `${usuario.usu_nombre} ${usuario.usu_papellido}`
      : undefined,
  };
}

export function MovementsHistory() {
  const { monthlyRents, deposit } = useRentalStore((s) => ({
    monthlyRents: s.monthlyRents,
    deposit: s.deposit,
  }));
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [page, setPage] = useState(0);

  const movements = useMemo<Movement[]>(() => {
    const list: Movement[] = [];

    monthlyRents.forEach((mr) => {
      (mr.ava_pago ?? []).forEach((pago) => {
        list.push(mapPayment(pago, "Mensualidad", mr.alqm_identificador));
      });
    });

    (deposit?.ava_pago ?? []).forEach((pago) => {
      list.push(mapPayment(pago, "Depósito", "Depósito de garantía"));
    });

    return list.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [monthlyRents, deposit]);

  const totals = useMemo(() => {
    let cobrado = 0;
    let anulado = 0;
    movements.forEach((m) => {
      if (m.anulado) anulado += m.monto;
      else cobrado += m.monto;
    });
    return { cobrado, anulado, count: movements.length };
  }, [movements]);

  const filtered = useMemo(
    () =>
      movements.filter((m) => {
        if (statusFilter.length === 0) return true;
        const key = m.anulado ? "anulado" : "activo";
        return statusFilter.includes(key);
      }),
    [movements, statusFilter]
  );

  // Reset page when filter changes
  useEffect(() => {
    setPage(0);
  }, [statusFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <Card className="border shadow-lg">
      <CardHeader className="border-b py-3 px-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <History className="h-3.5 w-3.5 text-primary" />
            Historial de movimientos
          </CardTitle>
          <StatusFilter
            filterName="Estado"
            selectedStatuses={statusFilter}
            onStatusChange={setStatusFilter}
            statuses={[
              { label: "Activos", value: "activo" },
              { label: "Anulados", value: "anulado" },
            ]}
          />
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          <div className="flex items-center gap-2 p-2 rounded-lg border bg-card">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground">Cobrado</p>
              <p className="text-xs font-bold text-emerald-600 truncate">
                {formatCurrencyNoDecimals(totals.cobrado)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg border bg-card">
            <TrendingDown className="h-3.5 w-3.5 text-red-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground">Anulado</p>
              <p className="text-xs font-bold text-red-600 truncate">
                {formatCurrencyNoDecimals(totals.anulado)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg border bg-card">
            <History className="h-3.5 w-3.5 text-primary flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground">Total</p>
              <p className="text-xs font-bold text-foreground">{totals.count}</p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {movements.length === 0
                ? "Aún no se han registrado movimientos para este alquiler."
                : "No hay movimientos con el filtro seleccionado."}
            </p>
          </div>
        ) : (
          <>
            {/* Móvil: cards */}
            <div className="sm:hidden space-y-2">
              {paginated.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "rounded-lg border p-3 space-y-2",
                    m.anulado && "bg-red-500/5 border-red-200 dark:border-red-900"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline" className="gap-1 text-[11px]">
                      {m.tipo === "Depósito" ? (
                        <Wallet className="h-3 w-3" />
                      ) : (
                        <HandCoins className="h-3 w-3" />
                      )}
                      {m.tipo}
                    </Badge>
                    {m.anulado ? (
                      <Badge
                        variant="outline"
                        className="gap-1 bg-red-500/10 text-red-700 border-red-500/30 dark:text-red-400 text-[11px]"
                      >
                        <Ban className="h-3 w-3" />
                        Anulado
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-400 text-[11px]"
                      >
                        Activo
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-baseline justify-between gap-2 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{m.concepto}</p>
                    <p
                      className={cn(
                        "text-sm font-bold whitespace-nowrap flex-shrink-0",
                        m.anulado ? "line-through text-muted-foreground" : "text-foreground"
                      )}
                    >
                      {formatCurrencyNoDecimals(m.monto)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground gap-2 min-w-0">
                    <span className="flex-shrink-0">{formatToCR(m.date)}</span>
                    {(m.metodo || m.referencia) && (
                      <span className="truncate text-right">
                        {[m.metodo, m.banco, m.referencia].filter(Boolean).join(" · ")}
                      </span>
                    )}
                  </div>

                  {m.anulado && (m.anulacionMotivo || m.anulacionDescripcion) && (
                    <div className="text-xs text-red-600 dark:text-red-400 border-t border-red-200 dark:border-red-900 pt-1.5 space-y-0.5">
                      {m.anulacionMotivo && (
                        <p><span className="font-medium">Motivo:</span> {m.anulacionMotivo}</p>
                      )}
                      {m.anulacionDescripcion && <p>{m.anulacionDescripcion}</p>}
                      {m.anulacionFecha && (
                        <p className="text-muted-foreground">
                          {formatToCR(m.anulacionFecha)}
                          {m.anulacionUsuario && ` · ${m.anulacionUsuario}`}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop: tabla */}
            <div className="hidden sm:block rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Concepto</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Referencia</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((m) => (
                    <TableRow key={m.id} className={cn(m.anulado && "bg-red-500/5")}>
                      <TableCell className="whitespace-nowrap text-sm">
                        {formatToCR(m.date)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1 whitespace-nowrap">
                          {m.tipo === "Depósito" ? (
                            <Wallet className="h-3 w-3" />
                          ) : (
                            <HandCoins className="h-3 w-3" />
                          )}
                          {m.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm font-medium">{m.concepto}</TableCell>
                      <TableCell
                        className={cn(
                          "text-right font-semibold whitespace-nowrap",
                          m.anulado && "line-through text-muted-foreground"
                        )}
                      >
                        {formatCurrencyNoDecimals(m.monto)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {m.metodo ? (
                          <span>
                            {m.metodo}
                            {m.banco && (
                              <span className="text-muted-foreground"> · {m.banco}</span>
                            )}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {m.referencia || "—"}
                      </TableCell>
                      <TableCell>
                        {m.anulado ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge
                                  variant="outline"
                                  className="gap-1 bg-red-500/10 text-red-700 border-red-500/30 dark:text-red-400 cursor-help"
                                >
                                  <Ban className="h-3 w-3" />
                                  Anulado
                                  <Info className="h-3 w-3" />
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <div className="space-y-1 text-xs">
                                  {m.anulacionMotivo && (
                                    <p>
                                      <span className="font-semibold">Motivo:</span>{" "}
                                      {m.anulacionMotivo}
                                    </p>
                                  )}
                                  {m.anulacionDescripcion && <p>{m.anulacionDescripcion}</p>}
                                  {m.anulacionFecha && (
                                    <p className="text-muted-foreground">
                                      {formatToCR(m.anulacionFecha)}
                                    </p>
                                  )}
                                  {m.anulacionUsuario && (
                                    <p className="text-muted-foreground">
                                      Por: {m.anulacionUsuario}
                                    </p>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
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
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>

      {totalPages > 1 && (
        <CardFooter className="flex items-center justify-between border-t pt-4">
          <p className="text-xs text-muted-foreground">
            Mostrando {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} de {filtered.length} movimientos
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs font-medium text-foreground">
              {page + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

export default MovementsHistory;
