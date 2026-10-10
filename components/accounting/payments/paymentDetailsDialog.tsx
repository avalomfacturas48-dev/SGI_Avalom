"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  FileText,
  Receipt,
  XCircle,
} from "lucide-react";
import type { AvaPago } from "@/lib/types";
import { formatCurrency } from "@/utils/currencyConverter";
import { formatToCR } from "@/utils/dateUtils";
import { cn } from "@/lib/utils";

export interface PaymentContext {
  /** "Mensualidad" o "Depósito" */
  tipo: string;
  /** Ej. identificador de la mensualidad o "Depósito de garantía" */
  concepto?: string;
  /** Ej. "1 de mayo de 2026 – 31 de mayo de 2026" */
  periodo?: string;
}

interface PaymentDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: AvaPago | null;
  context?: PaymentContext;
}

function Field({
  label,
  value,
  className,
}: {
  label: string;
  value?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-0.5 min-w-0", className)}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground break-words">
        {value || <span className="text-muted-foreground font-normal">—</span>}
      </p>
    </div>
  );
}

/** Contenido del detalle de un pago; se usa en el diálogo o embebido. */
export function PaymentDetailsContent({
  payment,
  context,
}: {
  payment: AvaPago;
  context?: PaymentContext;
}) {
  const anulacion = payment.ava_anulacionpago?.[0];
  const isAnulado = payment.pag_estado === "D" || !!anulacion;
  const usuario = anulacion?.ava_usuario;

  return (
    <div className="space-y-5">
      <div
        className={cn(
          "rounded-xl border p-5 text-center",
          isAnulado
            ? "border-red-500/20 bg-red-500/5"
            : "border-primary/20 bg-primary/5"
        )}
      >
        <p className="text-xs font-medium text-muted-foreground mb-1">
          {isAnulado ? "Monto anulado" : "Monto pagado"}
        </p>
        <p
          className={cn(
            "text-2xl sm:text-3xl font-bold",
            isAnulado && "line-through decoration-red-500/60"
          )}
        >
          {formatCurrency(Number(payment.pag_monto))}
        </p>
        <p className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
          <CalendarDays className="h-3 w-3" />
          {formatToCR(payment.pag_fechapago)}
        </p>
      </div>

      {context && (context.concepto || context.periodo) && (
        <section className="space-y-2">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Corresponde a
          </h3>
          <div className="grid grid-cols-2 gap-3 rounded-lg border p-3">
            <Field label="Tipo" value={context.tipo} />
            <Field label="Concepto" value={context.concepto} />
            {context.periodo && (
              <Field label="Periodo" value={context.periodo} className="col-span-2" />
            )}
          </div>
        </section>
      )}

      <section className="space-y-2">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Receipt className="h-4 w-4 text-primary" />
          Datos del pago
        </h3>
        <div className="grid grid-cols-2 gap-3 rounded-lg border p-3">
          <Field label="Método" value={payment.pag_metodopago} />
          <Field label="Banco" value={payment.pag_banco} />
          <Field label="Cuenta" value={payment.pag_cuenta} />
          <Field label="Referencia" value={payment.pag_referencia} />
          <Field
            label="Descripción"
            value={payment.pag_descripcion}
            className="col-span-2"
          />
        </div>
      </section>

      {isAnulado && (
        <>
          <Separator />
          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Anulación
            </h3>
            {anulacion ? (
              <div className="grid grid-cols-2 gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                <Field label="Fecha" value={formatToCR(anulacion.anp_fechaanulacion)} />
                <Field
                  label="Anulado por"
                  value={
                    usuario ? (
                      <>
                        {usuario.usu_nombre} {usuario.usu_papellido}
                        {usuario.usu_correo && (
                          <span className="block text-xs font-normal text-muted-foreground">
                            {usuario.usu_correo}
                          </span>
                        )}
                      </>
                    ) : undefined
                  }
                />
                <Field label="Motivo" value={anulacion.anp_motivo} className="col-span-2" />
                <Field
                  label="Descripción"
                  value={anulacion.anp_descripcion}
                  className="col-span-2"
                />
                <Field
                  label="Pagado antes de anular"
                  value={formatCurrency(Number(anulacion.anp_montooriginal))}
                />
                <Field
                  label="Pagado después de anular"
                  value={formatCurrency(Number(anulacion.anp_montofinal))}
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                El pago está anulado pero no tiene registro de anulación.
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
}

/** Detalle completo de un pago (activo o anulado) de mensualidad o depósito. */
export function PaymentDetailsDialog({
  open,
  onOpenChange,
  payment,
  context,
}: PaymentDetailsDialogProps) {
  if (!payment) return null;

  const isAnulado =
    payment.pag_estado === "D" || !!payment.ava_anulacionpago?.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Detalle del pago
            <Badge
              variant="outline"
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
          </DialogTitle>
          <DialogDescription>
            Pago #{payment.pag_id}
            {context?.tipo ? ` · ${context.tipo}` : ""}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh] pr-3">
          <PaymentDetailsContent payment={payment} context={context} />
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
