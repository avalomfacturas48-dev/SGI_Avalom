"use client";

import { BreadcrumbResponsive } from "@/components/breadcrumbResponsive";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CanceledRentForm } from "./CanceledRentForm";
import { RentalInfoCardCanceled } from "./rentalInfoCardCanceled";
import useCanceledRentalStore from "@/lib/zustand/useCanceledRentalStore";
import axios from "axios";
import cookie from "js-cookie";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

const BodyCanceledRent: React.FC = () => {
  const {
    setSelectedRental,
    setDeposito,
    setPropiedad,
    setClientes,
    setLoading,
    isLoading,
    setHayPagosPendientes,
  } = useCanceledRentalStore();
  const { alqId } = useParams();

  useEffect(() => {
    const fetchRental = async () => {
      setLoading(true);
      try {
        const token = cookie.get("token");
        if (!token) throw new Error("Token no disponible");

        const response = await axios.get(
          `/api/accounting/canceledrent/cancel/${alqId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response?.data?.success) {
          const data = response.data.data;
          setSelectedRental(data.alquiler);
          setDeposito(data.deposito);
          setPropiedad(data.propiedad);
          setClientes(data.clientes);
          setHayPagosPendientes(data.hayPagosPendientes);
        } else {
          throw new Error(response?.data?.error || "Error al cargar alquiler.");
        }
      } catch (error: any) {
        const message =
          error.response?.data?.error || error.message || "Error desconocido";
        toast.error("Error", {
          description: message,
        });
      } finally {
        setLoading(false);
      }
    };

    if (alqId) {
      fetchRental();
    }
  }, [
    alqId,
    setSelectedRental,
    setDeposito,
    setPropiedad,
    setClientes,
    setLoading,
  ]);

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <Card>
          <CardHeader className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-8 w-52" />
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-44" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-9 w-32" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <Card className="bg-background flex flex-col sm:flex-row justify-between items-center">
        <CardHeader>
          <BreadcrumbResponsive
            items={[
              { label: "Inicio", href: "/homePage" },
              { label: "Contabilidad", href: "/accounting" },
              { label: "Cancelar Alquiler" },
            ]}
          />
          <CardTitle className="text-xl sm:text-2xl font-bold mb-4 sm:mb-0">
            Cancelar Alquiler
          </CardTitle>
        </CardHeader>
      </Card>

      <Card className="bg-background">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Cancelar Alquiler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RentalInfoCardCanceled />
          <CanceledRentForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default BodyCanceledRent;
