"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BreadcrumbResponsive } from "@/components/breadcrumbResponsive";
import { CancelPaymentTable } from "./cancelPaymentTable";
import { useParams } from "next/navigation";
import { useCancelPayment } from "@/hooks/accounting/monthlyRentPayment/useCancelPayment";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "lucide-react";
import { formatToCR } from "@/utils/dateUtils";

const BodyCancelPayment: React.FC = () => {
  const { alqmId } = useParams<{ alqmId: string }>();
  const { isLoading, selectedMonthlyRent } = useCancelPayment(alqmId);

  return (
    <div className="mx-auto p-4 space-y-6 max-w-7xl">
      {isLoading ? (
        <>
          <Card>
            <CardHeader>
              <Skeleton className="h-4 w-48 mb-2" />
              <Skeleton className="h-7 w-40" />
              <Skeleton className="h-5 w-64 mt-2" />
            </CardHeader>
          </Card>
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="grid grid-cols-6 gap-4 items-center">
                  {[...Array(6)].map((_, j) => (
                    <Skeleton key={j} className="h-8 w-full" />
                  ))}
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      ) : (
        <>
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
                  { label: "Anular pago" },
                ]}
              />
              <CardTitle className="text-2xl text-primary font-bold mt-2">
                Anular Pago
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

          <CancelPaymentTable />
        </>
      )}
    </div>
  );
};

export default BodyCancelPayment;
