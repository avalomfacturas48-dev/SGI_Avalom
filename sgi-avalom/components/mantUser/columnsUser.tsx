"use client";

import { useState } from "react";
import axios from "axios";
import cookie from "js-cookie";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import useUserStore from "@/lib/zustand/userStore";
import { User } from "@/lib/types";
import AlertDialog from "@/components/alertDialog";
import UserForm from "@/components/mantUser/UserFormProps";
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
import { useUser } from "@/lib/UserContext";
import { toast } from "sonner";

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "usu_nombre",
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
    accessorKey: "usu_papellido",
    header: ({ column }) => (
      <Button
        variant="table"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Primer Apellido
        <ArrowUpDown className="text-orange ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "usu_cedula",
    header: "Cédula",
  },
  {
    accessorKey: "usu_correo",
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
    accessorKey: "usu_estado",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.getValue("usu_estado") as string;
      return (
        <span
          className={`font-medium ${
            status === "A"
              ? "text-green-600"
              : status === "I"
              ? "text-red-600"
              : ""
          }`}
        >
          {status === "A"
            ? "Activo"
            : status === "I"
            ? "Inactivo"
            : "Desconocido"}
        </span>
      );
    },
  },
  {
    accessorKey: "usu_rol",
    header: "Rol",
    cell: ({ row }) => {
      const role = row.getValue("usu_rol") as string;
      return (
        <span>
          {role === "A"
            ? "Administrador"
            : role === "J"
            ? "Jefe"
            : role === "E"
            ? "Empleado"
            : role === "R"
            ? "Auditor"
            : "Desconocido"}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const user = row.original;
      const removeUser = useUserStore((s) => s.removeUser);
      const { user: currentUser } = useUser();

      const [dropdownOpen, setDropdownOpen] = useState(false);
      const [openEdit, setOpenEdit] = useState(false);

      const canEdit =
        (currentUser?.usu_rol === "A" &&
          ["A", "E", "R"].includes(user.usu_rol)) ||
        (currentUser?.usu_rol === "J" &&
          ["A", "J", "E", "R"].includes(user.usu_rol)) ||
        (currentUser?.usu_rol === "E" && ["E", "R"].includes(user.usu_rol));

      const handleDelete = async () => {
        try {
          const token = cookie.get("token");
          if (!token) throw new Error("No hay token disponible");
          await axios.delete(`/api/users/${user.usu_id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          removeUser(user.usu_id);
          toast.success("Usuario eliminado", {
            description: `El usuario ${user.usu_nombre} fue eliminado correctamente.`,
          });
          setDropdownOpen(false);
        } catch (error) {
          toast.error("Error", {
            description: "No se pudo eliminar el usuario.",
          });
        }
      };

      return (
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel className="text-center">
              Acciones
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Ver Usuario */}
            <DropdownMenuItem asChild>
              <ManageActions
                titleButton="Ver Usuario"
                title="Detalles de Usuario"
                description="Visualiza los datos del usuario"
                variant="ghost"
                classn="p-4 m-0 h-8 w-full"
                FormComponent={
                  <UserForm action="view" entity={user} onSuccess={() => {}} />
                }
              />
            </DropdownMenuItem>

            {canEdit && (
              <>
                {/* Editar Usuario */}
                <DropdownMenuItem asChild>
                  <ManageActions
                    open={openEdit}
                    onOpenChange={setOpenEdit}
                    titleButton="Editar Usuario"
                    title="Editar Usuario"
                    description="Modifica los datos del usuario"
                    variant="ghost"
                    classn="p-4 m-0 h-8 w-full"
                    FormComponent={
                      <UserForm
                        action="edit"
                        entity={user}
                        onSuccess={() => {
                          setOpenEdit(false);
                          setDropdownOpen(false);
                        }}
                      />
                    }
                  />
                </DropdownMenuItem>

                {/* Borrar Usuario */}
                <DropdownMenuItem asChild onClick={(e) => e.stopPropagation()}>
                  <AlertDialog
                    title="¿Estás seguro?"
                    description="Esta acción no se puede deshacer."
                    triggerText="Borrar Usuario"
                    cancelText="Cancelar"
                    actionText="Continuar"
                    classn="p-4 m-0 h-8 w-full"
                    variant="ghost"
                    onAction={handleDelete}
                  />
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableSorting: false,
    enableColumnFilter: false,
  },
];
