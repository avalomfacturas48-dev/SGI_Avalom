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
import {
  X,
  DollarSign,
  Hash,
  Tag,
  BadgeDollarSign,
  Banknote,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/utils/currencyConverter";
import usePaymentStore from "@/lib/zustand/useDepositStore";
import { useEffect, useState } from "react";

interface PaymentTableProps {
  amountToPay: string;
  setAmountToPay: React.Dispatch<React.SetStateAction<string>>;
}
export function PaymentTable({
  amountToPay,
  setAmountToPay,
}: PaymentTableProps) {
  const selectedDeposit = usePaymentStore((state) => state.selectedDeposit);
  const [payFull, setPayFull] = useState(false);

  const currentBalance = selectedDeposit
    ? Number(selectedDeposit.depo_total) -
      Number(selectedDeposit.depo_montoactual)
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

  if (!selectedDeposit) return null;

  const renderMobileView = () => (
    <Card className="mb-4">
      <CardContent className="p-4 space-y-6 text-sm flex flex-col items-center justify-center text-center">
        {/* ID */}
        <div className="flex items-center gap-2">
          <Hash className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">ID:</span>
          <span>{selectedDeposit.depo_id}</span>
        </div>

        {/* Monto Total */}
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2 text-muted-foreground font-medium">
            <DollarSign className="w-4 h-4" />
            Monto Total
          </div>
          <div>{formatCurrency(Number(selectedDeposit.depo_total))}</div>
        </div>

        {/* Saldo Actual */}
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2 text-muted-foreground font-medium">
            <Banknote className="w-4 h-4" />
            Saldo Actual
          </div>
          <div className="text-red-600 font-semibold">
            {formatCurrency(currentBalance)}
          </div>
        </div>

        {/* Checkbox Total */}
        <div className="flex items-center justify-center gap-3">
          <span className="flex items-center gap-2 font-medium text-muted-foreground">
            <Wallet className="w-4 h-4" />
            Pagar Total
          </span>
          <Checkbox
            checked={payFull}
            onCheckedChange={(checked) => setPayFull(checked as boolean)}
          />
        </div>

        {/* Monto Abonar */}
        <div className="space-y-1 w-full max-w-xs">
          <div className="flex items-center justify-center gap-2 text-muted-foreground font-medium">
            <BadgeDollarSign className="w-4 h-4" />
            Monto a Abonar
          </div>
          <div className="relative">
            <Input
              value={amountToPay}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="pr-8 text-center"
              placeholder="₡0.00"
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

        {/* Saldo Final */}
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2 text-muted-foreground font-medium">
            <DollarSign className="w-4 h-4" />
            Saldo Final
          </div>
          <div className="text-green-600 font-semibold">
            {formatCurrency(finalBalance)}
          </div>
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
            <TableCell>{selectedDeposit.depo_id}</TableCell>
            <TableCell>
              {formatCurrency(Number(selectedDeposit.depo_total))}
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
