"use client";

import { cn } from "@/lib/utils";
import { CalendarIcon, Loader2Icon, Save } from "lucide-react";
import { parseISO } from "date-fns";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { usePaymentForm } from "@/hooks/accounting/depositPayment/usePaymentForm";
import { formatToCR } from "@/utils/dateUtils";

const METODOS_PAGO = [
  "SINPE Móvil",
  "Transferencia",
  "Efectivo",
  "Tarjeta de crédito",
  "Tarjeta de débito",
  "Cheque",
];

const BANCOS_CR = [
  "BAC San José",
  "BCR (Banco de Costa Rica)",
  "Banco Nacional",
  "Banco Popular",
  "Scotiabank",
  "Davivienda",
  "Coopealianza",
  "Coopenae",
  "Mucap",
  "Lafise",
  "Prival Bank",
];

export function PaymentForm({
  amountToPay,
  setAmountToPay,
}: {
  amountToPay: string;
  setAmountToPay: React.Dispatch<React.SetStateAction<string>>;
}) {
  const { form, handlePaymentSubmit, isSubmitting } = usePaymentForm();

  const handleFormSubmit = async (data: any) => {
    try {
      const paymentAmount = Number(amountToPay);
      if (paymentAmount <= 0) {
        throw new Error("El monto a registrar debe ser mayor a ₡0.");
      }
      await handlePaymentSubmit({ ...data, amountToPay: paymentAmount });
      toast.success("Pago registrado con éxito.");
      setAmountToPay("");
      form.reset();
    } catch (error: any) {
      toast.error(error.message || "Error al registrar el pago.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Fecha de pago */}
          <FormField
            control={form.control}
            name="pag_fechapago"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de pago <span className="text-destructive">*</span></FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={isSubmitting}
                      >
                        {field.value ? formatToCR(field.value) : "Seleccione una fecha"}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? parseISO(field.value) : undefined}
                      onSelect={(date) =>
                        field.onChange(date ? date.toISOString().split("T")[0] : "")
                      }
                      disabled={(date) => date < new Date("1900-01-01")}
                      initialFocus
                      defaultMonth={field.value ? parseISO(field.value) : new Date()}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Método de pago */}
          <FormField
            control={form.control}
            name="pag_metodopago"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Método de pago <span className="text-destructive">*</span></FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un método" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {METODOS_PAGO.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-1.5 flex-wrap">
                  {["SINPE Móvil", "Transferencia"].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => field.onChange(v)}
                      className="text-[11px] px-2 py-0.5 rounded-full border bg-muted/50 hover:bg-primary/10 hover:border-primary/40 hover:text-primary transition-colors"
                    >
                      {v}
                    </button>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Banco */}
          <FormField
            control={form.control}
            name="pag_banco"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Banco</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un banco" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {BANCOS_CR.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => field.onChange("Coopealianza")}
                    className="text-[11px] px-2 py-0.5 rounded-full border bg-muted/50 hover:bg-primary/10 hover:border-primary/40 hover:text-primary transition-colors"
                  >
                    Coopealianza
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Cuenta */}
          <FormField
            control={form.control}
            name="pag_cuenta"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cuenta</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Ej. Ahorro a la vista, Corriente…"
                    disabled={isSubmitting}
                  />
                </FormControl>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => field.onChange("Ahorro a la vista")}
                    className="text-[11px] px-2 py-0.5 rounded-full border bg-muted/50 hover:bg-primary/10 hover:border-primary/40 hover:text-primary transition-colors"
                  >
                    Ahorro a la vista
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Referencia */}
          <FormField
            control={form.control}
            name="pag_referencia"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Referencia</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="N° comprobante o SINPE"
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Descripción */}
          <div className="sm:col-span-2">
            <FormField
              control={form.control}
              name="pag_descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Observaciones adicionales (opcional)"
                      rows={3}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={isSubmitting || !amountToPay || Number(amountToPay) <= 0}
            className="gap-2 min-w-[140px]"
          >
            {isSubmitting ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSubmitting ? "Guardando…" : "Guardar pago"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
