"use client";

import cookie from "js-cookie";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  MoreHorizontal,
  Building2,
  Home,
  Calendar,
  User,
  Wallet,
  Flag,
  XCircle,
  FileDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AvaAlquiler } from "@/lib/types";
import Link from "next/link";
import DateRangeDialog from "../DateRangeDialog";
import { toast } from "sonner";
import { useState } from "react";
import { formatCurrencyNoDecimals } from "@/utils/currencyConverter";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TenantCell } from "@/components/shared/TenantCell";

export const columns: ColumnDef<AvaAlquiler>[] = [
  {
    id: "ubicacion",
    accessorFn: (row) =>
      `${row.ava_propiedad?.ava_edificio?.edi_identificador ?? ""} ${
        row.ava_propiedad?.prop_identificador ?? ""
      }`,
    header: ({ column }) => {
      return (
        <Button
          variant="table"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <Building2 className="h-4 w-4 mr-1" />
          Ubicación
          <ArrowUpDown className="text-primary ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const edificio = row.original.ava_propiedad?.ava_edificio?.edi_identificador;
      const propiedad = row.original.ava_propiedad?.prop_identificador;
      const tipo = row.original.ava_propiedad?.ava_tipopropiedad?.tipp_nombre;
      return (
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="outline" className="font-mono gap-1">
              <Building2 className="h-3 w-3" />
              {edificio || "—"}
            </Badge>
            <Badge variant="secondary" className="font-mono gap-1">
              <Home className="h-3 w-3" />
              {propiedad || "—"}
            </Badge>
          </div>
          {/* Tipo visible aquí solo cuando su columna está oculta (pantallas medianas) */}
          {tipo && (
            <span className="text-xs text-muted-foreground capitalize lg:hidden">
              {tipo}
            </span>
          )}
        </div>
      );
    },
  },
  {
    id: "inquilino",
    accessorFn: (row) =>
      row.ava_clientexalquiler?.[0]?.ava_cliente
        ? `${row.ava_clientexalquiler[0].ava_cliente.cli_nombre} ${row.ava_clientexalquiler[0].ava_cliente.cli_papellido}`
        : "",
    header: () => (
      <span className="flex items-center font-medium">
        <User className="h-4 w-4 mr-1" />
        Inquilino
      </span>
    ),
    cell: ({ row }) => <TenantCell rental={row.original} />,
  },
  {
    accessorKey: "ava_propiedad.ava_tipopropiedad.tipp_nombre",
    meta: {
      headerClassName: "hidden lg:table-cell",
      cellClassName: "hidden lg:table-cell",
    },
    header: ({ column }) => {
      return (
        <Button
          variant="table"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tipo
          <ArrowUpDown className="text-primary ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const value = row.original.ava_propiedad?.ava_tipopropiedad?.tipp_nombre;
      return (
        <Badge variant="outline" className="capitalize">
          {value || "—"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "alq_monto",
    header: ({ column }) => {
      return (
        <Button
          variant="table"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Monto Mensual
          <ArrowUpDown className="text-primary ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const amount = Number(row.getValue("alq_monto"));
      return <div className="font-semibold text-base">{formatCurrencyNoDecimals(amount)}</div>;
    },
  },
  {
    accessorKey: "alq_fechapago",
    meta: {
      headerClassName: "hidden xl:table-cell",
      cellClassName: "hidden xl:table-cell",
    },
    header: ({ column }) => {
      return (
        <Button
          variant="table"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <Calendar className="h-4 w-4 mr-1" />
          Día de Pago
          <ArrowUpDown className="text-primary ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const value = row.getValue<string | null>("alq_fechapago");
      if (!value) return <span className="text-muted-foreground text-sm">Sin definir</span>;

      try {
        const date = new Date(value);
        const dayOfMonth = date.getDate();
        return (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-mono">
              Día {dayOfMonth}
            </Badge>
            <span className="text-xs text-muted-foreground">de cada mes</span>
          </div>
        );
      } catch {
        return <span className="text-muted-foreground text-sm">—</span>;
      }
    },
  },
  {
    accessorKey: "alq_estado",
    header: "Estado",
    cell: ({ row }) => (
      <StatusBadge status={row.getValue("alq_estado") as string} />
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Acciones</span>,
    cell: ({ row }) => {
      const rental = row.original;
      const isActive = rental.alq_estado === "A";
      const [dialogOpen, setDialogOpen] = useState(false);
      const [loading, setLoading] = useState(false);

      const downloadPDF = async (alq_id: number, from: string, to: string) => {
        try {
          setLoading(true);
          const url = `/api/export-rental?alq_id=${alq_id}&from=${from}&to=${to}`;
          const res = await fetch(url, {
            headers: { Authorization: `Bearer ${cookie.get("token") ?? ""}` },
          });
          if (!res.ok) throw new Error(`Error ${res.status}`);

          // Obtener el nombre del archivo del header
          const disposition = res.headers.get("Content-Disposition");
          let filename = "reporte.pdf";
          if (disposition && disposition.includes("filename=")) {
            const match = disposition.match(/filename="?([^"]+)"?/);
            if (match && match[1]) filename = match[1];
          }

          const blob = await res.blob();
          const pdfUrl = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = pdfUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(pdfUrl);
        } catch (err: any) {
          console.error(err);
          toast.error("No se pudo generar el reporte del alquiler.");
        } finally {
          setLoading(false);
        }
      };

      return (
        <div className="flex items-center justify-end gap-2">
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
              {isActive && (
                <>
                  <Link href={`/accounting/payments/${rental.alq_id}`}>
                    <DropdownMenuItem>
                      <Wallet className="mr-2 h-4 w-4" />
                      Realizar movimiento
                    </DropdownMenuItem>
                  </Link>
                  <Link href={`/accounting/finishedrent/${rental.alq_id}`}>
                    <DropdownMenuItem>
                      <Flag className="mr-2 h-4 w-4" />
                      Finalizar Alquiler
                    </DropdownMenuItem>
                  </Link>
                  <Link href={`/accounting/canceledrent/${rental.alq_id}`}>
                    <DropdownMenuItem className="text-destructive focus:text-destructive">
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancelar Alquiler
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem
                onClick={() => setDialogOpen(true)}
                disabled={loading}
              >
                <FileDown className="mr-2 h-4 w-4" />
                {loading ? "Generando…" : "Exportar Alquiler"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Este dialog está FUERA del menú */}
          <DateRangeDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            title="Exportar Alquiler"
            onGenerate={async (from, to) => {
              await downloadPDF(Number(rental.alq_id), from, to);
              setDialogOpen(false);
            }}
          />
        </div>
      );
    },
  },
];
