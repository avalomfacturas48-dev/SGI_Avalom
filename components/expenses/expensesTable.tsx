"use client";

import { useState, useMemo, memo } from "react";
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
  Eye,
  Edit,
  X,
  ChevronDown,
  Search,
  Filter,
  Columns,
} from "lucide-react";
import { RowActions, RowActionButton } from "@/components/dataTable/rowActions";
import type { AvaGasto } from "@/lib/types/entities";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { convertToCostaRicaTime } from "@/utils/dateUtils";

interface ExpensesTableProps {
  data: AvaGasto[];
  onViewDetails: (expense: AvaGasto) => void;
  onEdit: (expense: AvaGasto) => void;
  onCancel: (expense: AvaGasto) => void;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  tipoFilter?: string;
  estadoFilter?: string;
  onTipoFilterChange?: (tipo: string) => void;
  onEstadoFilterChange?: (estado: string) => void;
}

export const ExpensesTable = memo(function ExpensesTable({ 
  data, 
  onViewDetails, 
  onEdit, 
  onCancel,
  currentPage,
  pageSize,
  totalPages,
  totalRecords,
  onPageChange,
  onPageSizeChange,
  tipoFilter: externalTipoFilter,
  estadoFilter: externalEstadoFilter,
  onTipoFilterChange,
  onEstadoFilterChange,
}: ExpensesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState("");
  
  // Usar filtros externos si están disponibles, sino usar estado local
  const [internalTipoFilter, setInternalTipoFilter] = useState<string>("all");
  const [internalEstadoFilter, setInternalEstadoFilter] = useState<string>("all");
  
  const tipoFilter = externalTipoFilter !== undefined ? externalTipoFilter : internalTipoFilter;
  const estadoFilter = externalEstadoFilter !== undefined ? externalEstadoFilter : internalEstadoFilter;
  
  const handleTipoFilterChange = (value: string) => {
    if (onTipoFilterChange) {
      onTipoFilterChange(value);
    } else {
      setInternalTipoFilter(value);
    }
  };
  
  const handleEstadoFilterChange = (value: string) => {
    if (onEstadoFilterChange) {
      onEstadoFilterChange(value);
    } else {
      setInternalEstadoFilter(value);
    }
  };

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
        meta: {
          headerClassName: "hidden md:table-cell",
          cellClassName: "hidden md:table-cell",
        },
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
        meta: {
          headerClassName: "hidden xl:table-cell",
          cellClassName: "hidden xl:table-cell",
        },
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
        meta: {
          headerClassName: "hidden xl:table-cell",
          cellClassName: "hidden xl:table-cell",
        },
        cell: ({ row }) => {
          const fecha = row.getValue("gas_fecha") as string;
          if (!fecha) return <span className="text-muted-foreground">-</span>;
          // Convertir la fecha a zona horaria de Costa Rica antes de formatear
          const fechaCR = convertToCostaRicaTime(fecha);
          // Formatear la fecha (fechaCR ya está en formato yyyy-MM-dd)
          const fechaFormateada = formatDate(fechaCR + "T00:00:00");
          return (
            <div className="flex items-center gap-1 text-sm">
              <Calendar className="size-3 text-muted-foreground" />
              {fechaFormateada}
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
            <RowActions>
              <RowActionButton
                label="Ver detalles"
                icon={<Eye className="h-4 w-4" />}
                onClick={() => onViewDetails(expense)}
              />
              {isActive && (
                <>
                  <RowActionButton
                    label="Editar"
                    icon={<Edit className="h-4 w-4" />}
                    onClick={() => onEdit(expense)}
                  />
                  <RowActionButton
                    label="Anular"
                    icon={<X className="h-4 w-4" />}
                    variant="destructive"
                    onClick={() => onCancel(expense)}
                  />
                </>
              )}
            </RowActions>
          );
        },
      },
    ],
    [onViewDetails, onEdit, onCancel]
  );

  // Los datos ya vienen filtrados del servidor, no necesitamos filtrar localmente
  const filteredData = data;

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
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
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-auto sm:flex-1 sm:min-w-[180px] sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar gastos..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-8 h-9 sm:h-10 text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={tipoFilter} onValueChange={handleTipoFilterChange}>
            <SelectTrigger className="w-[140px] h-9 sm:h-10">
              <Filter className="mr-2 size-4" />
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="S">Servicio</SelectItem>
              <SelectItem value="M">Mantenimiento</SelectItem>
            </SelectContent>
          </Select>

          <Select value={estadoFilter} onValueChange={handleEstadoFilterChange}>
            <SelectTrigger className="w-[140px] h-9 sm:h-10">
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
                handleTipoFilterChange("all");
                handleEstadoFilterChange("all");
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

      {/* Móvil: cards */}
      <div className="sm:hidden space-y-2">
        {table.getRowModel().rows.length > 0 ? (
          table.getRowModel().rows.map((row) => {
            const expense = row.original;
            const isActive = expense.gas_estado === "A";
            const fechaCR = expense.gas_fecha ? convertToCostaRicaTime(expense.gas_fecha) : null;
            const fechaFormateada = fechaCR ? formatDate(fechaCR + "T00:00:00") : null;
            return (
              <div key={row.id} className="rounded-lg border p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {expense.gas_tipo === "S" ? (
                      <Badge className="bg-blue-500 hover:bg-blue-600 text-[11px]">
                        <Zap className="mr-1 size-3" />Servicio
                      </Badge>
                    ) : (
                      <Badge className="bg-orange-500 hover:bg-orange-600 text-[11px]">
                        <Wrench className="mr-1 size-3" />Mantenimiento
                      </Badge>
                    )}
                    {isActive ? (
                      <Badge className="bg-green-500 hover:bg-green-600 text-[11px]">Activo</Badge>
                    ) : (
                      <Badge variant="destructive" className="text-[11px]">Anulado</Badge>
                    )}
                  </div>
                  <RowActions>
                    <RowActionButton label="Ver detalles" icon={<Eye className="h-4 w-4" />} onClick={() => onViewDetails(expense)} />
                    {isActive && (
                      <>
                        <RowActionButton label="Editar" icon={<Edit className="h-4 w-4" />} onClick={() => onEdit(expense)} />
                        <RowActionButton label="Anular" icon={<X className="h-4 w-4" />} variant="destructive" onClick={() => onCancel(expense)} />
                      </>
                    )}
                  </RowActions>
                </div>

                <div>
                  <p className="text-sm font-medium">{expense.gas_concepto}</p>
                  {expense.gas_descripcion && (
                    <p className="text-xs text-muted-foreground line-clamp-1">{expense.gas_descripcion}</p>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 min-w-0">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground min-w-0">
                    <Building2 className="size-3 flex-shrink-0" />
                    <span className="truncate">
                      {expense.ava_edificio?.edi_identificador}
                      {expense.ava_propiedad && ` · ${expense.ava_propiedad.prop_identificador}`}
                    </span>
                  </div>
                  <span className="text-sm font-semibold flex-shrink-0">{formatCurrency(expense.gas_monto)}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  {fechaFormateada && (
                    <div className="flex items-center gap-1">
                      <Calendar className="size-3" />
                      <span>{fechaFormateada}</span>
                    </div>
                  )}
                  {expense.ava_servicio && (
                    <Badge variant="outline" className="text-[11px]">{expense.ava_servicio.ser_nombre}</Badge>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-8">
            <div className="rounded-full bg-muted p-3">
              <Search className="size-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No se encontraron gastos</p>
            <p className="text-xs text-muted-foreground">Intenta ajustar los filtros de búsqueda</p>
          </div>
        )}
      </div>

      {/* Desktop: tabla */}
      <div className="hidden sm:block rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn((header.column.columnDef.meta as any)?.headerClassName)}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/50 transition-colors duration-200 animate-in fade-in slide-in-from-left-5"
                  style={{ animationDelay: `${index * 30}ms`, animationFillMode: "backwards" }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn((cell.column.columnDef.meta as any)?.cellClassName)}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 py-8">
                    <div className="rounded-full bg-muted p-3">
                      <Search className="size-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium">No se encontraron gastos</p>
                    <p className="text-xs text-muted-foreground">Intenta ajustar los filtros de búsqueda</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium text-muted-foreground">
            Mostrando{" "}
            <span className="font-semibold text-foreground">
              {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalRecords)}
            </span>{" "}
            de{" "}
            <span className="font-semibold text-foreground">{totalRecords}</span> resultados
          </div>
          <Badge variant="secondary" className="ml-2">
            Página {currentPage}/{totalPages}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              onPageSizeChange(Number(value));
            }}
          >
            <SelectTrigger className="w-[140px] h-9 sm:h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 50, 100].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size} por página
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(1)}
              disabled={currentPage <= 1}
              title="Primera página"
            >
              ««
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              ← Anterior
            </Button>
            
            {/* Números de página */}
            <div className="hidden items-center gap-1 lg:flex">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="icon"
                    className={`w-9 h-9 ${
                      currentPage === pageNum ? "font-bold" : ""
                    }`}
                    onClick={() => onPageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Siguiente →
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage >= totalPages}
              title="Última página"
            >
              »»
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});
