"use client";

import type React from "react";

import { BreadcrumbResponsive } from "@/components/breadcrumbResponsive";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import useRentalStore from "@/lib/zustand/useRentalStore";
import axios from "axios";
import cookie from "js-cookie";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import MonthlyRentsView from "./monthlyRentsView";
import { DepositView } from "./depositView";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientInfoCard } from "./clientInfoCard";
import { MovementsHistory } from "./movementsHistory";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Building2, Home, Wallet } from "lucide-react";
import { formatCurrencyNoDecimals } from "@/utils/currencyConverter";

const BodyPayments: React.FC = () => {
  const {
    setSelectedRental,
    selectedRental,
    monthlyRents,
    isLoading,
    setLoadingState,
    setDeposit,
  } = useRentalStore();
  const { alqId } = useParams();

  useEffect(() => {
    const fetchRental = async () => {
      setLoadingState(true);
      try {
        const token = cookie.get("token");
        if (!token) throw new Error("Token no disponible");

        const response = await axios.get(`/api/modifiyrent/${alqId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response?.data?.success) {
          setSelectedRental(response.data.data);
          setDeposit(response.data.data.ava_deposito[0]);
        } else {
          throw new Error(response?.data?.error || "Error al cargar alquiler.");
        }
      } catch (error: any) {
        toast.error("Error", {
          description: error.message || "Error al cargar el alquiler.",
        });
      } finally {
        setLoadingState(false);
      }
    };

    if (alqId) {
      fetchRental();
    }
  }, [alqId, setSelectedRental, setLoadingState]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 sm:gap-6">
      {isLoading ? (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <CardHeader>
              <Skeleton className="h-4 w-[160px] mb-4" />
              <CardTitle className="text-lg sm:text-xl md:text-2xl">
                <Skeleton className="h-6 w-[200px]" />
              </CardTitle>
            </CardHeader>
            <div className="flex flex-wrap justify-center gap-2 p-4">
              <Skeleton className="h-9 w-36 rounded-md" />
            </div>
          </div>

          <div>
            <CardHeader className="flex flex-col sm:flex-row justify-between">
              <Skeleton className="h-6 w-[100px] mb-2" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-32 rounded-md" />
                <Skeleton className="h-8 w-24 rounded-md" />
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-6 w-36" />
              </div>
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-6 w-36" />
              </div>
            </CardContent>
          </div>

          <div>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-5 w-[200px]" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-start">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-8 w-36" />
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
                {[...Array(8)].map((_, index) => (
                  <div key={index} className="p-4 space-y-3">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-full sm:w-20" />
                      <Skeleton className="h-8 w-full sm:w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </div>
        </>
      ) : (
        <>
          {/* Header unificado con contexto del alquiler */}
          <Card className="border shadow-lg">
            <CardHeader className="pb-4">
              <BreadcrumbResponsive
                items={[
                  { label: "Inicio", href: "/homePage" },
                  { label: "Contabilidad", href: "/accounting" },
                  { label: "Movimientos" },
                ]}
              />
              <CardTitle className="text-lg sm:text-xl md:text-2xl text-primary font-bold mt-2">
                Movimientos
              </CardTitle>
              {selectedRental && (
                <div className="flex flex-wrap items-center gap-2 pt-3 mt-1 border-t">
                  {selectedRental.ava_propiedad?.ava_edificio?.edi_identificador && (
                    <Badge variant="outline" className="gap-1 font-mono">
                      <Building2 className="h-3 w-3" />
                      Edificio {selectedRental.ava_propiedad.ava_edificio.edi_identificador}
                    </Badge>
                  )}
                  {selectedRental.ava_propiedad?.prop_identificador && (
                    <Badge variant="secondary" className="gap-1 font-mono">
                      <Home className="h-3 w-3" />
                      {selectedRental.ava_propiedad.prop_identificador}
                    </Badge>
                  )}
                  {selectedRental.ava_propiedad?.ava_tipopropiedad?.tipp_nombre && (
                    <Badge variant="outline" className="capitalize">
                      {selectedRental.ava_propiedad.ava_tipopropiedad.tipp_nombre}
                    </Badge>
                  )}
                  <StatusBadge status={selectedRental.alq_estado} />
                  <span className="ml-auto text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
                    {formatCurrencyNoDecimals(Number(selectedRental.alq_monto))} / mes
                  </span>
                </div>
              )}
            </CardHeader>
          </Card>

          {/* Inquilino y Depósito */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-6">
            {selectedRental?.ava_clientexalquiler[0]?.ava_cliente && (
              <ClientInfoCard
                cliente={selectedRental.ava_clientexalquiler[0].ava_cliente}
              />
            )}
            <DepositView />
          </div>

          <Card className="border shadow-lg">
            <CardHeader className="border-b">
              <CardTitle className="text-base sm:text-xl font-bold text-foreground">
                Alquileres Mensuales
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 sm:pt-6">
              {monthlyRents.length > 0 ? (
                <MonthlyRentsView />
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    No hay alquileres mensuales registrados.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Historial consolidado de pagos y anulaciones */}
          <MovementsHistory />
        </>
      )}
    </div>
  );
};

export default BodyPayments;
