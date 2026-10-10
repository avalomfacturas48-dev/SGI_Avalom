"use client";

import { useParams } from "next/navigation";
import { PaymentCancelTable } from "../paymentCancelTable";
import { CancelPaymentForm } from "./cancelPaymentForm";
import { useCancelPayment } from "@/hooks/accounting/monthlyRentPayment/useCancelPayment";
import { formatToCR } from "@/utils/dateUtils";

export function CancelPaymentTable() {
  const { alqmId } = useParams<{ alqmId: string }>();
  const { selectedMonthlyRent, ...table } = useCancelPayment(alqmId);

  return (
    <PaymentCancelTable
      {...table}
      context={{
        tipo: "Mensualidad",
        concepto: selectedMonthlyRent?.alqm_identificador,
        periodo: selectedMonthlyRent
          ? `${formatToCR(selectedMonthlyRent.alqm_fechainicio)} – ${formatToCR(
              selectedMonthlyRent.alqm_fechafin
            )}`
          : undefined,
      }}
      renderCancelForm={(payment, onSuccess) => (
        <CancelPaymentForm payment={payment} onSuccess={onSuccess} />
      )}
    />
  );
}
