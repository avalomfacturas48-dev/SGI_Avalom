"use client";

import { useEffect } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Building2, Home, ChevronLeft, CalendarIcon, Loader2, X, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { BreadcrumbResponsive } from "@/components/breadcrumbResponsive";
import { ClientComboBox } from "@/components/mantBuild/mantProperty/mantRent/ClientComboBox";
import { useNewRentWizard } from "@/hooks/newRent/useNewRentWizard";

const STEPS = [
  { number: 1, label: "Edificio" },
  { number: 2, label: "Propiedad" },
  { number: 3, label: "Datos" },
];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((s, i) => (
        <div key={s.number} className="flex items-center gap-2">
          <div
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold border-2 transition-all",
              current === s.number
                ? "bg-primary text-primary-foreground border-primary"
                : current > s.number
                ? "bg-emerald-500 text-white border-emerald-500"
                : "bg-muted text-muted-foreground border-muted-foreground/30"
            )}
          >
            {current > s.number ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              s.number
            )}
          </div>
          <span
            className={cn(
              "text-sm hidden sm:inline",
              current === s.number
                ? "font-semibold text-foreground"
                : "text-muted-foreground"
            )}
          >
            {s.label}
          </span>
          {i < STEPS.length - 1 && (
            <div
              className={cn(
                "h-0.5 w-8 sm:w-12 rounded transition-colors",
                current > s.number ? "bg-emerald-500" : "bg-muted"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export function BodyNewRent() {
  const {
    step,
    buildings,
    loadingBuildings,
    selectedBuilding,
    selectedProperty,
    clients,
    clientsInRental,
    isSubmitting,
    form,
    availableProperties,
    fetchBuildings,
    selectBuilding,
    selectProperty,
    goBack,
    handleClientSelect,
    handleClientRemove,
    onSubmit,
  } = useNewRentWizard();

  useEffect(() => {
    fetchBuildings();
  }, []);

  const handleSubmit = async (data: any) => {
    try {
      await onSubmit(data);
    } catch (error: any) {
      toast.error("Error", {
        description: error.message || "No se pudo crear el alquiler.",
      });
    }
  };

  return (
    <div className="mx-auto p-4 space-y-6 max-w-4xl">
      {/* Header */}
      <Card className="border shadow-lg">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <BreadcrumbResponsive
              items={[
                { label: "Inicio", href: "/homePage" },
                { label: "Nuevo Alquiler" },
              ]}
            />
            <CardTitle className="text-2xl text-primary font-bold mt-1">
              Crear Nuevo Alquiler
            </CardTitle>
          </div>
          <StepIndicator current={step} />
        </CardHeader>
      </Card>

      {/* Step 1: Elegir edificio */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold px-1">Paso 1 — Selecciona el edificio</h2>
          {loadingBuildings ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            </div>
          ) : buildings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
              <Building2 className="h-10 w-10 opacity-20" />
              <p>No hay edificios registrados</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {buildings.map((building) => {
                const total = building.ava_propiedad?.length ?? 0;
                const available = (building.ava_propiedad ?? []).filter(
                  (p) => !p.ava_alquiler?.some((a) => a.alq_estado === "A")
                ).length;
                return (
                  <Card
                    key={building.edi_id}
                    className={cn(
                      "cursor-pointer hover:shadow-md hover:border-primary/50 transition-all duration-200 group",
                      available === 0 && "opacity-60 cursor-not-allowed hover:border-border hover:shadow-none"
                    )}
                    onClick={() => available > 0 && selectBuilding(building)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                            <Building2 className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">{building.edi_identificador}</p>
                            {building.edi_direccion && (
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                {building.edi_direccion}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={available > 0 ? "outline" : "secondary"}
                            className={available > 0 ? "border-emerald-400 text-emerald-700 bg-emerald-50" : ""}
                          >
                            {available}/{total} disponibles
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Elegir propiedad */}
      {step === 2 && selectedBuilding && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={goBack} className="gap-1">
              <ChevronLeft className="w-4 h-4" />
              Volver
            </Button>
            <h2 className="text-lg font-semibold">
              Paso 2 — Selecciona la propiedad en{" "}
              <span className="text-primary">{selectedBuilding.edi_identificador}</span>
            </h2>
          </div>
          {availableProperties.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
              <Home className="h-10 w-10 opacity-20" />
              <p>No hay propiedades disponibles en este edificio</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availableProperties.map((property) => (
                <Card
                  key={property.prop_id}
                  className="cursor-pointer hover:shadow-md hover:border-primary/50 transition-all duration-200 group"
                  onClick={() => selectProperty(property)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-9 h-9 rounded-full bg-indigo-50 group-hover:bg-indigo-100 transition-colors">
                        <Home className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">
                          {property.prop_identificador}
                        </p>
                        {property.prop_descripcion && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {property.prop_descripcion}
                          </p>
                        )}
                        {property.ava_tipopropiedad && (
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {property.ava_tipopropiedad.tipp_nombre}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Datos del alquiler */}
      {step === 3 && selectedProperty && selectedBuilding && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={goBack} className="gap-1">
              <ChevronLeft className="w-4 h-4" />
              Volver
            </Button>
            <h2 className="text-lg font-semibold">
              Paso 3 — Datos del alquiler
            </h2>
          </div>

          {/* Resumen de selección */}
          <Card className="bg-muted/40 border-dashed">
            <CardContent className="p-4 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Edificio:</span>
                <span className="font-medium">{selectedBuilding.edi_identificador}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Home className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Propiedad:</span>
                <span className="font-medium">{selectedProperty.prop_identificador}</span>
              </div>
            </CardContent>
          </Card>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-primary font-bold">
                    Detalles del Alquiler
                  </CardTitle>
                  <CardDescription>
                    Complete la información básica del contrato de alquiler
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="alq_monto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monto Mensual (₡)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Ej: 250000"
                            className="bg-background"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="alq_fechapago"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de Inicio de Pago</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(parseISO(field.value), "PPP", { locale: es })
                                ) : (
                                  <span>Seleccione una fecha</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value ? parseISO(field.value) : undefined}
                              onSelect={(date) =>
                                field.onChange(
                                  date ? date.toISOString().split("T")[0] : ""
                                )
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="alq_estado"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado Inicial</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="w-full bg-background">
                              <SelectValue placeholder="Seleccione el estado" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A">Activo</SelectItem>
                              <SelectItem value="F">Finalizado</SelectItem>
                              <SelectItem value="C">Cancelado</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Clientes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-primary font-bold">
                    Clientes Asociados
                  </CardTitle>
                  <CardDescription>
                    Agregue hasta 2 clientes al alquiler (opcional, puede hacerlo luego)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <FormLabel>Agregar Cliente</FormLabel>
                    <ClientComboBox
                      clients={clients}
                      onClientSelect={handleClientSelect}
                      disabled={clientsInRental.length >= 2}
                    />
                  </div>
                  {clientsInRental.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {clientsInRental.map((client) => (
                        <Card
                          key={client.cli_id}
                          className="relative p-3 border-2 hover:shadow-sm transition-shadow"
                        >
                          <div className="pr-6">
                            <p className="text-sm font-medium truncate">
                              {client.cli_nombre} {client.cli_papellido}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {client.cli_cedula}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            className="absolute top-1 right-1 h-6 w-6 hover:bg-red-100 dark:hover:bg-red-900"
                            onClick={() => handleClientRemove(client.cli_id)}
                          >
                            <X className="w-4 h-4 text-red-600" />
                          </Button>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Crear Alquiler
                </Button>
                <Button type="button" variant="outline" onClick={goBack}>
                  Volver
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
}

export default BodyNewRent;
