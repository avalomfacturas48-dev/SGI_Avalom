import React, { useState } from "react";
import useRentalStore from "@/lib/zustand/useRentalStore";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PencilIcon, TrashIcon } from "lucide-react";
import EditMonthlyRentModal from "./editMonthlyRentModal";
import { toast } from "sonner";
import { AvaAlquilerMensual } from "@/lib/types";
import ManageActions from "@/components/dataTable/manageActions";

const MonthsBetween: React.FC = () => {
  const { monthlyRents, deleteMonthlyRent } = useRentalStore();

  const handleDelete = (alqm_id: string) => {
    const { success, message } = deleteMonthlyRent(alqm_id);

    if (success) {
      toast.success("Éxito", { description: message });
    } else {
      toast.error("Error", { description: message });
    }
  };

  return (
    <>
      <div className="space-y-4">
        {monthlyRents.map((rent) => (
          <Card key={rent.alqm_id} className="bg-background">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                {rent.alqm_identificador}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                <strong>Fecha Inicio:</strong>{" "}
                {new Date(rent.alqm_fechainicio).toLocaleDateString()}
              </p>
              <p>
                <strong>Fecha Fin:</strong>{" "}
                {new Date(rent.alqm_fechafin).toLocaleDateString()}
              </p>
              <p>
                <strong>Monto Total:</strong> ₡{rent.alqm_montototal}
              </p>
              <div className="flex gap-4 mt-4">
                <ManageActions
                  titleButton="Editar Alquiler Mensual"
                  title="Editar Alquiler Mensual"
                  description="Modifique los datos del alquiler mensual."
                  variant="default"
                  classn="ml-4"
                  icon={<PencilIcon className="h-4 w-4" />}
                  FormComponent={
                    <EditMonthlyRentModal
                      alqmId={ rent.alqm_id}
                      onSuccess={() => {}}
                    />
                  }
                />
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(rent.alqm_id)}
                  className="flex items-center gap-2"
                >
                  <TrashIcon className="h-4 w-4" />
                  Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
};

export default MonthsBetween;
