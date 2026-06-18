"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Ban, Plus, Wallet } from "lucide-react";
import Link from "next/link";
import { formatCurrencyNoDecimals } from "@/utils/currencyConverter";
import useRentalStore from "@/lib/zustand/useRentalStore";
import { useParams } from "next/navigation";

export function DepositView() {
  const { deposit, payments } = useRentalStore((state) => ({
    deposit: state.deposit,
    payments: state.deposit?.ava_pago || [],
  }));
  const { alqId } = useParams();

  if (!deposit) {
    return (
      <Card className="border shadow-md">
        <CardHeader className="py-3 px-4 border-b">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <Wallet className="h-3.5 w-3.5 text-primary" />
            Depósito
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 py-3 space-y-3">
          <Alert variant="default">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              No existe un depósito para este alquiler.
            </AlertDescription>
          </Alert>
          <div className="flex justify-end">
            <Link href={`/mantRent/edit/${alqId}/`}>
              <Button size="sm" className="h-7 text-xs">
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Crear Depósito
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formattedTotal = formatCurrencyNoDecimals(Number(deposit.depo_total));
  const formattedCurrent = formatCurrencyNoDecimals(Number(deposit.depo_montoactual));
  const progress =
    Number(deposit.depo_total) > 0
      ? (Number(deposit.depo_montoactual) / Number(deposit.depo_total)) * 100
      : 0;
  const remaining = Number(deposit.depo_total) - Number(deposit.depo_montoactual);

  return (
    <Card className="border shadow-md">
      <CardHeader className="py-3 px-4 border-b">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <Wallet className="h-3.5 w-3.5 text-primary" />
            Depósito
          </CardTitle>
          <div className="flex gap-1.5">
            {remaining > 0 && (
              <Link href={`/accounting/payments/depositpayment/${deposit.depo_id}/`}>
                <Button variant="default" size="sm" className="h-7 text-xs">
                  <Plus className="h-3 w-3 mr-1" />
                  Pagar
                </Button>
              </Link>
            )}
            <Link href={`/accounting/payments/depositcancelpayment/${deposit.depo_id}/`}>
              <Button variant="destructive" size="sm" className="h-7 text-xs">
                <Ban className="h-3 w-3 mr-1" />
                Anular
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-4 py-3 space-y-3">
        {/* Progreso */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progreso</span>
            <span className="font-bold text-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1.5" indicatorClassName="bg-primary" />
        </div>

        {/* Montos */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t text-center">
          <div>
            <p className="text-[10px] text-muted-foreground mb-0.5">Total</p>
            <p className="text-xs font-bold text-foreground">{formattedTotal}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground mb-0.5">Pagado</p>
            <p className="text-xs font-semibold text-emerald-600">{formattedCurrent}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground mb-0.5">Pendiente</p>
            <p className="text-xs font-semibold text-amber-600">{formatCurrencyNoDecimals(remaining)}</p>
          </div>
        </div>

        {/* Alertas */}
        {payments.length > 0 && (
          <Alert className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 py-2">
            <AlertCircle className="h-3.5 w-3.5 text-blue-600" />
            <AlertDescription className="text-xs">
              {payments.length} pago{payments.length !== 1 ? "s" : ""} registrado{payments.length !== 1 ? "s" : ""}.
            </AlertDescription>
          </Alert>
        )}

        {deposit.depo_fechadevolucion && (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-3.5 w-3.5" />
            <AlertDescription className="text-xs">
              Devuelto el{" "}
              {new Date(deposit.depo_fechadevolucion).toLocaleDateString("es-CR")}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
