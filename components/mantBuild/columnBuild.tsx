"use client";
import axios from "axios";
import cookie from "js-cookie";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Home, KeyRound, Trash2 } from "lucide-react";
import useBuildingStore from "@/lib/zustand/buildStore";
import { Badge } from "@/components/ui/badge";
import { AvaEdificio } from "@/lib/types";
import AlertDialog from "@/components/alertDialog";
import { RowActions, RowActionButton } from "@/components/dataTable/rowActions";
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
    meta: {
      headerClassName: "hidden lg:table-cell",
      cellClassName: "hidden lg:table-cell",
    },
  },
  {
    id: "propiedades",
    header: () => (
      <span className="flex items-center font-medium">
        <Home className="h-4 w-4 mr-1" />
        Propiedades
      </span>
    ),
    cell: ({ row }) => {
      const total = row.original.ava_propiedad?.length ?? 0;
      return (
        <Badge variant="secondary" className="font-mono">
          {total}
        </Badge>
      );
    },
  },
  {
    id: "ocupacion",
    header: () => (
      <span className="flex items-center font-medium">
        <KeyRound className="h-4 w-4 mr-1" />
        Ocupadas
      </span>
    ),
    cell: ({ row }) => {
      const props = row.original.ava_propiedad ?? [];
      const total = props.length;
      const ocupadas = props.filter(
        (p) => (p.ava_alquiler?.length ?? 0) > 0
      ).length;
      if (total === 0)
        return <span className="text-muted-foreground text-sm">—</span>;
      const libres = total - ocupadas;
      return (
        <div className="flex items-center gap-1.5">
          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-400"
          >
            {ocupadas} ocupadas
          </Badge>
          {libres > 0 && (
            <Badge variant="outline" className="text-muted-foreground">
              {libres} libres
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "edi_codigopostal",
    header: "Código Postal",
    meta: {
      headerClassName: "hidden xl:table-cell",
      cellClassName: "hidden xl:table-cell",
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const building = row.original;
      const { removeBuilding } = useBuildingStore();
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
        <>
          <RowActions>
            <RowActionButton
              label="Borrar Edificio"
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
            description="Esta acción no se puede deshacer. Está seguro de que desea borrar este Edificio?"
            triggerText="Borrar Edificio"
            cancelText="Cancelar"
            actionText="Continuar"
            onAction={handleAction}
          />
        </>
      );
    },
  },
];
