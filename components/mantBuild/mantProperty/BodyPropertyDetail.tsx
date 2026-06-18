"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
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
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!selectedProperty) {
    return (
      <div className="mx-auto p-4 max-w-7xl space-y-4">
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
    <div className="mx-auto p-4 space-y-6 max-w-7xl">
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
