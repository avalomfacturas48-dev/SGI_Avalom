"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home, Plus } from "lucide-react";
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
import { BreadcrumbResponsive } from "@/components/breadcrumbResponsive";
import ManageActions from "@/components/dataTable/manageActions";
import BuildForm from "./buildFormProps";
import PropertyForm from "./mantProperty/propertyFormProps";
import PropertyCard from "./mantProperty/PropertyCard";
import useTypeStore from "@/lib/zustand/typeStore";
import { AvaEdificio } from "@/lib/types";

interface BodyBuildingDetailProps {
  ediId: string;
}

const BodyBuildingDetail: React.FC<BodyBuildingDetailProps> = ({ ediId }) => {
  const router = useRouter();
  const [building, setBuilding] = useState<AvaEdificio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [openNewProperty, setOpenNewProperty] = useState(false);
  const { fetchTypes, types } = useTypeStore();

  const fetchBuilding = useCallback(async () => {
    try {
      const token = cookie.get("token");
      const response = await axios.get(`/api/building/${ediId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.data.data) setBuilding(response.data.data);
    } catch (error) {
      console.error("Error al obtener edificio:", error);
    } finally {
      setIsLoading(false);
    }
  }, [ediId]);

  useEffect(() => {
    fetchBuilding();
  }, [fetchBuilding]);

  useEffect(() => {
    if (types.length === 0) fetchTypes();
  }, [fetchTypes, types]);

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <Card className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <CardHeader className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <div className="p-4">
            <Skeleton className="h-9 w-28" />
          </div>
        </Card>
        <Card>
          <CardHeader className="space-y-2">
            <Skeleton className="h-6 w-52" />
            <Skeleton className="h-4 w-40" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-9 w-36" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="space-y-2">
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!building) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <p className="text-muted-foreground">Edificio no encontrado.</p>
        <Button variant="outline" onClick={() => router.push("/mantBuild")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a edificios
        </Button>
      </div>
    );
  }

  const properties = building.ava_propiedad || [];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      {/* Header */}
      <Card className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <CardHeader>
          <BreadcrumbResponsive
            items={[
              { label: "Inicio", href: "/homePage" },
              { label: "Edificios", href: "/mantBuild" },
              { label: building.edi_identificador },
            ]}
          />
          <CardTitle className="text-2xl text-primary font-bold">
            {building.edi_identificador}
          </CardTitle>
          {building.edi_descripcion && (
            <p className="text-sm text-muted-foreground">
              {building.edi_descripcion}
            </p>
          )}
        </CardHeader>
        <div className="flex gap-2 p-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/mantBuild")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Edificios
          </Button>
        </div>
      </Card>

      {/* Formulario del edificio */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-primary font-semibold">
            Información del Edificio
          </CardTitle>
          <CardDescription>Editar datos del edificio.</CardDescription>
        </CardHeader>
        <CardContent>
          <BuildForm
            building={building}
            action="edit"
            onSuccess={fetchBuilding}
          />
        </CardContent>
      </Card>

      {/* Propiedades */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-primary">Propiedades</h2>
            <p className="text-sm text-muted-foreground">
              {properties.length}{" "}
              {properties.length === 1
                ? "propiedad registrada"
                : "propiedades registradas"}
              . Haz clic en una para ver sus detalles.
            </p>
          </div>
          <ManageActions
            open={openNewProperty}
            onOpenChange={setOpenNewProperty}
            variant="default"
            titleButton="Nueva Propiedad"
            icon={<Plus className="mr-2 h-4 w-4" />}
            title="Nueva Propiedad"
            description="Agregar una propiedad a este edificio"
            FormComponent={
              <PropertyForm
                action="create"
                entity={building.edi_id}
                onSuccess={() => {
                  setOpenNewProperty(false);
                  fetchBuilding();
                }}
              />
            }
          />
        </div>

        {properties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground space-y-3 border-2 border-dashed rounded-xl">
            <Home className="h-12 w-12 opacity-20" />
            <p className="font-medium">Sin propiedades</p>
            <p className="text-sm">
              Agrega la primera propiedad con el botón de arriba.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map((property) => (
              <PropertyCard
                key={property.prop_id}
                property={property}
                ediId={ediId}
                onRefresh={fetchBuilding}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BodyBuildingDetail;
