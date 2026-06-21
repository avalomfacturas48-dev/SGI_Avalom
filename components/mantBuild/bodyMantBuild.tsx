"use client";

import { useEffect, useState } from "react";
import { Building2, Plus } from "lucide-react";
import cookie from "js-cookie";
import axios from "axios";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { BreadcrumbResponsive } from "../breadcrumbResponsive";
import ManageActions from "@/components/dataTable/manageActions";
import BuildForm from "./buildFormProps";
import BuildingCard from "./BuildingCard";
import useBuildingStore from "@/lib/zustand/buildStore";
import useTypeStore from "@/lib/zustand/typeStore";

const BodyMantBuild: React.FC = () => {
  const { setBuildings, buildings } = useBuildingStore();
  const { fetchTypes, types } = useTypeStore();
  const [isLoading, setIsLoading] = useState(true);
  const [openNew, setOpenNew] = useState(false);

  useEffect(() => {
    const fetchBuildings = async () => {
      const token = cookie.get("token");
      if (!token) return;
      try {
        const response = await axios.get("/api/building", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (response.data.data) setBuildings(response.data.data);
      } catch (error) {
        console.error("Error al buscar edificios:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBuildings();
  }, [setBuildings]);

  useEffect(() => {
    if (types.length === 0) fetchTypes();
  }, [fetchTypes, types]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      {isLoading ? (
        <>
          <div className="flex justify-end">
            <div className="h-9 w-32 rounded-md bg-muted animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-52 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        </>
      ) : (
        <>
          <Card className="flex flex-col sm:flex-row justify-between items-center">
            <CardHeader>
              <BreadcrumbResponsive
                items={[
                  { label: "Inicio", href: "/homePage" },
                  { label: "Gestión de edificios" },
                ]}
              />
              <CardTitle className="text-2xl text-primary font-bold">
                Gestión de Edificios
              </CardTitle>
            </CardHeader>
            <div className="flex flex-wrap justify-center gap-2 p-4">
              <ManageActions
                open={openNew}
                onOpenChange={setOpenNew}
                variant="default"
                titleButton="Nuevo Edificio"
                icon={<Plus className="mr-2 h-4 w-4" />}
                title="Nuevo Edificio"
                description="Ingresa un nuevo Edificio"
                FormComponent={
                  <BuildForm
                    action="create"
                    onSuccess={() => setOpenNew(false)}
                  />
                }
              />
            </div>
          </Card>

          {buildings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground space-y-3">
              <Building2 className="h-14 w-14 opacity-20" />
              <p className="text-lg font-medium">No hay edificios registrados</p>
              <p className="text-sm">
                Crea tu primer edificio con el botón "Nuevo Edificio"
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {buildings.map((building) => (
                <BuildingCard key={building.edi_id} building={building} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BodyMantBuild;
