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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Download, User, Home, FileText } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useContractGenerator } from "@/hooks/reports/useContractGenerator";

interface ContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContractDialog({ open, onOpenChange }: ContractDialogProps) {
  const { loading, formData, handleChange, generateContract, resetForm } = useContractGenerator();

  const handleSubmit = async () => {
    const success = await generateContract();
    if (success) {
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-5 w-5" />
            Formulario de Contrato de Arrendamiento
          </DialogTitle>
          <DialogDescription>Complete todos los campos para generar el contrato en PDF</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6 py-4">
            {/* Sección 1: Información de las Partes (según introducción del contrato) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-lg">Información de las Partes</h3>
              </div>
              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="arrendante">
                    Arrendante <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="arrendante"
                    autoComplete="off"
                    placeholder="Juan Pérez García"
                    value={formData.arrendante}
                    onChange={(e) => handleChange("arrendante", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Nombre completo del propietario o arrendante
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cedulaArrendante">
                    Cédula Arrendante <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="cedulaArrendante"
                    autoComplete="off"
                    placeholder="1-0234-0567"
                    value={formData.cedulaArrendante}
                    onChange={(e) => handleChange("cedulaArrendante", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Número de cédula del arrendante
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="arrendatario">
                    Arrendatario <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="arrendatario"
                    autoComplete="off"
                    placeholder="María Rodríguez López"
                    value={formData.arrendatario}
                    onChange={(e) => handleChange("arrendatario", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Nombre completo del arrendatario
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cedulaArrendatario">
                    Cédula Arrendatario <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="cedulaArrendatario"
                    autoComplete="off"
                    placeholder="2-0456-0789"
                    value={formData.cedulaArrendatario}
                    onChange={(e) => handleChange("cedulaArrendatario", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Número de cédula del arrendatario
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estadoCivil">
                    Estado Civil <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.estadoCivil} onValueChange={(value) => handleChange("estadoCivil", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Soltero/a">Soltero/a</SelectItem>
                      <SelectItem value="Casado/a">Casado/a</SelectItem>
                      <SelectItem value="Divorciado/a">Divorciado/a</SelectItem>
                      <SelectItem value="Viudo/a">Viudo/a</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Estado civil del arrendatario (soltero, casado, etc.)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="direccion">
                    Dirección <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="direccion"
                    autoComplete="off"
                    placeholder="San Isidro de Pérez Zeledón"
                    value={formData.direccion}
                    onChange={(e) => handleChange("direccion", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Dirección de residencia del arrendatario
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aptoNumero">
                    Número de Apartamento <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="aptoNumero"
                    autoComplete="off"
                    placeholder="101"
                    value={formData.aptoNumero}
                    onChange={(e) => handleChange("aptoNumero", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Identificador o número del apartamento a arrendar
                  </p>
                </div>
              </div>
            </div>

            {/* Sección 2: Información de la Finca (PRIMERA cláusula - opcionales) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-lg">Información de la Finca (Opcional)</h3>
              </div>
              <Separator />
              <p className="text-sm text-muted-foreground">
                Si no se completan, se dejarán espacios en blanco para llenar manualmente
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="matriculaFinca">Matrícula de la Finca</Label>
                  <Input
                    id="matriculaFinca"
                    autoComplete="off"
                    type="text"
                    placeholder="Ej: CIENTO SESENTA Y NUEVE MIL NOVECIENTOS OCHENTA Y SIETE-CERO CERO CERO"
                    value={formData.matriculaFinca || ""}
                    onChange={(e) => handleChange("matriculaFinca", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Matrícula de la finca en el Registro Público de la Propiedad
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="planoFinca">Plano de la Finca</Label>
                  <Input
                    id="planoFinca"
                    autoComplete="off"
                    type="text"
                    placeholder="Ej: S-J- ciento nueve mil seiscientos diecisiete-cincuenta y ocho decímetros cuadrados"
                    value={formData.planoFinca || ""}
                    onChange={(e) => handleChange("planoFinca", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Información del plano de la finca
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ubicacionFinca">Ubicación de la Finca</Label>
                  <Input
                    id="ubicacionFinca"
                    autoComplete="off"
                    type="text"
                    placeholder="Ej: distrito primero, cantón Pérez Zeledón"
                    value={formData.ubicacionFinca || ""}
                    onChange={(e) => handleChange("ubicacionFinca", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Ubicación de la finca (distrito, cantón, provincia)
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="linderosFinca">Linderos de la Finca</Label>
                <Textarea
                  id="linderosFinca"
                  autoComplete="off"
                  placeholder="Ej: al norte con carretera interamericana, al sur con finca de Rómulo Concepción Solís Cambronero, al este con propiedad de Carmen, y al oeste con propiedad de López"
                  value={formData.linderosFinca || ""}
                  onChange={(e) => handleChange("linderosFinca", e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Descripción de los linderos de la finca
                </p>
              </div>
            </div>

            {/* Sección 3: Descripción del Apartamento (SEGUNDA cláusula - opcional) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-lg">Descripción del Apartamento (Opcional)</h3>
              </div>
              <Separator />

              <div className="space-y-2">
                <Label htmlFor="descripcionApartamento">Descripción del Apartamento</Label>
                <Textarea
                  id="descripcionApartamento"
                  autoComplete="off"
                  placeholder="Ej: sala, comedor, cocina, dos habitaciones y un baño"
                  value={formData.descripcionApartamento || ""}
                  onChange={(e) => handleChange("descripcionApartamento", e.target.value)}
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">
                  Descripción detallada de las habitaciones y espacios del apartamento (por defecto: sala, comedor, cocina, dos habitaciones y un baño)
                </p>
              </div>
            </div>

            {/* Sección 4: Detalles del Contrato (TERCERA y CUARTA cláusulas) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-lg">Detalles del Contrato</h3>
              </div>
              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="montoTotal">
                    Monto Total Anual (₡) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="montoTotal"
                    type="number"
                    autoComplete="off"
                    placeholder="250000"
                    value={formData.montoTotal || ""}
                    onChange={(e) => handleChange("montoTotal", Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Monto total del alquiler para el primer año
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="diaPago">
                    Día de Pago Mensual (1-31) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="diaPago"
                    type="number"
                    autoComplete="off"
                    min="1"
                    max="31"
                    placeholder="15"
                    value={formData.diaPago}
                    onChange={(e) => handleChange("diaPago", Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Día del mes en que se debe realizar el pago mensual (1-31)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="diaPrimerPago">
                    Día del Primer Pago (1-31) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="diaPrimerPago"
                    type="number"
                    autoComplete="off"
                    min="1"
                    max="31"
                    placeholder="15"
                    value={formData.diaPrimerPago || ""}
                    onChange={(e) => handleChange("diaPrimerPago", Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Día del mes en que se realizará el primer pago (1-31)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contratoDesde">
                    Fecha Desde <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="contratoDesde"
                    autoComplete="off"
                    placeholder="01 de enero del 2024"
                    value={formData.contratoDesde}
                    onChange={(e) => handleChange("contratoDesde", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Fecha desde la cual inicia el contrato de arrendamiento
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contratoHasta">
                    Fecha Hasta <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="contratoHasta"
                    autoComplete="off"
                    placeholder="31 de diciembre del 2026"
                    value={formData.contratoHasta}
                    onChange={(e) => handleChange("contratoHasta", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Fecha hasta la cual finaliza el contrato de arrendamiento
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duracionAnios">
                    Duración (años) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="duracionAnios"
                    type="number"
                    autoComplete="off"
                    placeholder="3"
                    value={formData.duracionAnios}
                    onChange={(e) => handleChange("duracionAnios", Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Duración total del contrato en años
                  </p>
                </div>
              </div>
            </div>

            {/* Sección 5: Información Adicional (QUINTA y DÉCIMA PRIMERA cláusulas) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-lg">Información Adicional</h3>
              </div>
              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numeroMiembros">
                    Número de Miembros del Núcleo Familiar <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="numeroMiembros"
                    type="number"
                    autoComplete="off"
                    min="1"
                    placeholder="2"
                    value={formData.numeroMiembros || ""}
                    onChange={(e) => handleChange("numeroMiembros", Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Cantidad de personas que conforman el núcleo familiar del arrendatario
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="depositoGarantia">
                    Depósito de Garantía (CRC) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="depositoGarantia"
                    type="number"
                    autoComplete="off"
                    min="0"
                    placeholder="250000"
                    value={formData.depositoGarantia || ""}
                    onChange={(e) => handleChange("depositoGarantia", Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Monto del depósito de garantía que será devuelto al finalizar el contrato
                  </p>
                </div>
              </div>
            </div>

            {/* Sección 6: Fecha de Firma (Cierre - opcional) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-lg">Fecha de Firma (Opcional)</h3>
              </div>
              <Separator />

              <div className="space-y-2">
                <Label htmlFor="fechaFirma">Fecha de Firma</Label>
                <Input
                  id="fechaFirma"
                  type="text"
                  autoComplete="off"
                  placeholder="Ej: 15 de enero de 2024"
                  value={formData.fechaFirma || ""}
                  onChange={(e) => handleChange("fechaFirma", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Fecha en que se firmará el contrato
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Generar Contrato
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
