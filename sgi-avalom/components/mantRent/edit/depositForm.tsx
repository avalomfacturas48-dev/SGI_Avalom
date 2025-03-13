"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
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
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2Icon } from "lucide-react";
import { useDepositForm } from "@/hooks/mantRent/useDepositForm";
import { toast } from "sonner";
import { formatCurrency } from "@/utils/currencyConverter";

const DepositForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const { form, onSubmit, isFormDisabled, isEditing, deposit } =
    useDepositForm();

  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
      toast.success("Depósito guardado con éxito");
      onSuccess();
    } catch (error: any) {
      toast.error("Error", {
        description: error.message || "Error al guardar el depósito",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-6"
      >
        <Card className="bg-background">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Depósito</CardTitle>
            <CardDescription>
              {isEditing ? "Edite el depósito" : "Cree un nuevo depósito"}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-6">
            {Array.isArray(deposit?.ava_pago) &&
              deposit?.ava_pago.length > 0 && (
                <Alert className="mb-4">
                  <AlertTitle>No se puede modificar</AlertTitle>
                  <AlertDescription>
                    Este depósito tiene pagos asociados y no puede ser
                    modificado.
                  </AlertDescription>
                </Alert>
              )}

            <FormField
              control={form.control}
              name="depo_total"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto Total del Depósito</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="Ingrese el monto total"
                      disabled={isFormDisabled || isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {deposit && (
              <FormItem>
                <FormLabel>Monto Actual</FormLabel>
                <Input
                  value={formatCurrency(Number(deposit.depo_montoactual))}
                  disabled
                />
              </FormItem>
            )}
          </CardContent>
        </Card>

        {!isFormDisabled && (
          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2Icon className="h-4 w-4 animate-spin" />}
              {isEditing ? "Guardar deposito" : "Crear deposito"}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
};

export default DepositForm;
