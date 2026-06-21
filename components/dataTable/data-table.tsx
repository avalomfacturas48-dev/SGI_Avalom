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
  Table,
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
import { useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const globalFilter: FilterFn<any> = (row, columnId, filterValue) => {
  return row.original[columnId]
    ?.toString()
    .toLowerCase()
    .includes(filterValue.toLowerCase());
};

interface ServerPagination {
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRowClick?: (row: TData) => void;
  renderMobileCard?: (row: TData, actions: React.ReactNode) => React.ReactNode;
  // Props para modo servidor (opcionales)
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  serverPagination?: ServerPagination;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
  renderMobileCard,
  searchValue,
  onSearchChange,
  serverPagination,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [localSearch, setLocalSearch] = useState("");
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);

  const isServerSide = !!serverPagination;
  const searchInput = searchValue !== undefined ? searchValue : localSearch;
  const handleSearchInput = onSearchChange ?? setLocalSearch;

  const tablePaginationState = isServerSide
    ? { pageIndex: 0, pageSize: 99999 }
    : { pageSize, pageIndex };

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter: isServerSide ? undefined : localSearch,
      columnVisibility,
      rowSelection,
      pagination: tablePaginationState,
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setLocalSearch,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: isServerSide
      ? undefined
      : (updater) => {
          const newState =
            typeof updater === "function"
              ? updater({ pageIndex, pageSize })
              : updater;
          setPageIndex(newState.pageIndex);
          setPageSize(newState.pageSize);
        },
    globalFilterFn: globalFilter,
  });

  const displayPage = isServerSide ? serverPagination!.page : pageIndex + 1;
  const displayPageSize = isServerSide ? serverPagination!.pageSize : pageSize;
  const totalPages = isServerSide
    ? Math.ceil(serverPagination!.total / serverPagination!.pageSize) || 1
    : table.getPageCount();
  const canPrevPage = isServerSide
    ? serverPagination!.page > 1
    : table.getCanPreviousPage();
  const canNextPage = isServerSide
    ? serverPagination!.page < totalPages
    : table.getCanNextPage();

  const handlePrevPage = () => {
    if (isServerSide) serverPagination!.onPageChange(serverPagination!.page - 1);
    else table.previousPage();
  };
  const handleNextPage = () => {
    if (isServerSide) serverPagination!.onPageChange(serverPagination!.page + 1);
    else table.nextPage();
  };
  const handlePageSizeChange = (size: number) => {
    if (isServerSide) {
      serverPagination!.onPageSizeChange(size);
    } else {
      setPageSize(size);
      setPageIndex(0);
    }
  };

  return (
    <div className="w-full space-y-4 p-4 sm:p-6">
      {/* Barra de búsqueda y columnas */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <Input
          placeholder="Buscar..."
          value={searchInput}
          onChange={(e) => handleSearchInput(e.target.value)}
          className="w-full sm:max-w-xs text-sm"
          aria-label="Buscar en la tabla"
        />
        <div className={cn(renderMobileCard && "hidden sm:block")}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="borderOrange" className="w-full sm:w-auto">
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
                    {column.id.replace(/^.*?_/, "")}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Vista móvil: cards (< sm) */}
      {renderMobileCard && (
        <div className="sm:hidden space-y-3">
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => {
              const actionsCell = row
                .getVisibleCells()
                .find((c) => c.column.id === "actions");
              const actions = actionsCell
                ? flexRender(
                    actionsCell.column.columnDef.cell,
                    actionsCell.getContext()
                  )
                : null;
              return (
                <div key={row.id} onClick={() => onRowClick?.(row.original)}>
                  {renderMobileCard(row.original, actions)}
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No hay datos
            </div>
          )}
        </div>
      )}

      {/* Vista desktop: tabla */}
      <div
        className={cn(
          "flex w-full flex-col rounded-md border",
          renderMobileCard && "hidden sm:flex"
        )}
      >
        <main className="grid flex-1 items-start overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        (header.column.columnDef.meta as any)?.headerClassName
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
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
          </Table>
        </main>
      </div>

      {/* Paginación */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <p className="text-sm text-muted-foreground whitespace-nowrap">
            Página {displayPage} de {totalPages}
          </p>
          <Select
            value={String(displayPageSize)}
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
            onClick={handlePrevPage}
            disabled={!canPrevPage}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>
          <Button
            variant="green"
            size="sm"
            onClick={handleNextPage}
            disabled={!canNextPage}
          >
            Siguiente
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
