"use client";

import { useParams } from "next/navigation";
import { PaymentCancelTable } from "../paymentCancelTable";
import { CancelPaymentForm } from "./cancelPaymentForm";
import { useCancelPayment } from "@/hooks/accounting/depositPayment/useCancelPayment";

export function CancelPaymentTable() {
  const { depoId } = useParams<{ depoId: string }>();
  const { selectedDeposit, ...table } = useCancelPayment(depoId);

  return (
    <PaymentCancelTable
      {...table}
      context={{ tipo: "Depósito", concepto: "Depósito de garantía" }}
      renderCancelForm={(payment, onSuccess) => (
        <CancelPaymentForm payment={payment} onSuccess={onSuccess} />
      )}
    />
  );
}
