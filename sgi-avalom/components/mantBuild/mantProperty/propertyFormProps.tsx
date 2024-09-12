"use client";

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
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { PropertyFormProps } from "@/lib/typesForm";
import { usePropertyForm } from "@/hooks/mantBuild/usePropertyForm"; // Importa el hook personalizado

const PropertyForm: React.FC<PropertyFormProps> = ({
  action,
  property,
  entity,
  onSuccess,
}) => {
  const { form, handleSubmit, onSubmit, handleClear, error, types } =
    usePropertyForm({ action, property, entity, onSuccess });

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-2 gap-4 m-3"
      >
        <FormField
          control={form.control}
          name="prop_identificador"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Identificador</FormLabel>
              <FormControl>
                <Input {...field} disabled={action === "view"} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="prop_descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Input {...field} disabled={action === "view"} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tipp_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Propiedad</FormLabel>
              <FormControl>
                <Select
                  value={field.value?.toString() || ""}
                  onValueChange={(value) => field.onChange(parseInt(value, 10))}
                  disabled={action === "view"}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((type) => (
                      <SelectItem
                        key={type.tipp_id}
                        value={type.tipp_id.toString()}
                      >
                        {type.tipp_nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {action !== "view" && (
          <div className="pt-4 m-3">
            <Button type="submit">
              {action === "create" ? "Crear Propiedad" : "Guardar Cambios"}
            </Button>
            {action !== "edit" && (
              <Button type="button" onClick={handleClear} className="ml-4">
                Limpiar
              </Button>
            )}
          </div>
        )}
        {error && <p className="text-red-500">{error}</p>}
      </form>
    </Form>
  );
};

export default PropertyForm;
