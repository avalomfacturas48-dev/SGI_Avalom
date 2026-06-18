"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import cookie from "js-cookie";
import { PencilIcon, TrashIcon, CalendarIcon, LockIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import MonthlyRentForm from "./monthlyRentForm";
import ManageActions from "@/components/dataTable/manageActions";
import { formatToCR } from "@/utils/dateUtils";
import useRentalStore from "@/lib/zustand/useRentalStore";
import AlertDialog from "@/components/alertDialog";
import { cn } from "@/lib/utils";

interface MonthsBetweenProps {
  mode: "view" | "create";
}

const MONTHLY_STATUS_CONFIG: Record<
  string,
  { label: string; borderClass: string; badgeClass: string }
> = {
  P: {
    label: "Pagado",
    borderClass: "border-l-emerald-500",
    badgeClass:
      "bg-emerald-500/10 text-emerald-700 border border-emerald-500/30 dark:text-emerald-400",
  },
  A: {
    label: "Atrasado",
    borderClass: "border-l-red-500",
    badgeClass:
      "bg-red-500/10 text-red-700 border border-red-500/30 dark:text-red-400",
  },
  I: {
    label: "Incompleto",
    borderClass: "border-l-amber-400",
    badgeClass:
      "bg-amber-500/10 text-amber-700 border border-amber-500/30 dark:text-amber-400",
  },
  R: {
    label: "Cortesía",
    borderClass: "border-l-blue-500",
    badgeClass:
      "bg-blue-500/10 text-blue-700 border border-blue-500/30 dark:text-blue-400",
  },
};

const FALLBACK_STATUS = {
  label: "Desconocido",
  borderClass: "border-l-muted",
  badgeClass: "bg-muted text-muted-foreground border border-border",
};

const MonthsBetween: React.FC<MonthsBetweenProps> = ({ mode }) => {
  const { monthlyRents, deleteRent, createMonthlyRents } = useRentalStore();
  const [openNew, setOpenNew] = useState(false);
  const [openEditId, setOpenEditId] = useState<string | null>(null);
  const [rents, setRents] = useState(
    mode === "create" ? createMonthlyRents : monthlyRents
  );

  useEffect(() => {
    setRents(mode === "create" ? createMonthlyRents : monthlyRents);
  }, [createMonthlyRents, monthlyRents, mode]);

  const handleDelete = async (alqm_id: string, alqm_identificador: string) => {
    if (mode === "create") {
      const { success } = deleteRent("createMonthlyRents", alqm_id);
      if (success) {
        toast.success(`Alquiler ${alqm_identificador} eliminado.`);
      } else {
        toast.error(`Error al eliminar ${alqm_identificador}.`);
      }
    } else {
      try {
        const token = cookie.get("token");
        if (!token) throw new Error("Token no disponible");

        const response = await axios.delete(`/api/monthlyrent/${alqm_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response?.data?.success) {
          deleteRent("monthlyRents", alqm_id);
          toast.success(`Alquiler ${alqm_identificador} eliminado.`);
        } else {
          throw new Error(response?.data?.error || "Error al eliminar.");
        }
      } catch (error: any) {
        toast.error(error.message || "Error al eliminar el alquiler mensual.");
      }
    }
  };

  return (
    <>
      {mode === "view" && (
        <div className="mb-5">
          <ManageActions
            open={openNew}
            onOpenChange={setOpenNew}
            titleButton="Nuevo Alquiler Mensual"
            title="Crear Alquiler Mensual"
            description="Ingrese los datos del alquiler mensual."
            variant="default"
            icon={<PlusIcon className="h-4 w-4" />}
            FormComponent={
              <MonthlyRentForm
                action="create"
                alqmId={null}
                mode={mode}
                onSuccess={() => setOpenNew(false)}
              />
            }
          />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {rents
          .sort(
            (a, b) =>
              new Date(a.alqm_fechainicio).getTime() -
              new Date(b.alqm_fechainicio).getTime()
          )
          .map((rent) => {
            const hasPayments = rent.ava_pago && rent.ava_pago.length > 0;
            const isThisOpen = openEditId === rent.alqm_id;
            const status =
              MONTHLY_STATUS_CONFIG[rent.alqm_estado] ?? FALLBACK_STATUS;

            return (
              <Card
                key={rent.alqm_id}
                className={cn(
                  "border-l-4 flex flex-col overflow-hidden",
                  status.borderClass
                )}
              >
                {/* Header */}
                <div className="px-4 pt-4 pb-2 flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold leading-tight truncate text-foreground">
                    {rent.alqm_identificador}
                  </p>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium flex-shrink-0",
                      status.badgeClass
                    )}
                  >
                    {status.label}
                  </span>
                </div>

                {/* Body */}
                <CardContent className="px-4 py-2 flex-1 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarIcon className="h-3 w-3 flex-shrink-0" />
                    <span>
                      {formatToCR(rent.alqm_fechainicio)}
                      <span className="mx-1 text-muted-foreground/50">→</span>
                      {formatToCR(rent.alqm_fechafin)}
                    </span>
                  </div>

                  <p className="text-base font-bold text-foreground">
                    {Number(rent.alqm_montototal).toLocaleString("es-CR", {
                      style: "currency",
                      currency: "CRC",
                      maximumFractionDigits: 0,
                    })}
                  </p>

                  {hasPayments && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <LockIcon className="h-3 w-3" />
                      <span>Tiene pagos</span>
                    </div>
                  )}
                </CardContent>

                {/* Footer: acciones */}
                <div className="border-t flex items-center justify-between px-2 py-1">
                  <TooltipProvider delayDuration={150}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <ManageActions
                            open={isThisOpen}
                            onOpenChange={(open) =>
                              setOpenEditId(open ? rent.alqm_id : null)
                            }
                            titleButton=""
                            title="Editar Alquiler Mensual"
                            description="Modifique los datos del alquiler mensual."
                            variant="ghost"
                            classn={cn(
                              "h-8 w-8 p-0 text-muted-foreground hover:text-foreground",
                              hasPayments && "pointer-events-none opacity-40"
                            )}
                            disabled={hasPayments}
                            icon={<PencilIcon className="h-3.5 w-3.5" />}
                            FormComponent={
                              <MonthlyRentForm
                                action="edit"
                                alqmId={rent.alqm_id}
                                mode={mode}
                                onSuccess={() => setOpenEditId(null)}
                              />
                            }
                          />
                        </div>
                      </TooltipTrigger>
                      {hasPayments && (
                        <TooltipContent
                          side="top"
                          className="text-xs max-w-[160px]"
                        >
                          Tiene pagos registrados, no se puede editar.
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider delayDuration={150}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <AlertDialog
                            title="¿Eliminar alquiler mensual?"
                            description={`Se eliminará "${rent.alqm_identificador}". Esta acción no se puede deshacer.`}
                            cancelText="Cancelar"
                            actionText="Eliminar"
                            actionDestructive
                            classn={cn(
                              "h-8 w-8 p-0 text-muted-foreground hover:text-destructive",
                              hasPayments && "pointer-events-none opacity-40"
                            )}
                            variant="ghost"
                            onAction={() =>
                              handleDelete(
                                rent.alqm_id,
                                rent.alqm_identificador
                              )
                            }
                            icon={<TrashIcon className="h-3.5 w-3.5" />}
                            triggerText=""
                            disabled={hasPayments}
                          />
                        </div>
                      </TooltipTrigger>
                      {hasPayments && (
                        <TooltipContent
                          side="top"
                          className="text-xs max-w-[160px]"
                        >
                          Tiene pagos registrados, no se puede eliminar.
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </Card>
            );
          })}
      </div>
    </>
  );
};

export default MonthsBetween;
