"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import cookie from "js-cookie";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { DataTable } from "./data_table_filter";
import { columns } from "./columnsRent";
import { BreadcrumbResponsive } from "../breadcrumbResponsive";
import { Skeleton } from "../ui/skeleton";
import { RentalSummaryCards } from "../shared/RentalSummaryCards";
import useRentalStore from "@/lib/zustand/rentalStore";

const BodyRent: React.FC = () => {
  const { rentals, setRentals } = useRentalStore();
  const [statusFilter, setStatusFilter] = useState<string[]>(["A"]);
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRentals = async () => {
      const token = cookie.get("token");
      if (!token) {
        console.error("No hay token disponible");
        return;
      }

      try {
        const response = await axios.get("/api/accounting", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setRentals(response.data.data);
      } catch (error) {
        console.error("Error al buscar alquileres: " + error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRentals();
  }, [setRentals]);

  const activeCount = rentals.filter((r) => r.alq_estado === "A").length;
  const finishedCount = rentals.filter((r) => r.alq_estado === "F").length;
  const canceledCount = rentals.filter((r) => r.alq_estado === "C").length;

  return (
    <div className="mx-auto p-4 space-y-6 max-w-7xl">
      {isLoading ? (
        <>
          <div className="space-y-4 mb-3">
            <div className="h-4 w-40 sm:w-56 rounded-md bg-muted animate-pulse" />
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-8">
              <div className="w-60 h-8 rounded-md bg-muted animate-pulse" />
              <div className="flex flex-wrap gap-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton
                    key={i}
                    className="h-8 w-[120px] rounded-md bg-muted animate-pulse"
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row items-center sm:justify-between gap-4 sm:gap-8 m-10"
              >
                <Skeleton className="w-full sm:w-[200px] h-[30px] rounded-full" />
                <Skeleton className="w-full sm:w-[100px] h-[30px] rounded-full" />
                <Skeleton className="w-full sm:w-[150px] h-[30px] rounded-full" />
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <Card className="border shadow-lg">
            <CardHeader>
              <BreadcrumbResponsive
                items={[
                  { label: "Inicio", href: "/homePage" },
                  { label: "Gestión de alquileres" },
                ]}
              />
              <CardTitle className="text-2xl text-primary font-bold">
                Gestión de Alquileres
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {rentals.length} alquileres registrados · {activeCount} activos.
                Gestiona contratos, inquilinos y mensualidades.
              </p>
            </CardHeader>
          </Card>

          {/* Tarjetas de resumen (clic para filtrar) */}
          <RentalSummaryCards
            activeCount={activeCount}
            finishedCount={finishedCount}
            canceledCount={canceledCount}
            statusFilter={statusFilter}
            onFilter={setStatusFilter}
          />

          <Card className="border shadow-lg">
            <CardContent className="p-6">
              <DataTable
                columns={columns}
                data={rentals}
                statusFilter={statusFilter}
                propertyTypeFilter={propertyTypeFilter}
                onStatusChange={setStatusFilter}
                onPropertyTypeChange={setPropertyTypeFilter}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default BodyRent;
