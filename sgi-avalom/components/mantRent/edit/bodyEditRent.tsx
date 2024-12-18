"use client";

import { useEffect } from "react";
import RentalForm from "@/components/mantRent/edit/rentalForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import { useParams } from "next/navigation";
import { DateRangeCalculator } from "./DateRangeCalculator";
import MonthsBetween from "./MonthsBetween";
import useRentalStore from "@/lib/zustand/useRentalStore";
import axios from "axios";
import cookie from "js-cookie";
import { toast } from "sonner";

const BodyEditRent: React.FC = () => {
  const { alqId } = useParams();
  const { setSelectedRental, monthlyRents } = useRentalStore();

  useEffect(() => {
    const fetchRental = async () => {
      try {
        const token = cookie.get("token");
        if (!token) throw new Error("Token no disponible");

        const response = await axios.get(`/api/modifiyrent/${alqId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response?.data?.success) {
          setSelectedRental(response.data.data);
        } else {
          throw new Error(response?.data?.error || "Error al cargar alquiler.");
        }
      } catch (error: any) {
        toast.error("Error", {
          description: error.message || "Error al cargar el alquiler.",
        });
      }
    };

    if (alqId) {
      fetchRental();
      console.log("fetchRental", monthlyRents.length);
    }
  }, [alqId, setSelectedRental]);

  return (
    <div className="mx-auto p-4 space-y-8">
      <Card className="bg-background flex flex-col sm:flex-row justify-between items-center">
        <CardHeader>
          <CardTitle className="text-2xl font-bold mb-4 sm:mb-0">
            Modificar alquiler
          </CardTitle>
        </CardHeader>
      </Card>

      <RentalForm
        action="edit"
        onSuccess={() => toast.success("Alquiler actualizado correctamente")}
      />

      <Tabs defaultValue={monthlyRents.length === 0 ? "create" : "view"}>
        <TabsList>
          <TabsTrigger value="view" disabled={monthlyRents.length === 0}>
            Alquileres Mensuales Existentes
          </TabsTrigger>
          <TabsTrigger value="create">Crear Alquileres Mensuales</TabsTrigger>
        </TabsList>
        <TabsContent value="view">
          {monthlyRents.length > 0 ? (
            <MonthsBetween /> // Cambia según tu lógica
          ) : (
            <p className="text-center text-muted-foreground">
              No hay alquileres mensuales registrados.
            </p>
          )}
        </TabsContent>
        <TabsContent value="create">
          <DateRangeCalculator />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BodyEditRent;
