"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Ban, Plus } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/utils/currencyConverter";
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
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Depósito</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="default" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No existe un depósito para este alquiler.
            </AlertDescription>
          </Alert>
          <div className="flex justify-end">
            <Link href={`/mantRent/edit/${alqId}/`}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Crear Depósito
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasPayments = payments.length > 0;
  const formattedTotal = formatCurrency(Number(deposit.depo_total));
  const formattedCurrent = formatCurrency(Number(deposit.depo_montoactual));

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2">
        <CardTitle className="text-xl text-primary font-semibold">
          Depósito
        </CardTitle>
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full sm:w-auto">
          <Link
            href={`/accounting/payments/depositpayment/${deposit.depo_id}/`}
            className="w-full sm:w-auto"
          >
            <Button variant="default" size="sm" className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Ingresar Pago
            </Button>
          </Link>
          <Link
            href={`/accounting/payments/depositcancelpayment/${deposit.depo_id}/`}
            className="w-full sm:w-auto"
          >
            <Button
              variant="destructive"
              size="sm"
              className="w-full sm:w-auto"
            >
              <Ban className="h-4 w-4 mr-2" />
              Anular
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Monto Total
            </p>
            <p className="text-2xl font-bold">{formattedTotal}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Monto Actual
            </p>
            <p className="text-2xl font-bold">{formattedCurrent}</p>
          </div>
        </div>

        {hasPayments && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Este depósito tiene {payments.length} pago
              {payments.length !== 1 ? "s" : ""} registrado
              {payments.length !== 1 ? "s" : ""}.
            </AlertDescription>
          </Alert>
        )}

        {deposit.depo_fechadevolucion && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Este depósito fue devuelto el{" "}
              {new Date(deposit.depo_fechadevolucion).toLocaleDateString(
                "es-CR"
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
