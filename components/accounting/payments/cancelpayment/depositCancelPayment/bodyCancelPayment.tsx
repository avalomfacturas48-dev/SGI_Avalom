"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BreadcrumbResponsive } from "@/components/breadcrumbResponsive";
import { CancelPaymentTable } from "./cancelPaymentTable";
import { useParams } from "next/navigation";
import { useCancelPayment } from "@/hooks/accounting/depositPayment/useCancelPayment";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet } from "lucide-react";

const BodyCancelPayment: React.FC = () => {
  const { depoId } = useParams<{ depoId: string }>();
  const { isLoading, selectedDeposit } = useCancelPayment(depoId);

  return (
    <div className="mx-auto p-4 space-y-6 max-w-7xl">
      {isLoading ? (
        <>
          <Card>
            <CardHeader>
              <Skeleton className="h-4 w-48 mb-2" />
              <Skeleton className="h-7 w-40" />
              <Skeleton className="h-5 w-40 mt-2" />
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
                    href: `/accounting/payments/${selectedDeposit?.alq_id}`,
                  },
                  { label: "Anular pago" },
                ]}
              />
              <CardTitle className="text-2xl text-primary font-bold mt-2">
                Anular Pago de Depósito
              </CardTitle>
              {selectedDeposit && (
                <div className="flex items-center gap-2 pt-3 mt-1 border-t">
                  <Badge variant="outline" className="gap-1">
                    <Wallet className="h-3 w-3" />
                    Depósito de garantía
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    ID {selectedDeposit.depo_id}
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
