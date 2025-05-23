"use client";

import React, { useState } from "react";
import axios from "axios";
import cookie from "js-cookie";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import ClientAlertDialog from "@/components/alertDialog";
import ClienteForm from "@/components/mantClient/clienteFormProps";
import ManageActions from "@/components/dataTable/manageActions";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
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
      const [openEdit, setOpenEdit] = useState(false);
      const [dropdownOpen, setDropdownOpen] = useState(false);

      const handleDelete = async () => {
        try {
          const token = cookie.get("token");
          if (!token) throw new Error("No hay token");
          await axios.delete(`/api/client/${cliente.cli_id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          removeClient(cliente.cli_id);
          toast.success("Cliente eliminado");
          setDropdownOpen(false);
        } catch (err: any) {
          toast.error(err.message || "Error al eliminar");
        }
      };

      return (
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuLabel className="text-center">
              Acciones
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Ver Cliente */}
            <DropdownMenuItem asChild>
              <ManageActions
                titleButton="Ver Cliente"
                title="Detalles de Cliente"
                description="Visualiza los datos del cliente"
                variant="ghost"
                classn="p-4 m-0 h-8 w-full"
                FormComponent={
                  <ClienteForm
                    action="view"
                    entity={cliente}
                    onSuccess={() => setDropdownOpen(false)}
                  />
                }
              />
            </DropdownMenuItem>

            {/* Editar Cliente */}
            <DropdownMenuItem asChild>
              <ManageActions
                open={openEdit}
                onOpenChange={setOpenEdit}
                titleButton="Editar Cliente"
                title="Editar Cliente"
                description="Modifica la información del cliente"
                variant="ghost"
                classn="p-4 m-0 h-8 w-full"
                FormComponent={
                  <ClienteForm
                    action="edit"
                    entity={cliente}
                    onSuccess={() => {
                      setOpenEdit(false);
                      setDropdownOpen(false);
                    }}
                  />
                }
              />
            </DropdownMenuItem>

            {/* Borrar Cliente */}
            <DropdownMenuItem asChild onClick={(e) => e.stopPropagation()}>
              <ClientAlertDialog
                title="¿Estás seguro?"
                description="Esta acción no se puede deshacer."
                triggerText="Borrar Cliente"
                cancelText="Cancelar"
                actionText="Continuar"
                classn="p-4 m-0 h-8 w-full"
                variant="ghost"
                onAction={handleDelete}
              />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableSorting: false,
    enableColumnFilter: false,
  },
];
