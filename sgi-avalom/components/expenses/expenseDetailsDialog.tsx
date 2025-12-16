"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Zap,
  Wrench,
  Calendar,
  Building2,
  Home,
  FileText,
  CreditCard,
  Download,
  Maximize2,
  Edit,
  X,
  User,
} from "lucide-react";
import type { AvaGasto } from "@/lib/types/entities";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";

interface ExpenseDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: AvaGasto | null;
  onEdit: (expense: AvaGasto) => void;
  onCancel: (expense: AvaGasto) => void;
}

export function ExpenseDetailsDialog({ open, onOpenChange, expense, onEdit, onCancel }: ExpenseDetailsDialogProps) {
  if (!expense) return null;

  const isActive = expense.gas_estado === "A";
  const isAnulado = expense.gas_estado === "D";
  const anulacion = expense.ava_anulaciongasto?.[0];

  const handleDownload = () => {
    console.log("Downloading document:", expense.gas_comprobante);
  };

  const handleViewFullScreen = () => {
    console.log("Opening document in fullscreen:", expense.gas_comprobante);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Detalles del Gasto
            {expense.gas_tipo === "S" ? (
              <Badge className="bg-blue-500 hover:bg-blue-600">
                <Zap className="mr-1 size-3" />
                Servicio
              </Badge>
            ) : (
              <Badge className="bg-orange-500 hover:bg-orange-600">
                <Wrench className="mr-1 size-3" />
                Mantenimiento
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>Información completa del gasto registrado</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Concepto</div>
                <div className="text-base font-semibold">{expense.gas_concepto}</div>
              </div>

              {expense.gas_descripcion && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Descripción</div>
                  <div className="text-sm">{expense.gas_descripcion}</div>
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-muted-foreground">Estado</div>
                {isActive ? (
                  <Badge className="bg-green-500 hover:bg-green-600">Activo</Badge>
                ) : (
                  <Badge variant="destructive">Anulado</Badge>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-muted-foreground">Fecha del gasto</div>
                <div className="flex items-center gap-1 text-sm">
                  <Calendar className="size-3" />
                  {formatDate(expense.gas_fecha)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Montos y Ubicación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Monto</div>
                <div className="text-2xl font-bold text-primary">{formatCurrency(expense.gas_monto)}</div>
              </div>

              <Separator />

              <div>
                <div className="mb-1 text-sm font-medium text-muted-foreground">Edificio</div>
                <div className="flex items-center gap-2">
                  <Building2 className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{expense.ava_edificio?.edi_identificador}</span>
                  {expense.ava_edificio?.edi_descripcion && (
                    <span className="text-sm text-muted-foreground">- {expense.ava_edificio.edi_descripcion}</span>
                  )}
                </div>
              </div>

              {expense.ava_propiedad && (
                <div>
                  <div className="mb-1 text-sm font-medium text-muted-foreground">Propiedad</div>
                  <div className="flex items-center gap-2">
                    <Home className="size-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{expense.ava_propiedad.prop_identificador}</span>
                    {expense.ava_propiedad.prop_descripcion && (
                      <span className="text-sm text-muted-foreground">- {expense.ava_propiedad.prop_descripcion}</span>
                    )}
                  </div>
                </div>
              )}

              {expense.ava_servicio && (
                <div>
                  <div className="mb-1 text-sm font-medium text-muted-foreground">Servicio</div>
                  <Badge variant="outline">
                    {expense.ava_servicio.ser_codigo} - {expense.ava_servicio.ser_nombre}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="size-4" />
                Información de Pago
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {expense.gas_metodopago ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-muted-foreground">Método de pago</div>
                    <div className="text-sm font-medium">{expense.gas_metodopago}</div>
                  </div>

                  {expense.gas_banco && (
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-muted-foreground">Banco</div>
                      <div className="text-sm">{expense.gas_banco}</div>
                    </div>
                  )}

                  {expense.gas_cuenta && (
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-muted-foreground">Cuenta</div>
                      <div className="text-sm">{expense.gas_cuenta}</div>
                    </div>
                  )}

                  {expense.gas_referencia && (
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-muted-foreground">Referencia</div>
                      <div className="text-sm">{expense.gas_referencia}</div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-sm text-muted-foreground">No hay información de pago registrada</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="size-4" />
                Comprobante
              </CardTitle>
            </CardHeader>
            <CardContent>
              {expense.gas_comprobante ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center rounded-lg border bg-muted/50 p-6">
                    <FileText className="size-12 text-muted-foreground" />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={handleDownload}>
                      <Download className="mr-2 size-4" />
                      Descargar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={handleViewFullScreen}
                    >
                      <Maximize2 className="mr-2 size-4" />
                      Ver completo
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No hay comprobante adjunto</div>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="size-4" />
                Auditoría
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {expense.ava_usuario && (
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-muted-foreground">Registrado por</div>
                  <div className="text-sm font-medium">
                    {expense.ava_usuario.usu_nombre} {expense.ava_usuario.usu_papellido}
                  </div>
                </div>
              )}

              {isAnulado && anulacion && (
                <>
                  <Separator />
                  <div className="rounded-lg bg-destructive/10 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <X className="size-5 text-destructive" />
                      <span className="font-semibold text-destructive">Gasto Anulado</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Motivo:</span>
                        <span className="font-medium">{anulacion.ang_motivo}</span>
                      </div>
                      {anulacion.ang_descripcion && (
                        <div>
                          <span className="text-muted-foreground">Descripción:</span>
                          <p className="mt-1">{anulacion.ang_descripcion}</p>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fecha de anulación:</span>
                        <span>{formatDateTime(anulacion.ang_fechaanulacion)}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          {isActive && (
            <>
              <Button variant="outline" onClick={() => onEdit(expense)}>
                <Edit className="mr-2 size-4" />
                Editar
              </Button>
              <Button variant="destructive" onClick={() => onCancel(expense)}>
                <X className="mr-2 size-4" />
                Anular
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
