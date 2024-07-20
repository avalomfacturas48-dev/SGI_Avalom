import { useState } from "react";
import { User } from "@/lib/types";
import axios from "axios";
import cookie from "js-cookie";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "../ui/label";
import useUserStore from "@/lib/zustand/userStore";
import { Alert } from "@/components/ui/alert";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
  } from "@/components/ui/select";

interface UserFormProps {
  action: "create" | "edit" | "view";
  entity?: User;
  onSuccess: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ action, entity, onSuccess }) => {
  const initialFormData = entity || {
    usu_nombre: "",
    usu_papellido: "",
    usu_sapellido: "",
    usu_cedula: "",
    usu_telefono: "",
    usu_correo: "",
    usu_contrasena: "",
    usu_estado: "A",
    usu_rol: "R",
  };
  const [formData, setFormData] = useState<Partial<User>>(initialFormData);
  const [error, setError] = useState<string | null>(null);
  const { addUser, updateUser } = useUserStore((state) => ({
    addUser: state.addUser,
    updateUser: state.updateUser,
  }));

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        const response = await axios.post("/api/users", formData, { headers });
        if (response.data) {
          addUser(response.data);
          console.log("Usuario creado:", response.data);
          onSuccess && onSuccess();
        }
      } else if (action === "edit") {
        const response = await axios.put(
          `/api/users/${formData.usu_id}`,
          formData,
          { headers }
        );
        if (response.data) {
          updateUser(response.data);
          console.log("Usuario Actualizado:", response.data);
          onSuccess && onSuccess();
        }
      }
    } catch (error: any) {
      console.error("Error al guardar el usuario:", error);
      const errorMessage = error.response?.data?.error || "Error desconocido";
      setError("Error al guardar el usuario: " + errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="usu_nombre">Nombre</Label>
          <Input
            id="usu_nombre"
            name="usu_nombre"
            type="text"
            value={formData.usu_nombre}
            onChange={handleChange}
            required
            disabled={action === "view"}
          />
        </div>
        <div>
          <Label htmlFor="usu_papellido">Primer Apellido</Label>
          <Input
            id="usu_papellido"
            name="usu_papellido"
            type="text"
            value={formData.usu_papellido}
            onChange={handleChange}
            required
            disabled={action === "view"}
          />
        </div>
        <div>
          <Label htmlFor="usu_sapellido">Segundo Apellido</Label>
          <Input
            id="usu_sapellido"
            name="usu_sapellido"
            type="text"
            value={formData.usu_sapellido || ""}
            onChange={handleChange}
            disabled={action === "view"}
          />
        </div>
        <div>
          <Label htmlFor="usu_cedula">Cédula</Label>
          <Input
            id="usu_cedula"
            name="usu_cedula"
            type="text"
            value={formData.usu_cedula}
            onChange={handleChange}
            required
            disabled={action === "view"}
          />
        </div>
        <div>
          <Label htmlFor="usu_telefono">Teléfono</Label>
          <Input
            id="usu_telefono"
            name="usu_telefono"
            type="text"
            value={formData.usu_telefono || ""}
            onChange={handleChange}
            disabled={action === "view"}
          />
        </div>
        <div>
          <Label htmlFor="usu_correo">Correo</Label>
          <Input
            id="usu_correo"
            name="usu_correo"
            type="email"
            value={formData.usu_correo}
            onChange={handleChange}
            required
            disabled={action === "view"}
          />
        </div>
        <div>
          <Label htmlFor="usu_contrasena">Contraseña</Label>
          <Input
            id="usu_contrasena"
            name="usu_contrasena"
            type="password"
            value={formData.usu_contrasena}
            onChange={handleChange}
            required
            disabled={action === "view"}
          />
        </div>
        <div>
          <Label htmlFor="usu_estado">Estado</Label>
          <Select
            defaultValue={formData.usu_estado}
            onValueChange={(value) => handleSelectChange("usu_estado", value)}
            disabled={action === "view"}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A">Activo</SelectItem>
              <SelectItem value="I">Inactivo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="usu_rol">Rol</Label>
          <Select
            defaultValue={formData.usu_rol}
            onValueChange={(value) => handleSelectChange("usu_rol", value)}
            disabled={action === "view"}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A">Admin</SelectItem>
              <SelectItem value="J">Jefe</SelectItem>
              <SelectItem value="E">Empleado</SelectItem>
              <SelectItem value="R">Auditor</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {action !== "view" && (
        <div className="pt-4">
          <Button type="submit">
            {action === "create" ? "Crear Usuario" : "Guardar Cambios"}
          </Button>
        </div>
      )}
      {error && <Alert variant="destructive">{error}</Alert>}
    </form>
  );
};

export default UserForm;
