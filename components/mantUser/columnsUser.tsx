"use client";

import { useState } from "react";
import axios from "axios";
import cookie from "js-cookie";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Eye, Pencil, Trash2 } from "lucide-react";
import useUserStore from "@/lib/zustand/userStore";
import { User } from "@/lib/types";
import AlertDialog from "@/components/alertDialog";
import UserForm from "@/components/mantUser/UserFormProps";
import ManageActions from "@/components/dataTable/manageActions";
import { RowActions, RowActionButton } from "@/components/dataTable/rowActions";
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
    meta: {
      headerClassName: "hidden lg:table-cell",
      cellClassName: "hidden lg:table-cell",
    },
  },
  {
    accessorKey: "usu_correo",
    meta: {
      headerClassName: "hidden xl:table-cell",
      cellClassName: "hidden xl:table-cell",
    },
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
    meta: {
      headerClassName: "hidden lg:table-cell",
      cellClassName: "hidden lg:table-cell",
    },
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

      const [openView, setOpenView] = useState(false);
      const [openEdit, setOpenEdit] = useState(false);
      const [openDelete, setOpenDelete] = useState(false);

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
        } catch (error) {
          toast.error("Error", {
            description: "No se pudo eliminar el usuario.",
          });
        }
      };

      return (
        <>
          <RowActions>
            <RowActionButton
              label="Ver Usuario"
              icon={<Eye className="h-4 w-4" />}
              onClick={() => setOpenView(true)}
            />
            {canEdit && (
              <>
                <RowActionButton
                  label="Editar Usuario"
                  icon={<Pencil className="h-4 w-4" />}
                  onClick={() => setOpenEdit(true)}
                />
                <RowActionButton
                  label="Borrar Usuario"
                  icon={<Trash2 className="h-4 w-4" />}
                  variant="destructive"
                  onClick={() => setOpenDelete(true)}
                />
              </>
            )}
          </RowActions>

          {/* Diálogos controlados por estado */}
          <ManageActions
            hideTrigger
            open={openView}
            onOpenChange={setOpenView}
            title="Detalles de Usuario"
            description="Visualiza los datos del usuario"
            FormComponent={
              <UserForm action="view" entity={user} onSuccess={() => {}} />
            }
          />

          {canEdit && (
            <>
              <ManageActions
                hideTrigger
                open={openEdit}
                onOpenChange={setOpenEdit}
                title="Editar Usuario"
                description="Modifica los datos del usuario"
                FormComponent={
                  <UserForm
                    action="edit"
                    entity={user}
                    onSuccess={() => setOpenEdit(false)}
                  />
                }
              />

              <AlertDialog
                hideTrigger
                open={openDelete}
                onOpenChange={setOpenDelete}
                title="¿Estás seguro?"
                description="Esta acción no se puede deshacer."
                triggerText="Borrar Usuario"
                cancelText="Cancelar"
                actionText="Continuar"
                onAction={handleDelete}
              />
            </>
          )}
        </>
      );
    },
    enableSorting: false,
    enableColumnFilter: false,
  },
];
