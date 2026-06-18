"use client";
import { useState } from "react";
import axios from "axios";
import cookie from "js-cookie";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Trash2 } from "lucide-react";
import { AvaAlquiler } from "@/lib/types";
import usePropertyStore from "@/lib/zustand/propertyStore";
import AlertDialog from "@/components/alertDialog";
import { RowActions, RowActionButton } from "@/components/dataTable/rowActions";
import { Button } from "@/components/ui/button";
import { parseISO, format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { es } from "date-fns/locale";
import { toast } from "sonner";

export const columnsRent: ColumnDef<AvaAlquiler>[] = [
  {
    accessorKey: "alq_monto",
    header: "Monto",
    cell: ({ getValue }) => {
      const value = getValue<string | null>();
      if (!value) return "Sin monto";

      const bigIntValue = BigInt(value);
      return new Intl.NumberFormat("es-CR", {
        style: "currency",
        currency: "CRC",
        maximumFractionDigits: 0,
      }).format(Number(bigIntValue));
    },
  },
  {
    accessorKey: "alq_fechapago",
    header: ({ column }) => {
      return (
        <Button
          variant="table"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Fecha de Pago
          <ArrowUpDown className="text-orange ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ getValue }) => {
      const value = getValue<string | null>();
      if (!value) return "Sin fecha";

      try {
        return format(value, "PPP", { locale: es });
      } catch {
        return "Formato inválido";
      }
    },
  },
  {
    accessorKey: "alq_estado",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.getValue("alq_estado") as string;
      return (
        <div
          className={`font-medium ${
            status === "A"
              ? "text-green-600"
              : status === "F"
              ? "text-red-600"
              : status === "C"
              ? "text-yellow-600"
              : "text-gray-600"
          }`}
        >
          {status === "A"
            ? "Activo"
            : status === "F"
            ? "Finalizado"
            : status === "C"
            ? "Cancelado"
            : "Desconocido"}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const rent = row.original;
      const { removeRental } = usePropertyStore();
      const [openDelete, setOpenDelete] = useState(false);

      const handleAction = async () => {
        try {
          const token = cookie.get("token");
          if (!token) {
            console.error("No hay token disponible");
            return;
          }

          const headers = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          };

          const response = await axios.delete(`/api/rent/${rent.alq_id}`, {
            headers,
          });
          if (response?.data?.success) {
            removeRental(rent.alq_id);
            toast.success("Éxito", {
              description: `El Alquiler ${rent.alq_id} ha sido borrado.`,
            });
          }
        } catch (error) {
          toast.error("Error", {
            description: "Error al borrar Alquiler",
          });
          console.error("Error al borrar el alquiler:", error);
        }
      };

      return (
        <>
          <RowActions>
            <RowActionButton
              label="Borrar Alquiler"
              icon={<Trash2 className="h-4 w-4" />}
              variant="destructive"
              onClick={() => setOpenDelete(true)}
            />
          </RowActions>

          <AlertDialog
            hideTrigger
            open={openDelete}
            onOpenChange={setOpenDelete}
            title="Está seguro?"
            description="Esta acción no se puede deshacer. Está seguro de que desea borrar este Alquiler?"
            triggerText="Borrar Alquiler"
            cancelText="Cancelar"
            actionText="Continuar"
            onAction={handleAction}
          />
        </>
      );
    },
  },
];
