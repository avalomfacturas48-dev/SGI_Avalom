"use client";

import { useState, useMemo } from "react";
import {
  ColumnDef,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  getFilteredRowModel,
  FilterFn,
} from "@tanstack/react-table";
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { AvaAlquiler } from "@/lib/types";
import { StatusFilter } from "@/components/dataTable/status-filter";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TenantInline } from "@/components/shared/TenantCell";
import { formatCurrencyNoDecimals } from "@/utils/currencyConverter";
import Link from "next/link";

const globalFilterFn: FilterFn<AvaAlquiler> = (row, columnId, filterValue) => {
  const { alq_monto, ava_propiedad, ava_clientexalquiler } = row.original;
  const propertyId = ava_propiedad?.prop_identificador;
  const buildingId = ava_propiedad?.ava_edificio?.edi_identificador;
  const tenants = (ava_clientexalquiler ?? [])
    .map((cxa) =>
      cxa.ava_cliente
        ? `${cxa.ava_cliente.cli_nombre} ${cxa.ava_cliente.cli_papellido} ${cxa.ava_cliente.cli_cedula}`
        : ""
    )
    .join(" ");

  if (!filterValue) return true;

  const lowerFilter = filterValue.toLowerCase();

  return (
    (alq_monto?.toString().toLowerCase().includes(lowerFilter) ?? false) ||
    (propertyId?.toString().toLowerCase().includes(lowerFilter) ?? false) ||
    (buildingId?.toString().toLowerCase().includes(lowerFilter) ?? false) ||
    tenants.toLowerCase().includes(lowerFilter)
  );
};

interface DataTableProps {
  columns: ColumnDef<AvaAlquiler, any>[];
  data: AvaAlquiler[];
  statusFilter: string[];
  propertyTypeFilter: string[];
  onStatusChange: (value: string[]) => void;
  onPropertyTypeChange: (value: string[]) => void;
  onRowClick?: (row: AvaAlquiler) => void;
}

export function DataTable({
  columns,
  data,
  statusFilter,
  propertyTypeFilter,
  onStatusChange,
  onPropertyTypeChange,
  onRowClick,
}: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesStatus =
        statusFilter.length === 0 || statusFilter.includes(item.alq_estado);

      const matchesPropertyType =
        propertyTypeFilter.length === 0 ||
        propertyTypeFilter.includes(
          item.ava_propiedad?.ava_tipopropiedad?.tipp_nombre || ""
        );

      return matchesStatus && matchesPropertyType;
    });
  }, [data, statusFilter, propertyTypeFilter]);

  const table = useReactTable<AvaAlquiler>({
    data: filteredData,
    columns,
    state: {
      sorting,
      globalFilter: globalFilterValue,
      columnVisibility,
      rowSelection,
      pagination: { pageSize, pageIndex },
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilterValue,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn,
    onPaginationChange: (updater) => {
      const newState =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize })
          : updater;
      setPageIndex(newState.pageIndex);
      setPageSize(newState.pageSize);
    },
  });

  const handlePageSizeChange = (size: number) => {
    table.setPageSize(size);
    table.setPageIndex(0);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "A":
        return "default";
      case "C":
        return "destructive";
      case "F":
        return "secondary";
      default:
        return "default";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="w-full space-y-4 p-4 sm:p-6">
      <div className="sticky top-0 z-10 backdrop-blur p-4 space-y-4 border-b">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto]">
          <Input
            placeholder="Buscar por inquilino, propiedad, edificio, monto..."
            value={globalFilterValue}
            onChange={(event) => setGlobalFilterValue(event.target.value)}
            className="w-full"
            aria-label="Buscar en la tabla"
          />

          <StatusFilter
            filterName="Estado"
            selectedStatuses={statusFilter}
            onStatusChange={onStatusChange}
            statuses={[
              { label: "Activo", value: "A" },
              { label: "Cancelado", value: "C" },
              { label: "Finalizado", value: "F" },
            ]}
          />

          <StatusFilter
            filterName="Tipo de Propiedad"
            selectedStatuses={propertyTypeFilter}
            onStatusChange={onPropertyTypeChange}
            statuses={[
              { label: "Departamento", value: "departamento" },
              { label: "Local", value: "local" },
            ]}
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="borderOrange" className="w-full md:w-auto">
                Columnas <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {(() => {
                      const label = column.id.split("_").pop() || column.id;
                      return label.charAt(0).toUpperCase() + label.slice(1);
                    })()}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="hidden rounded-md border sm:flex sm:w-full sm:flex-col">
        <main className="grid flex-1 items-start rounded-md border overflow-x-auto">
          <UITable>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "whitespace-nowrap",
                        (header.column.columnDef.meta as any)?.headerClassName
                      )}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => onRowClick?.(row.original)}
                    className="cursor-pointer hover:bg-muted"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          (cell.column.columnDef.meta as any)?.cellClassName
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No hay datos
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </UITable>
        </main>
      </div>

      <div className="sm:hidden space-y-3">
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => {
            const data = row.original;
            const isActive = data.alq_estado === "A";
            return (
              <Card key={row.id} className="cursor-pointer hover:bg-muted/50">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="outline" className="font-mono">
                        {data.ava_propiedad?.ava_edificio?.edi_identificador ||
                          "—"}
                      </Badge>
                      <Badge variant="secondary" className="font-mono">
                        {data.ava_propiedad?.prop_identificador || "—"}
                      </Badge>
                    </div>
                    <Badge variant={getStatusBadgeVariant(data.alq_estado)}>
                      {data.alq_estado === "A"
                        ? "Activo"
                        : data.alq_estado === "C"
                        ? "Cancelado"
                        : "Finalizado"}
                    </Badge>
                  </div>

                  <TenantInline rental={data} />

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <div className="text-muted-foreground">Monto</div>
                      <div className="font-medium">
                        {formatCurrencyNoDecimals(Number(data.alq_monto))}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Día de pago</div>
                      <div>{formatDate(data.alq_fechapago)}</div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-2 border-t">
                    {isActive && (
                      <Link
                        href={`/accounting/payments/${data.alq_id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full"
                      >
                        <Button
                          size="sm"
                          className="flex items-center gap-2 w-full"
                        >
                          <ChevronRight className="h-4 w-4" />
                          Realizar movimiento
                        </Button>
                      </Link>
                    )}
                    {isActive && (
                      <div className="flex gap-2">
                        <Link
                          href={`/accounting/finishedrent/${data.alq_id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            Finalizar
                          </Button>
                        </Link>
                        <Link
                          href={`/accounting/canceledrent/${data.alq_id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1"
                        >
                          <Button
                            variant="destructive"
                            size="sm"
                            className="w-full"
                          >
                            Cancelar
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No hay datos
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <p className="text-sm text-muted-foreground whitespace-nowrap">
            Página {table.getState().pagination.pageIndex + 1} de{" "}
            {table.getPageCount()}
          </p>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => handlePageSizeChange(Number(value))}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 50].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size} filas
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <Button
            variant="green"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          <Button
            variant="green"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
