"use client";

import { BreadcrumbResponsive } from "@/components/breadcrumbResponsive";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FinishedRentForm } from "./finishedRentForm";
import { RentalInfoCard } from "./rentalInfoCard";
import useFinishedRentalStore from "@/lib/zustand/useFinishedRentalStore";
import axios from "axios";
import cookie from "js-cookie";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

const BodyFinishedRent: React.FC = () => {
  const {
    setSelectedRental,
    setClientes,
    setPropiedad,
    setDeposito,
    setHayPagosPendientes,
    setLoading,
    isLoading,
  } = useFinishedRentalStore();
  const { alqId } = useParams();

  useEffect(() => {
    const fetchRental = async () => {
      setLoading(true);
      try {
        const token = cookie.get("token");
        if (!token) throw new Error("Token no disponible");

        const response = await axios.get(
          `/api/accounting/finishedrent/finalize/${alqId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response?.data?.success) {
          const data = response.data.data;
          setSelectedRental(data.alquiler);
          setClientes(data.clientes);
          setPropiedad(data.propiedad);
          setDeposito(data.deposito);
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
  }, [alqId]);

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <Card>
          <CardHeader className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-8 w-56" />
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
      <Card className="flex flex-col sm:flex-row justify-between items-center">
        <CardHeader>
          <BreadcrumbResponsive
            items={[
              { label: "Inicio", href: "/homePage" },
              { label: "Contabilidad", href: "/accounting" },
              { label: "Finalizar Alquiler" },
            ]}
          />
          <CardTitle className="text-xl sm:text-2xl font-bold mb-4 sm:mb-0">
            Finalizar Alquiler
          </CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Finalizar Alquiler
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <RentalInfoCard />
          <FinishedRentForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default BodyFinishedRent;
