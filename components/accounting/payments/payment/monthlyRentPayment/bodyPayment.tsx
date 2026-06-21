"use client";

import { useState, useEffect } from "react";
import { BreadcrumbResponsive } from "@/components/breadcrumbResponsive";
import { useParams } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PaymentForm } from "./paymentForm";
import { usePayment } from "@/hooks/accounting/monthlyRentPayment/usePayment";
import { formatCurrency } from "@/utils/currencyConverter";
import { formatToCR } from "@/utils/dateUtils";
import { Calendar, X, HandCoins, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

const BodyPayment: React.FC = () => {
  const { alqmId } = useParams<{ alqmId: string }>();
  const { isLoading, selectedMonthlyRent } = usePayment(alqmId);

  const [amountToPay, setAmountToPay] = useState<string>("");
  const [payFull, setPayFull] = useState(false);

  const currentBalance = selectedMonthlyRent
    ? Number(selectedMonthlyRent.alqm_montototal) - Number(selectedMonthlyRent.alqm_montopagado)
    : 0;
  const totalAmount = selectedMonthlyRent ? Number(selectedMonthlyRent.alqm_montototal) : 0;
  const alreadyPaid = selectedMonthlyRent ? Number(selectedMonthlyRent.alqm_montopagado) : 0;
  const paying = Number(amountToPay || 0);
  const newBalance = currentBalance - paying;
  const newPaid = alreadyPaid + paying;
  const progressAfter = totalAmount > 0 ? (newPaid / totalAmount) * 100 : 0;

  useEffect(() => {
    if (payFull && currentBalance > 0) {
      setAmountToPay(currentBalance.toString());
    }
  }, [payFull, currentBalance]);

  const handleAmountChange = (value: string) => {
    const sanitized = value.replace(/[^\d.]/g, "");
    const parts = sanitized.split(".");
    const formatted = parts[0] + (parts.length > 1 ? "." + parts[1] : "");
    const num = Number(formatted);
    if (num <= currentBalance) {
      setAmountToPay(formatted);
      setPayFull(num === currentBalance);
    }
  };

  const clearAmount = () => {
    setAmountToPay("");
    setPayFull(false);
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 sm:gap-6">
      {isLoading ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-4 w-48 mb-2" />
              <Skeleton className="h-7 w-40" />
              <Skeleton className="h-5 w-64 mt-2" />
            </CardHeader>
          </Card>
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          {/* Header */}
          <Card className="border shadow-lg">
            <CardHeader className="pb-4">
              <BreadcrumbResponsive
                items={[
                  { label: "Inicio", href: "/homePage" },
                  { label: "Contabilidad", href: "/accounting" },
                  {
                    label: "Movimientos",
                    href: `/accounting/payments/${selectedMonthlyRent?.alq_id}`,
                  },
                  { label: "Registrar Pago" },
                ]}
              />
              <CardTitle className="text-lg sm:text-xl md:text-2xl text-primary font-bold mt-2">
                Registrar Pago
              </CardTitle>
              {selectedMonthlyRent && (
                <div className="flex flex-wrap items-center gap-2 pt-3 mt-1 border-t">
                  <Badge variant="secondary" className="font-mono">
                    {selectedMonthlyRent.alqm_identificador}
                  </Badge>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatToCR(selectedMonthlyRent.alqm_fechainicio)} –{" "}
                    {formatToCR(selectedMonthlyRent.alqm_fechafin)}
                  </span>
                </div>
              )}
            </CardHeader>
          </Card>

          {selectedMonthlyRent && (
            <Card className="border shadow-lg">
              <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Sección: Monto a pagar */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <HandCoins className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">
                      Monto a registrar
                    </h3>
                  </div>

                  {/* Resumen de saldos */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 p-4 rounded-lg border bg-muted/30">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">Total del mes</p>
                      <p className="text-sm font-bold text-foreground">
                        {formatCurrency(totalAmount)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">Ya pagado</p>
                      <p className="text-sm font-semibold text-emerald-600">
                        {formatCurrency(alreadyPaid)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">Pendiente</p>
                      <p className="text-sm font-semibold text-amber-600">
                        {formatCurrency(currentBalance)}
                      </p>
                    </div>
                  </div>

                  {/* Input y toggle */}
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    <div className="relative flex-1 w-full">
                      <Input
                        value={amountToPay}
                        onChange={(e) => handleAmountChange(e.target.value)}
                        placeholder="₡0"
                        className="pr-8 text-lg font-semibold h-11"
                      />
                      {amountToPay && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                          onClick={clearAmount}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Switch
                        id="pay-full"
                        checked={payFull}
                        onCheckedChange={(checked) => {
                          setPayFull(checked);
                          if (!checked) clearAmount();
                        }}
                      />
                      <Label htmlFor="pay-full" className="text-sm cursor-pointer">
                        Pagar total
                      </Label>
                    </div>
                  </div>

                  {/* Barra de progreso predictiva */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progreso tras este pago</span>
                      <span className="font-semibold text-foreground">
                        {Math.min(Math.round(progressAfter), 100)}%
                      </span>
                    </div>
                    <Progress
                      value={progressAfter}
                      className="h-2"
                      indicatorClassName={cn(
                        progressAfter >= 100 ? "bg-emerald-500" : "bg-primary"
                      )}
                    />
                    {paying > 0 && (
                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-muted-foreground">Nuevo saldo pendiente:</span>
                        <span
                          className={cn(
                            "font-semibold",
                            newBalance <= 0 ? "text-emerald-600" : "text-amber-600"
                          )}
                        >
                          {newBalance <= 0 ? "Saldado ✓" : formatCurrency(newBalance)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Formulario de detalles */}
                <PaymentForm
                  amountToPay={amountToPay}
                  setAmountToPay={setAmountToPay}
                />
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default BodyPayment;
