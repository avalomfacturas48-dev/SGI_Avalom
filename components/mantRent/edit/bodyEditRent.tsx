"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import cookie from "js-cookie";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import RentalForm from "@/components/mantRent/edit/rentalForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../../ui/card";
import { Button } from "@/components/ui/button";
import { BreadcrumbResponsive } from "@/components/breadcrumbResponsive";
import { Skeleton } from "@/components/ui/skeleton";
import { DateRangeCalculator } from "./DateRangeCalculator";
import MonthsBetween from "./MonthsBetween";
import DepositForm from "./depositForm";
import ContractCard from "./contractCard";
import { RentalContextBar } from "@/components/shared/RentalContextBar";
import useRentalStore from "@/lib/zustand/useRentalStore";
import { Eye, Plus, SaveIcon } from "lucide-react";

const BodyEditRent: React.FC = () => {
  const { alqId } = useParams();
  const {
    selectedRental,
    setSelectedRental,
    monthlyRents,
    isLoading,
    setLoadingState,
    setRents,
    createMonthlyRents,
    setDeposit,
  } = useRentalStore();
  const [selectedTab, setSelectedTab] = useState<"view" | "create">("create");

  const handleSaveAll = async () => {
    try {
      const token = cookie.get("token");
      if (!token) toast.error("Token no disponible");

      const response = await axios.post(
        `/api/monthlyrent/saveall`,
        { rents: createMonthlyRents, alqId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response?.data?.success) {
        const savedRents = response.data.data;
        setRents("monthlyRents", savedRents);
        setSelectedTab("view");
      } else {
        toast.error(response?.data?.error || "Error al guardar alquileres.");
      }
    } catch (error: any) {
      toast.error("Error", {
        description: error.message || "Error al guardar alquileres.",
      });
    }
  };

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
          setSelectedTab(
            response.data.data.ava_alquilermensual?.length > 0
              ? "view"
              : "create"
          );
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
    <div className="mx-auto p-4 space-y-8 max-w-7xl">
      {isLoading ? (
        <>
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-10 w-40" />
          </div>

          <div className="space-y-6 p-4">
            <CardHeader>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-64 mt-2" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-32 md:justify-self-end" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-10 w-full md:w-1/2" />
              </div>

              <div className="space-y-3">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-10 w-60" />
                <Skeleton className="h-16 w-full md:w-1/2 rounded-md" />
              </div>
            </CardContent>
          </div>

          <div className="space-y-6 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-12 w-1/2" />
          </div>

          <div className="space-y-4 p-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-5 w-64" />
            <Skeleton className="h-28 w-full rounded-md" />
          </div>

          <div className="space-y-6 p-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-40 mt-4" />
          </div>

          <div className="space-y-4 p-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-10 w-52" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-40 w-full rounded-md" />
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          <Card className="flex flex-col sm:flex-row justify-between items-center">
            <CardHeader>
              <BreadcrumbResponsive
                items={[
                  { label: "Inicio", href: "/homePage" },
                  { label: "Gestión de alquileres", href: "/mantRent" },
                  {
                    label: selectedRental?.ava_propiedad?.prop_identificador
                      ? `Propiedad ${selectedRental.ava_propiedad.prop_identificador}`
                      : "Modificar alquiler",
                  },
                ]}
              />
              <CardTitle className="text-2xl text-primary font-bold mb-4 sm:mb-0">
                {selectedRental?.ava_propiedad?.prop_identificador
                  ? `Modificar alquiler · Propiedad ${selectedRental.ava_propiedad.prop_identificador}`
                  : "Modificar alquiler"}
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Barra de contexto: edificio · propiedad · inquilino · estado */}
          <RentalContextBar rental={selectedRental} />

          {/* Grid de 2 columnas para pantallas grandes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Columna Izquierda: Alquiler y Clientes en un mismo card */}
            <RentalForm action="edit" onSuccess={() => {}} />

            {/* Columna Derecha: Contrato */}
            <ContractCard />
          </div>

          {/* Depósito abajo, ocupando todo el ancho */}
          <DepositForm onSuccess={() => {}} />

          <Card className="w-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-primary font-semibold">
                    Alquileres Mensuales
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {monthlyRents.length > 0
                      ? `${monthlyRents.length} período${monthlyRents.length !== 1 ? "s" : ""} registrado${monthlyRents.length !== 1 ? "s" : ""}`
                      : "Sin períodos mensuales aún"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <Tabs
                value={selectedTab}
                onValueChange={(value) =>
                  setSelectedTab(value as "view" | "create")
                }
              >
                <TabsList className="w-full sm:w-auto">
                  <TabsTrigger
                    value="view"
                    className="flex items-center gap-2 flex-1 sm:flex-none"
                    disabled={monthlyRents.length === 0}
                  >
                    <Eye className="h-4 w-4" />
                    Existentes
                    {monthlyRents.length > 0 && (
                      <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                        {monthlyRents.length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value="create"
                    className="flex items-center gap-2 flex-1 sm:flex-none"
                    disabled={monthlyRents.length > 0}
                  >
                    <Plus className="h-4 w-4" />
                    Crear período
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="view" className="mt-6">
                  {monthlyRents.length > 0 ? (
                    <MonthsBetween mode="view" />
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No hay alquileres mensuales registrados.
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="create" className="mt-6">
                  <DateRangeCalculator />
                  <div className="flex justify-end mt-6 pt-4 border-t">
                    <Button
                      onClick={handleSaveAll}
                      className="flex items-center gap-2"
                    >
                      <SaveIcon className="h-4 w-4" />
                      Guardar Períodos
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default BodyEditRent;
