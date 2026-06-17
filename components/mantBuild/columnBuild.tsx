"use client";
import axios from "axios";
import cookie from "js-cookie";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import useBuildingStore from "@/lib/zustand/buildStore";
import { AvaEdificio } from "@/lib/types";
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
import { toast } from "sonner";
import { useState } from "react";

export const columns: ColumnDef<AvaEdificio>[] = [
  {
    accessorKey: "edi_identificador",
    header: ({ column }) => {
      return (
        <Button
          variant="table"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Identificador
          <ArrowUpDown className="text-orange ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "edi_descripcion",
    header: "Descripción",
  },
  {
    accessorKey: "edi_direccion",
    header: "Dirección",
  },
  {
    accessorKey: "edi_codigopostal",
    header: "Código Postal",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const building = row.original;
      const { removeBuilding } = useBuildingStore();
      const [dropdownOpen, setDropdownOpen] = useState(false);

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

          const response = await axios.delete(
            `/api/building/${building.edi_id}`,
            { headers }
          );

          if (response?.data?.success) {
            removeBuilding(building.edi_id);
            toast.success("Edificio eliminado", {
              description: `El Edificio ${building.edi_identificador} ha sido borrado.`,
            });
          } else {
            toast.error("No se puede eliminar el edificio", {
              description: response?.data?.error || "Error desconocido",
            });
          }
        } catch (error: any) {
          toast.error("Error", {
            description:
              error.response?.data?.error ||
              error.message ||
              "Error interno del servidor",
          });
        }
      };

      return (
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir Menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel className="text-center">
              Acciones
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild onClick={(e) => e.stopPropagation()}>
              <AlertDialog
                title="Está seguro?"
                description="Esta acción no se puede deshacer. Está seguro de que desea borrar este Edificio?"
                triggerText="Borrar Edificio"
                cancelText="Cancelar"
                actionText="Continuar"
                classn={"p-4 m-0 h-8 w-full"}
                variant={"ghost"}
                onAction={handleAction}
              />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
