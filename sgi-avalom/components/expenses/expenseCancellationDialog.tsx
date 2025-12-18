"use client";

import { useState } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { AlertTriangle, Loader2 } from "lucide-react";
import { cancellationFormSchema, type CancellationFormValues } from "@/lib/schemas/expenseSchemas";
import type { AvaGasto } from "@/lib/types/entities";

interface ExpenseCancellationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: AvaGasto | null;
  onConfirm: (data: CancellationFormValues) => Promise<void>;
}

const motivoOptions = [
  { value: "Error de registro", label: "Error de registro" },
  { value: "Gasto duplicado", label: "Gasto duplicado" },
  { value: "Gasto no procedente", label: "Gasto no procedente" },
  { value: "Otro", label: "Otro" },
];

export function ExpenseCancellationDialog({ open, onOpenChange, expense, onConfirm }: ExpenseCancellationDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState<CancellationFormValues | null>(null);

  const form = useForm<CancellationFormValues>({
    resolver: zodResolver(cancellationFormSchema),
    defaultValues: {
      ang_motivo: "",
      ang_descripcion: "",
    },
  });

  const watchDescripcion = form.watch("ang_descripcion");

  // Validar que el gasto no esté ya anulado
  const isAlreadyCancelled = expense?.gas_estado === "D" || (expense?.ava_anulaciongasto && expense.ava_anulaciongasto.length > 0);

  const handleSubmit = (data: CancellationFormValues) => {
    if (isAlreadyCancelled) {
      return;
    }
    setFormData(data);
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    if (!formData) return;

    setIsSubmitting(true);
    try {
      await onConfirm(formData);
      setShowConfirmation(false);
      onOpenChange(false);
      form.reset();
      setFormData(null);
    } catch (error) {
      // El error ya se maneja en el hook useExpenses
      // Solo mantener el diálogo abierto si hay error
      console.error("Error canceling expense:", error);
      // No cerrar el diálogo si hay error para que el usuario vea el mensaje
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
      setShowConfirmation(false);
      form.reset();
    }
  };

  if (!expense) return null;

  // Si el gasto ya está anulado, mostrar mensaje de error
  if (isAlreadyCancelled) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-destructive" />
              Gasto ya Anulado
            </DialogTitle>
            <DialogDescription>Este gasto ya ha sido anulado previamente</DialogDescription>
          </DialogHeader>

          <Alert variant="destructive">
            <AlertTriangle className="size-4" />
            <AlertDescription>
              No se puede anular un gasto que ya está anulado. El gasto "{expense.gas_concepto}" tiene estado anulado.
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open && !showConfirmation} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-destructive" />
              Anular Gasto
            </DialogTitle>
            <DialogDescription>Estás a punto de anular el gasto "{expense.gas_concepto}"</DialogDescription>
          </DialogHeader>

          <Alert>
            <AlertTriangle className="size-4" />
            <AlertDescription>
              Esta acción anulará el gasto permanentemente. El registro se mantendrá pero marcado como anulado.
            </AlertDescription>
          </Alert>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="ang_motivo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motivo *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un motivo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {motivoOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
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
                name="ang_descripcion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción adicional</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Agrega más detalles sobre la anulación..."
                        className="resize-none"
                        rows={4}
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

              <DialogFooter className="gap-2">
                <Button type="button" variant="ghost" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button type="submit" variant="destructive">
                  Confirmar Anulación
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-destructive" />
              ¿Estás completamente seguro?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El gasto será marcado como anulado de forma permanente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>No, volver</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              Sí, anular gasto
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
