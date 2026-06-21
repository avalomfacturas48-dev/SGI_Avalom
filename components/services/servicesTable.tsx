"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RowActions, RowActionButton } from "@/components/dataTable/rowActions";
import { Pencil, Trash2 } from "lucide-react";
import type { AvaServicio } from "@/lib/types/entities";

interface ServicesTableProps {
  services: AvaServicio[];
  onEdit: (service: AvaServicio) => void;
  onDelete: (service: AvaServicio) => void;
}

export function ServicesTable({ services, onEdit, onDelete }: ServicesTableProps) {
  return (
    <>
      {/* Vista de tabla — desktop */}
      <div className="hidden sm:block rounded-md border min-w-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Tipo de Servicio</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead>Medio de Pago</TableHead>
              <TableHead className="w-[70px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.length > 0 ? (
              services.map((service) => (
                <TableRow key={service.ser_id} className="hover:bg-muted/50">
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {service.ser_codigo}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{service.ser_nombre}</TableCell>
                  <TableCell>{service.ser_servicio || "-"}</TableCell>
                  <TableCell className="text-muted-foreground">{service.ser_negocio || "-"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{service.ser_mediopago || "-"}</TableCell>
                  <TableCell>
                    <RowActions>
                      <RowActionButton
                        label="Editar"
                        icon={<Pencil className="h-4 w-4" />}
                        onClick={() => onEdit(service)}
                      />
                      <RowActionButton
                        label="Eliminar"
                        icon={<Trash2 className="h-4 w-4" />}
                        variant="destructive"
                        onClick={() => onDelete(service)}
                      />
                    </RowActions>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No hay servicios registrados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Vista de tarjetas — móvil */}
      <div className="space-y-2 sm:hidden">
        {services.length > 0 ? (
          services.map((service) => (
            <div key={service.ser_id} className="rounded-md border p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 space-y-1">
                  <Badge variant="outline" className="font-mono">
                    {service.ser_codigo}
                  </Badge>
                  <p className="font-medium break-words">{service.ser_nombre}</p>
                </div>
                <RowActions>
                  <RowActionButton
                    label="Editar"
                    icon={<Pencil className="h-4 w-4" />}
                    onClick={() => onEdit(service)}
                  />
                  <RowActionButton
                    label="Eliminar"
                    icon={<Trash2 className="h-4 w-4" />}
                    variant="destructive"
                    onClick={() => onDelete(service)}
                  />
                </RowActions>
              </div>

              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-muted-foreground">Tipo de Servicio</span>
                <span className="text-right">{service.ser_servicio || "-"}</span>
              </div>
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-muted-foreground">Proveedor</span>
                <span className="text-right text-muted-foreground">{service.ser_negocio || "-"}</span>
              </div>
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-muted-foreground">Medio de Pago</span>
                <span className="text-right text-muted-foreground">{service.ser_mediopago || "-"}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-md border h-24 flex items-center justify-center text-center text-sm text-muted-foreground">
            No hay servicios registrados
          </div>
        )}
      </div>
    </>
  );
}
