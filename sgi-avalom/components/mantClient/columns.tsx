"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Cliente } from "@/lib/types";
import ManageClientActions from "./manageClientActions";
import { Edit, Eye, ArrowUpDown, MoreHorizontal } from "lucide-react";

export const columns: ColumnDef<Cliente>[] = [
  // {
  //   id: "select",
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={
  //         table.getIsAllPageRowsSelected() ||
  //         (table.getIsSomePageRowsSelected() && "indeterminate")
  //       }
  //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //       aria-label="Select all"
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label="Select row"
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  {
    accessorKey: "cli_nombre",
    header: ({ column }) => {
      return (
        <Button
          variant="table"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nombre
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "cli_papellido",
    header: ({ column }) => {
      return (
        <Button
          variant="table"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Apellido
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "cli_cedula",
    header: "Cedula",
  },
  {
    accessorKey: "cli_correo",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Correo
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    id: "ver",
    cell: ({ row }) => {
      const cliente = row.original;
      return (
        <ManageClientActions
          title={"Ver cliente"}
          description={"Visualiza los datos del cliente"}
          action={"view"}
          classn={"p-0 m-0 h-5"}
          variant={"ghost"}
          icon={<Eye />}
          cliente={cliente}
        />
      );
    },
  },
  {
    id: "editar",
    cell: ({ row }) => {
      const cliente = row.original;
      return (
        <ManageClientActions
          title={"Editar Cliente"}
          description={"Edita los datos del cliente"}
          action={"edit"}
          classn={"p-0 m-0 h-5"}
          variant={"ghost"}
          icon={<Edit />}
          cliente={cliente}
        />
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const cliente = row.original;

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
              onClick={(event) => {
                navigator.clipboard.writeText(cliente.cli_id.toString());
              }}
            >
              Copiar ID cliente
            </DropdownMenuItem>
            <DropdownMenuItem>Borrar Cliente</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
