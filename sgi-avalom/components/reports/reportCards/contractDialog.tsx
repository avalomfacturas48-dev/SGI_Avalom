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
            {/* Sección 1: Información del Arrendante */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-lg">Información del Arrendante</h3>
              </div>
              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="arrendante">
                    Nombre Completo <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="arrendante"
                    placeholder="Juan Pérez García"
                    value={formData.arrendante}
                    onChange={(e) => handleChange("arrendante", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cedulaArrendante">
                    Cédula <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="cedulaArrendante"
                    placeholder="1-0234-0567"
                    value={formData.cedulaArrendante}
                    onChange={(e) => handleChange("cedulaArrendante", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Sección 2: Información del Arrendatario */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-lg">Información del Arrendatario</h3>
              </div>
              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="arrendatario">
                    Nombre Completo <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="arrendatario"
                    placeholder="María Rodríguez López"
                    value={formData.arrendatario}
                    onChange={(e) => handleChange("arrendatario", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cedulaArrendatario">
                    Cédula <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="cedulaArrendatario"
                    placeholder="2-0456-0789"
                    value={formData.cedulaArrendatario}
                    onChange={(e) => handleChange("cedulaArrendatario", e.target.value)}
                  />
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="direccion">
                    Dirección de Procedencia <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="direccion"
                    placeholder="San Isidro de Pérez Zeledón"
                    value={formData.direccion}
                    onChange={(e) => handleChange("direccion", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Sección 3: Detalles de la Propiedad */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-lg">Detalles de la Propiedad</h3>
              </div>
              <Separator />

              <div className="space-y-2">
                <Label htmlFor="aptoNumero">
                  Número de Apartamento <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="aptoNumero"
                  placeholder="101"
                  value={formData.aptoNumero}
                  onChange={(e) => handleChange("aptoNumero", e.target.value)}
                />
              </div>
            </div>

            {/* Sección 4: Detalles del Contrato */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-lg">Detalles del Contrato</h3>
              </div>
              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contratoDesde">
                    Fecha Desde <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="contratoDesde"
                    placeholder="01 de enero del 2024"
                    value={formData.contratoDesde}
                    onChange={(e) => handleChange("contratoDesde", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contratoHasta">
                    Fecha Hasta <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="contratoHasta"
                    placeholder="31 de diciembre del 2026"
                    value={formData.contratoHasta}
                    onChange={(e) => handleChange("contratoHasta", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="montoTotal">
                    Monto Mensual (₡) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="montoTotal"
                    type="number"
                    placeholder="250000"
                    value={formData.montoTotal || ""}
                    onChange={(e) => handleChange("montoTotal", Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="diaPago">
                    Día de Pago (1-31) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="diaPago"
                    type="number"
                    min="1"
                    max="31"
                    placeholder="15"
                    value={formData.diaPago}
                    onChange={(e) => handleChange("diaPago", Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duracionAnios">
                    Duración (años) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="duracionAnios"
                    type="number"
                    placeholder="3"
                    value={formData.duracionAnios}
                    onChange={(e) => handleChange("duracionAnios", Number(e.target.value))}
                  />
                </div>
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
