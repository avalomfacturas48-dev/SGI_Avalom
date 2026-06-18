"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import cookie from "js-cookie";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BreadcrumbResponsive } from "@/components/breadcrumbResponsive";
import { DataTable } from "@/components/dataTable/data-table";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCurrencyNoDecimals } from "@/utils/currencyConverter";
import PropertyForm from "./propertyFormProps";
import RentalForm from "./mantRent/rentForm";
import { columnsRent } from "./mantRent/columnRent";
import usePropertyStore from "@/lib/zustand/propertyStore";
import { AvaAlquiler } from "@/lib/types";

interface BodyPropertyDetailProps {
  ediId: string;
  propId: string;
}

const BodyPropertyDetail: React.FC<BodyPropertyDetailProps> = ({
  ediId,
  propId,
}) => {
  const router = useRouter();
  const {
    selectedProperty,
    selectedRental,
    setSelectedProperty,
    setSelectedRental,
  } = usePropertyStore();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("history");

  const fetchProperty = useCallback(async () => {
    try {
      const token = cookie.get("token");
      const response = await axios.get(`/api/property/${propId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.data.data) {
        setSelectedProperty(response.data.data);
      }
    } catch (error) {
      console.error("Error al obtener propiedad:", error);
    } finally {
      setIsLoading(false);
    }
  }, [propId, setSelectedProperty]);

  useEffect(() => {
    setSelectedRental(null);
    setIsLoading(true);
    fetchProperty();
    return () => {
      setSelectedRental(null);
    };
  }, [propId]);

  const handleSelectRental = (rental: AvaAlquiler) => {
    setSelectedRental(rental);
    setActiveTab("history");
  };

  const handleRentalSuccess = () => {
    setSelectedRental(null);
    fetchProperty();
    setActiveTab("history");
  };

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <Card className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <CardHeader className="space-y-2">
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-7 w-44" />
          </CardHeader>
          <div className="p-4">
            <Skeleton className="h-9 w-28" />
          </div>
        </Card>
        <Card>
          <CardHeader className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-44" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="space-y-2">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-4 w-52" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full mb-4" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-3 border-b last:border-0">
                <Skeleton className="h-5 flex-1" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!selectedProperty) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <p className="text-muted-foreground">Propiedad no encontrada.</p>
        <Button
          variant="outline"
          onClick={() => router.push(`/mantBuild/${ediId}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al edificio
        </Button>
      </div>
    );
  }

  const building = selectedProperty.ava_edificio;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      {/* Header */}
      <Card className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <CardHeader>
          <BreadcrumbResponsive
            items={[
              { label: "Inicio", href: "/homePage" },
              { label: "Edificios", href: "/mantBuild" },
              {
                label: building?.edi_identificador || "Edificio",
                href: `/mantBuild/${ediId}`,
              },
              { label: selectedProperty.prop_identificador },
            ]}
          />
          <CardTitle className="text-2xl text-primary font-bold">
            {selectedProperty.prop_identificador}
          </CardTitle>
          {selectedProperty.prop_descripcion && (
            <p className="text-sm text-muted-foreground">
              {selectedProperty.prop_descripcion}
            </p>
          )}
        </CardHeader>
        <div className="flex gap-2 p-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/mantBuild/${ediId}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {building?.edi_identificador || "Edificio"}
          </Button>
        </div>
      </Card>

      {/* Formulario de propiedad */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-primary font-semibold">
            Información
          </CardTitle>
          <CardDescription>Editar datos de la propiedad.</CardDescription>
        </CardHeader>
        <CardContent>
          <PropertyForm
            property={selectedProperty}
            action="edit"
            onSuccess={fetchProperty}
          />
        </CardContent>
      </Card>

      {/* Alquileres */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-primary font-semibold">
            Alquileres
          </CardTitle>
          <CardDescription>
            Historial de alquileres de esta propiedad.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="history">Historial</TabsTrigger>
              <TabsTrigger
                value="create"
                onClick={() => setSelectedRental(null)}
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Nuevo Alquiler
              </TabsTrigger>
            </TabsList>

            <TabsContent value="history" className="space-y-4">
              <DataTable
                columns={columnsRent}
                data={selectedProperty.ava_alquiler || []}
                onRowClick={handleSelectRental}
                renderMobileCard={(rental, actions) => (
                  <Card className="hover:bg-muted/50 transition-colors">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-base">
                          {rental.alq_monto
                            ? formatCurrencyNoDecimals(Number(rental.alq_monto))
                            : "Sin monto"}
                        </p>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={rental.alq_estado} />
                          <div onClick={(e) => e.stopPropagation()}>{actions}</div>
                        </div>
                      </div>
                      {rental.alq_fechapago && (
                        <div className="border-t pt-3 text-sm">
                          <span className="text-muted-foreground">Fecha de pago: </span>
                          <span>
                            {new Date(rental.alq_fechapago).toLocaleDateString(
                              "es-CR",
                              { day: "2-digit", month: "long", year: "numeric" }
                            )}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              />
              {selectedRental && (
                <>
                  <Separator className="my-4 h-1 rounded-xl" />
                  <RentalForm action="edit" onSuccess={handleRentalSuccess} />
                </>
              )}
            </TabsContent>

            <TabsContent value="create">
              <RentalForm action="create" onSuccess={handleRentalSuccess} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default BodyPropertyDetail;
