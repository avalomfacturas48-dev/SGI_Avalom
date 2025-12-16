"use client";

import { useState, useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Zap,
  Wrench,
  Calendar,
  Building2,
  MoreHorizontal,
  Eye,
  Edit,
  X,
  ChevronDown,
  Search,
  Filter,
  Columns,
} from "lucide-react";
import type { AvaGasto } from "@/lib/types/entities";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ExpensesTableProps {
  data: AvaGasto[];
  onViewDetails: (expense: AvaGasto) => void;
  onEdit: (expense: AvaGasto) => void;
  onCancel: (expense: AvaGasto) => void;
}

export function ExpensesTable({ data, onViewDetails, onEdit, onCancel }: ExpensesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [tipoFilter, setTipoFilter] = useState<string>("all");
  const [estadoFilter, setEstadoFilter] = useState<string>("all");

  const columns: ColumnDef<AvaGasto>[] = useMemo(
    () => [
      {
        accessorKey: "gas_tipo",
        header: "Tipo",
        cell: ({ row }) => {
          const tipo = row.getValue("gas_tipo") as string;
          return tipo === "S" ? (
            <Badge className="bg-blue-500 hover:bg-blue-600">
              <Zap className="mr-1 size-3" />
              Servicio
            </Badge>
          ) : (
            <Badge className="bg-orange-500 hover:bg-orange-600">
              <Wrench className="mr-1 size-3" />
              Mantenimiento
            </Badge>
          );
        },
      },
      {
        accessorKey: "gas_concepto",
        header: "Concepto",
        cell: ({ row }) => {
          const concepto = row.getValue("gas_concepto") as string;
          const descripcion = row.original.gas_descripcion;
          return (
            <div className="max-w-xs">
              <div className="font-medium">{concepto}</div>
              {descripcion && <div className="text-xs text-muted-foreground line-clamp-1">{descripcion}</div>}
            </div>
          );
        },
      },
      {
        accessorKey: "ava_edificio",
        header: "Edificio/Propiedad",
        cell: ({ row }) => {
          const edificio = row.original.ava_edificio;
          const propiedad = row.original.ava_propiedad;
          return (
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-sm">
                <Building2 className="size-3" />
                {edificio?.edi_identificador}
              </div>
              {propiedad && <div className="text-xs text-muted-foreground">{propiedad.prop_identificador}</div>}
            </div>
          );
        },
      },
      {
        accessorKey: "ava_servicio",
        header: "Servicio",
        cell: ({ row }) => {
          const servicio = row.original.ava_servicio;
          if (!servicio) return <span className="text-muted-foreground">-</span>;
          return (
            <Badge variant="outline" className="text-xs">
              {servicio.ser_nombre}
            </Badge>
          );
        },
      },
      {
        accessorKey: "gas_monto",
        header: "Monto",
        cell: ({ row }) => {
          const monto = row.getValue("gas_monto") as string;
          return <div className="text-right font-medium">{formatCurrency(monto)}</div>;
        },
      },
      {
        accessorKey: "gas_fecha",
        header: "Fecha",
        cell: ({ row }) => {
          const fecha = row.getValue("gas_fecha") as string;
          return (
            <div className="flex items-center gap-1 text-sm">
              <Calendar className="size-3 text-muted-foreground" />
              {formatDate(fecha)}
            </div>
          );
        },
      },
      {
        accessorKey: "gas_estado",
        header: "Estado",
        cell: ({ row }) => {
          const estado = row.getValue("gas_estado") as string;
          return estado === "A" ? (
            <Badge className="bg-green-500 hover:bg-green-600">Activo</Badge>
          ) : (
            <Badge variant="destructive">Anulado</Badge>
          );
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const expense = row.original;
          const isActive = expense.gas_estado === "A";

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="size-8 p-0">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onViewDetails(expense)}>
                  <Eye className="mr-2 size-4" />
                  Ver detalles
                </DropdownMenuItem>
                {isActive && (
                  <>
                    <DropdownMenuItem onClick={() => onEdit(expense)}>
                      <Edit className="mr-2 size-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive" onClick={() => onCancel(expense)}>
                      <X className="mr-2 size-4" />
                      Anular
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [onViewDetails, onEdit, onCancel]
  );

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (tipoFilter !== "all" && item.gas_tipo !== tipoFilter) return false;
      if (estadoFilter !== "all" && item.gas_estado !== estadoFilter) return false;
      return true;
    });
  }, [data, tipoFilter, estadoFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "auto",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
  });

  const activeFiltersCount = (tipoFilter !== "all" ? 1 : 0) + (estadoFilter !== "all" ? 1 : 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar gastos..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={tipoFilter} onValueChange={setTipoFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="mr-2 size-4" />
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="S">Servicio</SelectItem>
              <SelectItem value="M">Mantenimiento</SelectItem>
            </SelectContent>
          </Select>

          <Select value={estadoFilter} onValueChange={setEstadoFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="mr-2 size-4" />
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="A">Activo</SelectItem>
              <SelectItem value="D">Anulado</SelectItem>
            </SelectContent>
          </Select>

          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setTipoFilter("all");
                setEstadoFilter("all");
              }}
            >
              Limpiar filtros
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Columns className="mr-2 size-4" />
                Columnas
                <ChevronDown className="ml-2 size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="hover:bg-muted/50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No se encontraron gastos.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          Mostrando {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} a{" "}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}{" "}
          de {table.getFilteredRowModel().rows.length} resultados
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize} por página
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Anterior
            </Button>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              Siguiente
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
