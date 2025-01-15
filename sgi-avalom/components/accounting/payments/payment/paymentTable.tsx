"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { X, DollarSign, Hash, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/utils/currencyConverter";
import { usePaymentForm } from "@/hooks/accounting/usePaymentForm";
import usePaymentStore from "@/lib/zustand/monthlyRentStore";
import { useEffect, useState } from "react";

interface PaymentTableProps {
  amountToPay: string;
  setAmountToPay: React.Dispatch<React.SetStateAction<string>>;
}
export function PaymentTable({
  amountToPay,
  setAmountToPay,
}: PaymentTableProps) {
  const selectedMonthlyRent = usePaymentStore(
    (state) => state.selectedMonthlyRent
  );
  const [payFull, setPayFull] = useState(false);

  const currentBalance = selectedMonthlyRent
    ? Number(selectedMonthlyRent.alqm_montototal) -
      Number(selectedMonthlyRent.alqm_montopagado)
    : 0;

  const finalBalance = currentBalance - Number(amountToPay || "0");

  useEffect(() => {
    if (payFull) {
      setAmountToPay(currentBalance.toString());
    }
  }, [payFull, currentBalance, setAmountToPay]);

  const handleAmountChange = (value: string) => {
    const sanitizedValue = value.replace(/[^\d.]/g, "");
    const parts = sanitizedValue.split(".");
    const formattedValue = parts[0] + (parts.length > 1 ? "." + parts[1] : "");
    const numValue = Number(formattedValue);

    if (numValue <= currentBalance) {
      setAmountToPay(formattedValue);
      setPayFull(numValue === currentBalance);
    }
  };

  const clearAmount = () => {
    setAmountToPay("");
    setPayFull(false);
  };

  if (!selectedMonthlyRent) return null;

  const renderMobileView = () => (
    <Card className="mb-4">
      <CardContent className="p-4 space-y-4">
        <div className="flex justify-between">
          <span className="font-semibold">ID:</span>
          <span>{selectedMonthlyRent.alqm_id}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Identificador:</span>
          <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
            {selectedMonthlyRent.alqm_identificador}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Monto Total:</span>
          <span>
            {formatCurrency(Number(selectedMonthlyRent.alqm_montototal))}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Saldo Actual:</span>
          <span className="text-red-600 font-medium">
            {formatCurrency(currentBalance)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-semibold">Pagar Total:</span>
          <Checkbox
            checked={payFull}
            onCheckedChange={(checked) => setPayFull(checked as boolean)}
          />
        </div>
        <div className="space-y-2">
          <span className="font-semibold">Monto a Abonar:</span>
          <div className="relative">
            <Input
              value={amountToPay}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="pr-8"
              placeholder="0.00"
            />
            {amountToPay && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                onClick={clearAmount}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Saldo Final:</span>
          <span className="text-green-600 font-medium">
            {formatCurrency(finalBalance)}
          </span>
        </div>
      </CardContent>
    </Card>
  );

  const renderDesktopView = () => (
    <div className="overflow-x-auto">
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">
              <Hash className="inline-block mr-2 w-3" />
              ID
            </TableHead>
            <TableHead className="whitespace-nowrap">
              <Tag className="inline-block mr-2 w-3" />
              IDENTIFICADOR
            </TableHead>
            <TableHead className="whitespace-nowrap">
              <DollarSign className="inline-block mr-2 w-3" />
              MONTO TOTAL
            </TableHead>
            <TableHead className="whitespace-nowrap">
              <DollarSign className="inline-block mr-2 w-3" />
              SALDO ACTUAL
            </TableHead>
            <TableHead className="w-12"></TableHead>
            <TableHead className="whitespace-nowrap">
              <DollarSign className="inline-block mr-2 w-3" />
              MONTO ABONAR
            </TableHead>
            <TableHead className="whitespace-nowrap">
              <DollarSign className="inline-block mr-2 w-3" />
              SALDO FINAL
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>{selectedMonthlyRent.alqm_id}</TableCell>
            <TableCell>
              <span className="inline-flex items-center rounded-md bg-green-700 px-2 py-1 text-base font-medium text-green-100 ring-1 ring-inset ring-green-600/20">
                {selectedMonthlyRent.alqm_identificador}
              </span>
            </TableCell>
            <TableCell>
              {formatCurrency(Number(selectedMonthlyRent.alqm_montototal))}
            </TableCell>
            <TableCell className="text-red-600 font-medium">
              {formatCurrency(currentBalance)}
            </TableCell>
            <TableCell>
              <Checkbox
                checked={payFull}
                onCheckedChange={(checked) => setPayFull(checked as boolean)}
              />
            </TableCell>
            <TableCell className="relative">
              <Input
                value={amountToPay}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="pr-8"
                placeholder="0.00"
              />
              {amountToPay && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-7 h-6 w-6 p-0"
                  onClick={clearAmount}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </TableCell>
            <TableCell className="text-green-600 font-medium">
              {formatCurrency(finalBalance)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );

  return (
    <>
      <div className="md:hidden">{renderMobileView()}</div>
      <div className="hidden md:block">{renderDesktopView()}</div>
    </>
  );
}
