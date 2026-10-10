"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Zap, Wrench, Upload, XIcon, AlertTriangle } from "lucide-react";
import axios from "axios";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatCurrency } from "@/lib/utils";
import { expenseFormSchema, type ExpenseFormValues } from "@/lib/schemas/expenseSchemas";
import type { AvaGasto, AvaServicio, AvaEdificio, AvaPropiedad } from "@/lib/types/entities";
import { convertToCostaRicaTime, convertToUTCSV } from "@/utils/dateUtils";
import {
  METODOS_PAGO,
  BANCOS_CR,
  METODOS_PAGO_RAPIDOS,
  BANCOS_RAPIDOS,
  CUENTAS_RAPIDAS,
} from "@/lib/constants/payments";
import { QuickPicks } from "@/components/shared/QuickPicks";

// Incluye el valor actual si no está en la lista (gastos viejos con texto libre)
const withCurrent = (options: string[], current?: string) =>
  current && !options.includes(current) ? [current, ...options] : options;

interface ExpenseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: AvaGasto | null;
  servicios: AvaServicio[];
  edificios: AvaEdificio[];
  propiedades: AvaPropiedad[];
  onSubmit: (data: ExpenseFormValues) => Promise<void>;
}

export function ExpenseFormDialog({
  open,
  onOpenChange,
  expense,
  servicios,
  edificios,
  propiedades,
  onSubmit,
}: ExpenseFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEdificio, setSelectedEdificio] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  // Aviso de posibles duplicados: el segundo "Guardar" confirma
  const [duplicates, setDuplicates] = useState<AvaGasto[]>([]);
  const [duplicatesAcknowledged, setDuplicatesAcknowledged] = useState(false);
  const duplicatesRef = useRef<HTMLDivElement>(null);

  // El aviso queda al final del formulario: llevarlo a la vista al aparecer
  useEffect(() => {
    if (duplicates.length > 0) {
      duplicatesRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [duplicates]);

  const isEditing = !!expense;

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      gas_tipo: "S",
      ser_id: "",
      gas_concepto: "",
      gas_descripcion: "",
      gas_monto: "",
      gas_fecha: convertToCostaRicaTime(new Date().toISOString()),
      edi_id: "",
      prop_id: "",
      gas_metodopago: "",
      gas_cuenta: "",
      gas_banco: "",
      gas_referencia: "",
      gas_comprobante: "",
    },
  });

  const watchTipo = form.watch("gas_tipo");
  const watchEdificio = form.watch("edi_id");
  const watchDescripcion = form.watch("gas_descripcion");

  useEffect(() => {
    if (expense) {
      // Convertir la fecha de ISO a formato yyyy-MM-dd para el input de fecha
      const fechaFormateada = expense.gas_fecha 
        ? convertToCostaRicaTime(expense.gas_fecha) 
        : new Date().toISOString().split("T")[0];
      
      form.reset({
        gas_tipo: expense.gas_tipo,
        ser_id: expense.ser_id || "",
        gas_concepto: expense.gas_concepto,
        gas_descripcion: expense.gas_descripcion || "",
        gas_monto: expense.gas_monto,
        gas_fecha: fechaFormateada,
        edi_id: expense.edi_id,
        prop_id: expense.prop_id || "",
        gas_metodopago: expense.gas_metodopago || "",
        gas_cuenta: expense.gas_cuenta || "",
        gas_banco: expense.gas_banco || "",
        gas_referencia: expense.gas_referencia || "",
        gas_comprobante: expense.gas_comprobante || "",
      });
      setSelectedEdificio(expense.edi_id);
      if (expense.gas_comprobante) {
        setUploadedFile(expense.gas_comprobante);
      }
    } else {
      // Para nueva fecha, usar la fecha actual en zona horaria de Costa Rica
      const fechaActual = convertToCostaRicaTime(new Date().toISOString());
      
      form.reset({
        gas_tipo: "S",
        ser_id: "",
        gas_concepto: "",
        gas_descripcion: "",
        gas_monto: "",
        gas_fecha: fechaActual,
        edi_id: "",
        prop_id: "",
        gas_metodopago: "",
        gas_cuenta: "",
        gas_banco: "",
        gas_referencia: "",
        gas_comprobante: "",
      });
      setSelectedEdificio("");
      setUploadedFile(null);
    }
  }, [expense, form, open]);

  useEffect(() => {
    setSelectedEdificio(watchEdificio);
  }, [watchEdificio]);

  // Si cambian los datos, el aviso de duplicados ya no aplica
  useEffect(() => {
    setDuplicates([]);
    setDuplicatesAcknowledged(false);
    const subscription = form.watch(() => {
      setDuplicates([]);
      setDuplicatesAcknowledged(false);
    });
    return () => subscription.unsubscribe();
  }, [form, open, expense]);

  const filteredPropiedades = propiedades.filter((prop) => prop.edi_id === selectedEdificio);

  // Busca gastos parecidos (mismo servicio/concepto, mes y monto o referencia)
  const findDuplicates = async (data: ExpenseFormValues, gasFecha?: string) => {
    try {
      const params = new URLSearchParams({
        gas_tipo: data.gas_tipo,
        edi_id: data.edi_id,
        gas_monto: data.gas_monto,
        gas_fecha: gasFecha ?? new Date().toISOString(),
        gas_concepto: data.gas_concepto,
      });
      if (data.ser_id) params.set("ser_id", data.ser_id);
      if (data.gas_referencia) params.set("gas_referencia", data.gas_referencia);
      if (expense?.gas_id) params.set("exclude_id", expense.gas_id);
      const response = await axios.get(`/api/expenses/duplicates?${params}`);
      return (response.data?.data ?? []) as AvaGasto[];
    } catch {
      // Si la verificación falla no se bloquea el guardado
      return [];
    }
  };

  const handleSubmit = async (data: ExpenseFormValues) => {
    setIsSubmitting(true);
    try {
      // Convertir la fecha de formato local (yyyy-MM-dd) a UTC ISO string antes de enviar
      const dataToSubmit = {
        ...data,
        gas_fecha: data.gas_fecha ? convertToUTCSV(data.gas_fecha) : undefined,
      };

      // Primer intento: avisar si ya existe un gasto parecido
      if (!duplicatesAcknowledged) {
        const found = await findDuplicates(data, dataToSubmit.gas_fecha);
        if (found.length > 0) {
          setDuplicates(found);
          setDuplicatesAcknowledged(true);
          return;
        }
      }

      await onSubmit(dataToSubmit as ExpenseFormValues);
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("File uploaded:", file.name);
      const fakeUrl = `/uploads/${file.name}`;
      setUploadedFile(fakeUrl);
      form.setValue("gas_comprobante", fakeUrl);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    form.setValue("gas_comprobante", "");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // No cerrar mientras se guarda: el request seguiría corriendo por detrás
        if (!isSubmitting) onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Gasto" : "Nuevo Gasto"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Actualiza la información del gasto existente"
              : "Completa el formulario para registrar un nuevo gasto"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 sm:space-y-6">
            <div className="space-y-3 sm:space-y-4">
              <div className="space-y-2 sm:space-y-3">
                <Label className="text-sm font-semibold sm:text-base">Información Básica</Label>

                <FormField
                  control={form.control}
                  name="gas_tipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Gasto *</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-col gap-2 sm:flex-row sm:gap-4">
                          <div className="flex flex-1 items-center space-x-2 rounded-lg border p-2 sm:p-3 hover:bg-accent">
                            <RadioGroupItem value="S" id="tipo-servicio" />
                            <Label htmlFor="tipo-servicio" className="flex flex-1 cursor-pointer items-center gap-2">
                              <Zap className="size-5 text-blue-500" />
                              <span>Servicio</span>
                            </Label>
                          </div>
                          <div className="flex flex-1 items-center space-x-2 rounded-lg border p-2 sm:p-3 hover:bg-accent">
                            <RadioGroupItem value="M" id="tipo-mantenimiento" />
                            <Label
                              htmlFor="tipo-mantenimiento"
                              className="flex flex-1 cursor-pointer items-center gap-2"
                            >
                              <Wrench className="size-5 text-orange-500" />
                              <span>Mantenimiento</span>
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchTipo === "S" && (
                  <FormField
                    control={form.control}
                    name="ser_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Servicio *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un servicio" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {servicios.map((servicio) => (
                              <SelectItem key={servicio.ser_id} value={servicio.ser_id}>
                                {servicio.ser_codigo} - {servicio.ser_nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="gas_concepto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Concepto *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Pago de electricidad" {...field} maxLength={60} />
                        </FormControl>
                        <FormDescription className="text-xs">{field.value.length}/60 caracteres</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gas_monto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monto *</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} step="1" min="1" inputMode="numeric" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="gas_descripcion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descripción adicional del gasto..."
                          className="resize-none min-h-[60px] sm:min-h-[80px]"
                          {...field}
                          maxLength={200}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        {watchDescripcion?.length || 0}/200 caracteres
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gas_fecha"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha del Gasto *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} max={new Date().toISOString().split("T")[0]} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2 sm:space-y-3">
                <Label className="text-sm font-semibold sm:text-base">Ubicación</Label>

                <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="edi_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Edificio *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un edificio" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {edificios.map((edificio) => (
                              <SelectItem key={edificio.edi_id} value={edificio.edi_id}>
                                {edificio.edi_identificador}
                                {edificio.edi_descripcion && ` - ${edificio.edi_descripcion}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="prop_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Propiedad</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={!selectedEdificio || filteredPropiedades.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una propiedad" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {filteredPropiedades.map((propiedad) => (
                              <SelectItem key={propiedad.prop_id} value={propiedad.prop_id}>
                                {propiedad.prop_identificador}
                                {propiedad.prop_descripcion && ` - ${propiedad.prop_descripcion}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Accordion type="single" collapsible defaultValue="payment" className="w-full">
                <AccordionItem value="payment">
                  <AccordionTrigger>
                    <Label className="text-sm font-semibold sm:text-base">Información de Pago</Label>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 sm:space-y-3 pt-2 sm:pt-3">
                    <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="gas_metodopago"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Método de Pago</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona un método" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {withCurrent(METODOS_PAGO, field.value).map((m) => (
                                  <SelectItem key={m} value={m}>
                                    {m}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <QuickPicks options={METODOS_PAGO_RAPIDOS} onPick={field.onChange} />
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="gas_banco"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Banco</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona un banco" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {withCurrent(BANCOS_CR, field.value).map((b) => (
                                  <SelectItem key={b} value={b}>
                                    {b}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <QuickPicks options={BANCOS_RAPIDOS} onPick={field.onChange} />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="gas_cuenta"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cuenta/Número</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej. Ahorro a la vista, Corriente…" {...field} />
                            </FormControl>
                            <QuickPicks options={CUENTAS_RAPIDAS} onPick={field.onChange} />
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="gas_referencia"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Referencia/Factura</FormLabel>
                            <FormControl>
                              <Input placeholder="Número de referencia" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="document">
                  <AccordionTrigger>
                    <Label className="text-sm font-semibold sm:text-base">Comprobante</Label>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 sm:space-y-3 pt-2 sm:pt-3">
                    <div className="rounded-lg border-2 border-dashed p-3 sm:p-6">
                      {uploadedFile ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Upload className="size-5 text-green-500" />
                            <span className="text-sm">{uploadedFile.split("/").pop()}</span>
                          </div>
                          <Button type="button" variant="ghost" size="sm" onClick={handleRemoveFile}>
                            <XIcon className="size-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="mx-auto size-8 text-muted-foreground" />
                          <div className="mt-2">
                            <Label htmlFor="file-upload" className="cursor-pointer text-sm font-medium text-primary">
                              Selecciona un archivo
                            </Label>
                            <Input
                              id="file-upload"
                              type="file"
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={handleFileUpload}
                            />
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">PDF, JPG, PNG hasta 5MB</p>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {duplicates.length > 0 && (
              <Alert ref={duplicatesRef} className="border-amber-500/40 bg-amber-500/10">
                <AlertTriangle className="size-4 !text-amber-600" />
                <AlertTitle>Posible gasto duplicado</AlertTitle>
                <AlertDescription className="space-y-2">
                  <p className="text-sm">
                    Ya hay {duplicates.length === 1 ? "un gasto parecido" : `${duplicates.length} gastos parecidos`}{" "}
                    este mes (mismo {watchTipo === "S" ? "servicio" : "concepto"} y mismo monto o referencia):
                  </p>
                  <ul className="space-y-1 text-sm">
                    {duplicates.map((d) => (
                      <li key={d.gas_id} className="flex flex-wrap gap-x-2">
                        <span className="font-medium">#{d.gas_id}</span>
                        <span>{d.gas_concepto}</span>
                        <span>· {formatCurrency(d.gas_monto)}</span>
                        <span>· {convertToCostaRicaTime(d.gas_fecha)}</span>
                        {d.gas_referencia && <span>· Ref: {d.gas_referencia}</span>}
                        {d.ava_servicio && <span>· {d.ava_servicio.ser_nombre}</span>}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted-foreground">
                    Revisa que no sea el mismo. Si es correcto, vuelve a presionar el botón para guardarlo.
                  </p>
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                variant={duplicates.length > 0 ? "destructive" : "default"}
              >
                {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                {duplicates.length > 0
                  ? "Guardar de todos modos"
                  : isEditing
                    ? "Actualizar"
                    : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
