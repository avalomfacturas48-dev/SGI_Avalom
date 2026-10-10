"use client";

import { useState } from "react";
import {
  DollarSign,
  Calendar,
  AlertTriangle,
  ArrowUpDown,
  User,
  XCircle,
  CheckCircle2,
  Info,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { convertToCostaRicaTime } from "@/utils/dateUtils";
import { StatusFilter } from "@/components/dataTable/status-filter";
import ManageActions from "@/components/dataTable/manageActions";
import { formatCurrency } from "@/utils/currencyConverter";
import { cn } from "@/lib/utils";
import { clickableRowClass, clickableRowProps } from "@/lib/clickableRow";
import type { AvaPago } from "@/lib/types";
import {
  PaymentDetailsDialog,
  type PaymentContext,
} from "@/components/accounting/payments/paymentDetailsDialog";

type SortField = "pag_id" | "pag_monto" | "pag_fechapago" | "pag_estado";

interface PaymentCancelTableProps {
  filteredPayments: AvaPago[];
  toggleDescription: (pagId: string) => void;
  expandedDescriptions: Record<string, boolean>;
  handleSort: (field: SortField) => void;
  selectedStatuses: string[];
  setSelectedStatuses: (statuses: string[]) => void;
  /** Formulario de anulación propio de cada tipo de pago */
  renderCancelForm: (payment: AvaPago, onSuccess: () => void) => React.ReactNode;
  /** A qué corresponden los pagos (para el detalle) */
  context?: PaymentContext;
}

/** Tabla de pagos con anulación; compartida por mensualidades y depósitos. */
export function PaymentCancelTable({
  filteredPayments,
  toggleDescription,
  expandedDescriptions,
  handleSort,
  selectedStatuses,
  setSelectedStatuses,
  renderCancelForm,
  context,
}: PaymentCancelTableProps) {
  const [activePaymentId, setActivePaymentId] = useState<string | null>(null);
  const [detailPayment, setDetailPayment] = useState<AvaPago | null>(null);
  const activePayment =
    filteredPayments.find((p) => p.pag_id === activePaymentId) ?? null;
  // Evita que clics dentro de acciones (y del diálogo de anular, que en React
  // es hijo de la fila) abran el detalle
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  const renderMobileView = () => (
    <div className="space-y-4">
      {filteredPayments.map((payment) => {
        const isAnulado = payment.pag_estado === "D";
        const anulacion = payment.ava_anulacionpago?.[0];

        return (
          <Card
            key={payment.pag_id}
            {...clickableRowProps(() => setDetailPayment(payment), "Ver detalle del pago")}
            className={cn(
              "border shadow-sm transition-all",
              clickableRowClass,
              isAnulado && "border-red-500/30 bg-red-500/5"
            )}
          >
            <CardContent className="p-4 space-y-4">
              {/* Header con estado */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="text-sm sm:text-base md:text-lg font-bold text-foreground">
                    {formatCurrency(Number(payment.pag_monto))}
                  </span>
                </div>
                <Badge
                  variant={isAnulado ? "destructive" : "default"}
                  className={cn(
                    isAnulado
                      ? "bg-red-500/10 text-red-600 border-red-500/30"
                      : "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                  )}
                >
                  {isAnulado ? (
                    <XCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                  )}
                  {isAnulado ? "Anulado" : "Activo"}
                </Badge>
              </div>

              <Separator />

              {/* Información del pago */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Banco</p>
                  <p className="font-medium">{payment.pag_banco || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Método de Pago
                  </p>
                  <p className="font-medium">{payment.pag_metodopago}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground mb-1">
                    Referencia
                  </p>
                  <p className="font-medium">{payment.pag_referencia || "—"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground mb-1">Fecha</p>
                  <p className="font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {convertToCostaRicaTime(payment.pag_fechapago)}
                  </p>
                </div>
                {payment.pag_descripcion && (
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground mb-1">
                      Descripción
                    </p>
                    <p className="text-sm">
                      {expandedDescriptions[payment.pag_id]
                        ? payment.pag_descripcion
                        : payment.pag_descripcion.slice(0, 80)}
                      {payment.pag_descripcion.length > 80 && (
                        <Button
                          variant="link"
                          className="p-0 h-auto ml-1 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDescription(payment.pag_id);
                          }}
                        >
                          {expandedDescriptions[payment.pag_id]
                            ? "Ver menos"
                            : "Ver más"}
                        </Button>
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* Información de anulación */}
              {isAnulado && anulacion && (
                <>
                  <Separator />
                  <div className="space-y-2 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                    <p className="text-xs font-semibold text-red-600 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Información de Anulación
                    </p>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">
                          Fecha de Anulación
                        </p>
                        <p className="font-medium flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {convertToCostaRicaTime(anulacion.anp_fechaanulacion)}
                        </p>
                      </div>
                      {anulacion.ava_usuario && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">
                            Anulado por
                          </p>
                          <p className="font-medium flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {anulacion.ava_usuario.usu_nombre}{" "}
                            {anulacion.ava_usuario.usu_papellido}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">
                          Motivo
                        </p>
                        <p className="font-medium">{anulacion.anp_motivo}</p>
                      </div>
                      {anulacion.anp_descripcion && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">
                            Descripción
                          </p>
                          <p className="text-sm">{anulacion.anp_descripcion}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Botones de acción */}
              <div className="pt-2" onClick={stop} onKeyDown={stop}>
                {!isAnulado ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => setActivePaymentId(payment.pag_id)}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Anular
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setDetailPayment(payment)}
                  >
                    <Info className="h-4 w-4 mr-2" />
                    Ver detalle
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const renderDesktopView = () => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button variant="table" onClick={() => handleSort("pag_monto")}>
                Monto <ArrowUpDown className="text-primary ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>Banco</TableHead>
            <TableHead>Método</TableHead>
            <TableHead>Referencia</TableHead>
            <TableHead>Fecha Pago</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Anulación</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredPayments.map((payment) => {
            const isAnulado = payment.pag_estado === "D";
            const anulacion = payment.ava_anulacionpago?.[0];

            return (
              <TableRow
                key={payment.pag_id}
                {...clickableRowProps(() => setDetailPayment(payment), "Ver detalle del pago")}
                className={cn(
                  "hover:bg-muted/50",
                  clickableRowClass,
                  isAnulado && "bg-red-500/5"
                )}
              >
                <TableCell className="font-semibold">
                  {formatCurrency(Number(payment.pag_monto))}
                </TableCell>
                <TableCell>{payment.pag_banco || "—"}</TableCell>
                <TableCell>{payment.pag_metodopago}</TableCell>
                <TableCell>{payment.pag_referencia || "—"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    {convertToCostaRicaTime(payment.pag_fechapago)}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={isAnulado ? "destructive" : "default"}
                    className={cn(
                      isAnulado
                        ? "bg-red-500/10 text-red-600 border-red-500/30"
                        : "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                    )}
                  >
                    {isAnulado ? (
                      <XCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                    )}
                    {isAnulado ? "Anulado" : "Activo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {isAnulado && anulacion ? (
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {convertToCostaRicaTime(anulacion.anp_fechaanulacion)}
                      </div>
                      {anulacion.ava_usuario && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <User className="h-3 w-3" />
                          {anulacion.ava_usuario.usu_nombre}{" "}
                          {anulacion.ava_usuario.usu_papellido}
                        </div>
                      )}
                      <div className="text-red-600 font-medium">
                        {anulacion.anp_motivo}
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right" onClick={stop} onKeyDown={stop}>
                  {!isAnulado ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-2"
                      onClick={() => setActivePaymentId(payment.pag_id)}
                    >
                      <AlertTriangle className="w-4 h-4" />
                      Anular
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDetailPayment(payment)}
                    >
                      <Info className="h-4 w-4 mr-2" />
                      Ver Detalles
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <>
      <Card className="border shadow-lg">
        <CardHeader className="border-b">
          <CardTitle className="text-base sm:text-xl font-bold text-foreground">
            Pagos Asociados
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-4">
            <StatusFilter
              filterName="Estado"
              statuses={[
                { label: "Activo", value: "A" },
                { label: "Anulado", value: "D" },
              ]}
              selectedStatuses={selectedStatuses}
              onStatusChange={setSelectedStatuses}
            />
          </div>
          {filteredPayments.length > 0 ? (
            <>
              <div className="lg:hidden">{renderMobileView()}</div>
              <div className="hidden lg:block">{renderDesktopView()}</div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground space-y-4">
              <AlertTriangle className="w-10 h-10 text-muted-foreground" />
              <p className="text-sm font-medium">
                No hay pagos asociados con el estado seleccionado.
              </p>
              <p className="text-xs text-muted-foreground">
                Cambia los filtros o registra un nuevo pago para comenzar.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Un solo diálogo de anulación: antes cada vista (móvil y escritorio)
          tenía el suyo y se abrían dos superpuestos */}
      <ManageActions
        hideTrigger
        open={!!activePayment}
        onOpenChange={(open) => !open && setActivePaymentId(null)}
        title="Anular Pago"
        description="Complete el formulario para anular el pago"
        FormComponent={
          activePayment
            ? renderCancelForm(activePayment, () => setActivePaymentId(null))
            : null
        }
      />

      <PaymentDetailsDialog
        open={!!detailPayment}
        onOpenChange={(open) => !open && setDetailPayment(null)}
        payment={detailPayment}
        context={context}
      />
    </>
  );
}
