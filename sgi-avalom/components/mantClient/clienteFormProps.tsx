import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Cliente } from "@/lib/types";
import { useState } from "react";

interface ClienteFormProps {
  action: "create" | "edit" | "view";
  cliente?: Cliente;
}

const ClienteForm: React.FC<ClienteFormProps> = ({ action, cliente }) => {
  const initialFormData = cliente || {
    cli_nombre: "",
    cli_papellido: "",
    cli_sapellido: "",
    cli_cedula: "",
    cli_telefono: "",
    cli_correo: "",
  };

  const [formData, setFormData] = useState<Partial<Cliente>>(initialFormData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Aquí manejarías la lógica para guardar o editar el cliente
    console.log("Form submitted:", formData);
    // Resetear el formulario después de enviarlo
    setFormData(initialFormData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="cli_nombre">Nombre</Label>
          <Input
            id="cli_nombre"
            name="cli_nombre"
            type="text"
            value={formData.cli_nombre}
            onChange={handleChange}
            required
            disabled={action === "view"} // Deshabilitar en modo ver
          />
        </div>
        <div>
          <Label htmlFor="cli_papellido">Primer Apellido</Label>
          <Input
            id="cli_papellido"
            name="cli_papellido"
            type="text"
            value={formData.cli_papellido}
            onChange={handleChange}
            required
            disabled={action === "view"} // Deshabilitar en modo ver
          />
        </div>
        <div>
          <Label htmlFor="cli_sapellido">Segundo Apellido</Label>
          <Input
            id="cli_sapellido"
            name="cli_sapellido"
            type="text"
            value={formData.cli_sapellido}
            onChange={handleChange}
            disabled={action === "view"} // Deshabilitar en modo ver
          />
        </div>
        <div>
          <Label htmlFor="cli_cedula">Cédula</Label>
          <Input
            id="cli_cedula"
            name="cli_cedula"
            type="text"
            value={formData.cli_cedula}
            onChange={handleChange}
            required
            disabled={action === "view"} // Deshabilitar en modo ver
          />
        </div>
        <div>
          <Label htmlFor="cli_telefono">Teléfono</Label>
          <Input
            id="cli_telefono"
            name="cli_telefono"
            type="text"
            value={formData.cli_telefono}
            onChange={handleChange}
            disabled={action === "view"} // Deshabilitar en modo ver
          />
        </div>
        <div>
          <Label htmlFor="cli_correo">Correo</Label>
          <Input
            id="cli_correo"
            name="cli_correo"
            type="email"
            value={formData.cli_correo}
            onChange={handleChange}
            disabled={action === "view"} // Deshabilitar en modo ver
          />
        </div>
      </div>
      {action !== "view" && (
        <div className="pt-4">
          <Button type="submit">
            {action === "create" ? "Crear Cliente" : "Guardar Cambios"}
          </Button>
        </div>
      )}
    </form>
  );
};

export default ClienteForm;
