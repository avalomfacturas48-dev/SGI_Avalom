"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Cliente } from "@/lib/types";

export const columns: ColumnDef<Cliente>[] = [
  {
    accessorKey: "cli_nombre",
    header: "Nombre",
  },
  {
    accessorKey: "cli_papellido",
    header: "Apellido",
  },
  {
    accessorKey: "cli_cedula",
    header: "Cedula",
  },
  {
    accessorKey: "cli_correo",
    header: "Correo",
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
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(cliente.cli_id.toString())}
            >
              Copiar ID cliente
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Ver cliente</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
