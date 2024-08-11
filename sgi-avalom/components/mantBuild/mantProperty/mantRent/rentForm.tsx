import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import axios from "axios";
import cookie from "js-cookie";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import usePropertyStore from "@/lib/zustand/propertyStore";
import { AvaAlquiler } from "@/lib/types";

// Define schema using zod
const rentalFormSchema = z.object({
  alq_monto: z.string().min(1, "Monto es requerido"),
  alq_fechapago: z.string().min(1, "Fecha de pago es requerida"),
  alq_contrato: z.string().optional(),
  alq_estado: z.enum(["A", "F", "C"]),
});

interface RentalFormProps {
  action: "create" | "edit";
  onSuccess: () => void;
}

const RentalForm: React.FC<RentalFormProps> = ({ action, onSuccess }) => {
  const {
    addRental,
    updateRental,
    selectedProperty,
    selectedRental,
    setSelectedRental,
  } = usePropertyStore((state) => ({
    addRental: state.addRental,
    updateRental: state.updateRental,
    selectedProperty: state.selectedProperty,
    selectedRental: state.selectedRental,
    setSelectedRental: state.setSelectedRental,
  }));

  const [error, setError] = useState<string | null>(null);

  const defaultValues =
    action === "create"
      ? {
          alq_monto: "",
          alq_fechapago: "",
          alq_contrato: "",
          alq_estado: "A" as "A",
        }
      : selectedRental || {
          alq_monto: "",
          alq_fechapago: "",
          alq_contrato: "",
          alq_estado: "A" as "A",
        };

  const form = useForm<z.infer<typeof rentalFormSchema>>({
    resolver: zodResolver(rentalFormSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = form;

  useEffect(() => {
    if (action === "edit") {
      reset(defaultValues);
    }
  }, [selectedRental, action, reset]);

  const onSubmit = async (formData: z.infer<typeof rentalFormSchema>) => {
    try {
      const token = cookie.get("token");
      if (!token) {
        console.error("No hay token disponible");
        setError("No hay token disponible");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      if (action === "create") {
        const newRental = {
          ...formData,
          prop_id: selectedProperty?.prop_id,
        };
        const response = await axios.post("/api/rent", newRental, {
          headers,
        });
        if (response.data) {
          addRental(response.data);
          onSuccess();
          reset(); // Reset the form after success
        }
      } else if (action === "edit" && selectedRental?.alq_id) {
        const response = await axios.put(
          `/api/rent/${selectedRental.alq_id}`,
          formData,
          { headers }
        );
        if (response.data) {
          updateRental(selectedRental.alq_id, response.data);
          onSuccess();
        }
      }
    } catch (error: any) {
      console.error("Error al guardar el alquiler:", error);
      const errorMessage = error.response?.data?.error || "Error desconocido";
      setError("Error al guardar el alquiler: " + errorMessage);
    }
  };

  const handleClear = () => {
    reset(); // Reset the form fields
    setSelectedRental(null); // Clear the selected rental if creating
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="m-2 flex flex-col md:flex-row justify-center items-center p-2">
        <h1 className="text-lg md:text-xl font-bold">Editar Alquiler</h1>
      </div>
      <div className="grid grid-cols-2 gap-4 m-3">
        <div>
          <Label htmlFor="alq_monto">Monto</Label>
          <Controller
            name="alq_monto"
            control={control}
            render={({ field }) => (
              <Input {...field} id="alq_monto" type="text" required />
            )}
          />
          {errors.alq_monto && (
            <Alert variant="destructive">{errors.alq_monto.message}</Alert>
          )}
        </div>
        <div>
          <Label htmlFor="alq_fechapago">Fecha de Pago</Label>
          <Controller
            name="alq_fechapago"
            control={control}
            render={({ field }) => (
              <Input {...field} id="alq_fechapago" type="text" required />
            )}
          />
          {errors.alq_fechapago && (
            <Alert variant="destructive">{errors.alq_fechapago.message}</Alert>
          )}
        </div>
        <div>
          <Label htmlFor="alq_contrato">Contrato</Label>
          <Controller
            name="alq_contrato"
            control={control}
            render={({ field }) => (
              <Input {...field} id="alq_contrato" type="text" />
            )}
          />
          {errors.alq_contrato && (
            <Alert variant="destructive">{errors.alq_contrato.message}</Alert>
          )}
        </div>
        <div>
          <Label htmlFor="alq_estado">Estado</Label>
          <Controller
            name="alq_estado"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Activo</SelectItem>
                  <SelectItem value="F">Finalizado</SelectItem>
                  <SelectItem value="C">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.alq_estado && (
            <Alert variant="destructive">{errors.alq_estado.message}</Alert>
          )}
        </div>
      </div>
      {error && <Alert variant="destructive">{error}</Alert>}
      <div className="flex gap-4">
        <Button type="submit" className="mt-4">
          Guardar
        </Button>
        <Button type="button" onClick={handleClear} className="mt-4">
          Limpiar
        </Button>
      </div>
    </form>
  );
};

export default RentalForm;
