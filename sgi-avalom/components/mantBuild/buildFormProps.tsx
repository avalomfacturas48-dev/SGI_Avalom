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
import { BuildFormProps } from "@/lib/typesForm";
import { useBuildForm } from "@/hooks/mantBuild/useBuildForm";

const BuildForm: React.FC<BuildFormProps> = ({
  action,
  building,
  onSuccess,
}) => {
  const { form, handleSubmit, onSubmit, handleClear } = useBuildForm({
    action,
    building,
    onSuccess,
  });

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-2 gap-4 m-3"
      >
        <FormField
          control={form.control}
          name="edi_identificador"
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
          name="edi_descripcion"
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
        {action !== "view" && (
          <div className="pt-4 m-3 flex flex-row">
            <Button type="submit">
              {action === "create" ? "Crear Edificio" : "Guardar Cambios"}
            </Button>
            {action !== "edit" && (
              <Button type="button" onClick={handleClear} className="ml-4">
                Limpiar
              </Button>
            )}
          </div>
        )}
      </form>
    </Form>
  );
};

export default BuildForm;
