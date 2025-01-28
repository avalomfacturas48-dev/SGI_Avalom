"use client"

import { useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Ban, Plus } from "lucide-react"
import Link from "next/link"
import { formatCurrency } from "@/utils/currencyConverter"
import useRentalStore from "@/lib/zustand/useRentalStore"

export function DepositView() {
    const { deposit, payments } = useRentalStore((state) => ({
        deposit: state.deposit,
        payments: state.deposit?.ava_pago || [],
      }));

  if (!deposit) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Depósito</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="default" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>No existe un depósito para este alquiler.</AlertDescription>
          </Alert>
          <div className="flex justify-end">
            <Link href={`/accounting/deposits/create/}`}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Crear Depósito
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  const hasPayments = payments.length > 0
  const formattedTotal = formatCurrency(Number(deposit.depo_total))
  const formattedCurrent = formatCurrency(Number(deposit.depo_montoactual))

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-semibold">Depósito</CardTitle>
        <div className="flex gap-2">
          <Link href={`/accounting/payments/depositpayment/${deposit.depo_id}/`}>
            <Button variant="default" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Ingresar Pago
            </Button>
          </Link>
          <Link href={`/accounting/payments/depositcancelpayment/${deposit.depo_id}/`}>
            <Button variant="destructive" size="sm">
              <Ban className="h-4 w-4 mr-2" />
              Anular
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Monto Total</p>
            <p className="text-2xl font-bold">{formattedTotal}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Monto Actual</p>
            <p className="text-2xl font-bold">{formattedCurrent}</p>
          </div>
        </div>

        {hasPayments && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Este depósito tiene {payments.length} pago{payments.length !== 1 ? "s" : ""} registrado
              {payments.length !== 1 ? "s" : ""}.
            </AlertDescription>
          </Alert>
        )}

        {deposit.depo_fechadevolucion && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Este depósito fue devuelto el {new Date(deposit.depo_fechadevolucion).toLocaleDateString("es-CR")}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

