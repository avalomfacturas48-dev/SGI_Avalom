import "@tanstack/react-table";

declare module "@tanstack/react-table" {
  // Permite definir clases responsive por columna que el DataTable aplica
  // a <TableHead> y <TableCell> (p. ej. "hidden lg:table-cell").
  interface ColumnMeta<TData extends RowData, TValue> {
    headerClassName?: string;
    cellClassName?: string;
  }
}
