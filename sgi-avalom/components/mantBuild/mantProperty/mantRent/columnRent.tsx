"use client";
import axios from "axios";
import cookie from "js-cookie";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { AvaAlquiler } from "@/lib/types"; // Importa AvaProperty si lo defines
import usePropertyStore from "@/lib/zustand/propertyStore";
import AlertDialog from "@/components/alertDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { parseISO, format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { es } from "date-fns/locale";

export const columnsRent: ColumnDef<AvaAlquiler>[] = [
  {
    accessorKey: "alq_id",
    header: ({ column }) => {
      return (
        <Button
          variant="table"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Identificador
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "alq_monto",
    header: "Monto",
  },
  {
    accessorKey: "alq_fechapago",
    header: "Fecha de Pago",
    cell: ({ getValue }) => {
      const value = getValue<string | null>();
      if (!value) return "Sin fecha";

      const date = toZonedTime(parseISO(value), "America/Costa_Rica");
      return format(date, "PPP", { locale: es });
    },
  },
  {
    accessorKey: "alq_estado",
    header: "Estado",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const rent = row.original;
      const { removeRental } = usePropertyStore();

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
          if (response.data) {
            removeRental(rent.alq_id);
          }
        } catch (error) {
          console.error("Error al borrar el alquiler:", error);
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir Menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                navigator.clipboard.writeText(rent.alq_id.toString());
              }}
            >
              Copiar ID Alquiler
            </DropdownMenuItem>
            <div className="h-8 relative flex cursor-default select-none items-center rounded-sm text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
              <AlertDialog
                title="Está seguro?"
                description="Esta acción no se puede deshacer. Está seguro de que desea borrar este Alquiler?"
                triggerText="Borrar Alquiler"
                cancelText="Cancelar"
                actionText="Continuar"
                classn={"p-4 m-0 h-8 w-full"}
                variant={"ghost"}
                onAction={handleAction}
              />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
