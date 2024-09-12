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
import { useClientForm } from "@/hooks/mantClient/useClientForm";
import { ClienteFormProps } from "@/lib/typesForm";

const ClienteForm: React.FC<ClienteFormProps> = ({
  action,
  entity,
  onSuccess,
}) => {
  const { form, handleSubmit, onSubmit, handleClear } = useClientForm({
    action,
    entity,
    onSuccess,
  });

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-2 gap-4"
      >
        <FormField
          control={form.control}
          name="cli_nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input {...field} disabled={action === "view"} maxLength={30} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cli_papellido"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Primer Apellido</FormLabel>
              <FormControl>
                <Input {...field} disabled={action === "view"} maxLength={30} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cli_sapellido"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Segundo Apellido</FormLabel>
              <FormControl>
                <Input {...field} disabled={action === "view"} maxLength={30} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cli_cedula"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cédula</FormLabel>
              <FormControl>
                <Input {...field} disabled={action === "view"} maxLength={15} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cli_telefono"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono</FormLabel>
              <FormControl>
                <Input {...field} disabled={action === "view"} maxLength={15} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cli_correo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo</FormLabel>
              <FormControl>
                <Input {...field} disabled={action === "view"} maxLength={50} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {action !== "view" && (
          <div className="pt-4">
            <Button type="submit">
              {action === "create" ? "Crear Cliente" : "Guardar Cambios"}
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

export default ClienteForm;
