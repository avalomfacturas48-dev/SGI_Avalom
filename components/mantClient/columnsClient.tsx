"use client";

import React, { useState } from "react";
import axios from "axios";
import cookie from "js-cookie";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Eye, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import ClientAlertDialog from "@/components/alertDialog";
import ClienteForm from "@/components/mantClient/clienteFormProps";
import ManageActions from "@/components/dataTable/manageActions";
import { RowActions, RowActionButton } from "@/components/dataTable/rowActions";
import { Button } from "@/components/ui/button";
import useClientStore from "@/lib/zustand/clientStore";
import { Cliente } from "@/lib/types";

export const columnsClient: ColumnDef<Cliente>[] = [
  {
    accessorKey: "cli_nombre",
    header: ({ column }) => (
      <Button
        variant="table"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Nombre
        <ArrowUpDown className="text-orange ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "cli_papellido",
    header: ({ column }) => (
      <Button
        variant="table"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Apellido
        <ArrowUpDown className="text-orange ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "cli_cedula",
    header: "Cédula",
  },
  {
    accessorKey: "cli_correo",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Correo
        <ArrowUpDown className="text-orange ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const cliente = row.original;
      const removeClient = useClientStore((s) => s.removeClient);
      const [openView, setOpenView] = useState(false);
      const [openEdit, setOpenEdit] = useState(false);
      const [openDelete, setOpenDelete] = useState(false);

      const handleDelete = async () => {
        try {
          const token = cookie.get("token");
          if (!token) throw new Error("No hay token");
          await axios.delete(`/api/client/${cliente.cli_id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          removeClient(cliente.cli_id);
          toast.success("Cliente eliminado");
        } catch (err: any) {
          toast.error(err.message || "Error al eliminar");
        }
      };

      return (
        <>
          <RowActions>
            <RowActionButton
              label="Ver Cliente"
              icon={<Eye className="h-4 w-4" />}
              onClick={() => setOpenView(true)}
            />
            <RowActionButton
              label="Editar Cliente"
              icon={<Pencil className="h-4 w-4" />}
              onClick={() => setOpenEdit(true)}
            />
            <RowActionButton
              label="Borrar Cliente"
              icon={<Trash2 className="h-4 w-4" />}
              variant="destructive"
              onClick={() => setOpenDelete(true)}
            />
          </RowActions>

          {/* Diálogos controlados por estado */}
          <ManageActions
            hideTrigger
            open={openView}
            onOpenChange={setOpenView}
            title="Detalles de Cliente"
            description="Visualiza los datos del cliente"
            FormComponent={
              <ClienteForm
                action="view"
                entity={cliente}
                onSuccess={() => setOpenView(false)}
              />
            }
          />

          <ManageActions
            hideTrigger
            open={openEdit}
            onOpenChange={setOpenEdit}
            title="Editar Cliente"
            description="Modifica la información del cliente"
            FormComponent={
              <ClienteForm
                action="edit"
                entity={cliente}
                onSuccess={() => setOpenEdit(false)}
              />
            }
          />

          <ClientAlertDialog
            hideTrigger
            open={openDelete}
            onOpenChange={setOpenDelete}
            title="¿Estás seguro?"
            description="Esta acción no se puede deshacer."
            triggerText="Borrar Cliente"
            cancelText="Cancelar"
            actionText="Continuar"
            onAction={handleDelete}
          />
        </>
      );
    },
    enableSorting: false,
    enableColumnFilter: false,
  },
];
