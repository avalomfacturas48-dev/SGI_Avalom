import { useState } from "react";
import { AvaEdificio, AvaPropiedad } from "@/lib/types";
import axios from "axios";
import cookie from "js-cookie";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "../ui/label";
import { Alert } from "@/components/ui/alert";
import useBuildingStore from "@/lib/zustand/buildStore";
import { DataTable } from "../dataTable/data-table";
import { columns } from "./columnProperty";

interface BuildFormProps {
  action: "create" | "edit" | "view";
  entity?: AvaEdificio;
  onSuccess: () => void;
}

const BuildForm: React.FC<BuildFormProps> = ({ action, entity, onSuccess }) => {
  const initialFormData = entity || {
    edi_identificador: "",
    edi_descripcion: "",
  };
  const [formData, setFormData] =
    useState<Partial<AvaEdificio>>(initialFormData);
  const [error, setError] = useState<string | null>(null);
  const { addBuilding, updateBuilding } = useBuildingStore();

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
      // const token = cookie.get("token");
      // if (!token) {
      //   console.error("No hay token disponible");
      //   setError("No hay token disponible");
      //   return;
      // }

      // const headers = {
      //   Authorization: `Bearer ${token}`,
      //   "Content-Type": "application/json",
      // };

      // if (action === "create") {
      //   const response = await axios.post("/api/building", formData, { headers });
      //   if (response.data) {
      //     addBuilding(response.data);
      //     console.log("Edificio creado:", response.data);
      //     onSuccess && onSuccess();
      //   }
      // } else if (action === "edit") {
      //   const response = await axios.put(
      //     `/api/building/${formData.edi_id}`,
      //     formData,
      //     { headers }
      //   );
      //   if (response.data) {
      //     updateBuilding(response.data);
      //     console.log("Edificio Actualizado:", response.data);
      //     onSuccess && onSuccess();
      //   }
      // }
      if (action === "create") {
        addBuilding(formData as AvaEdificio);
        console.log("Edificio creado:", formData);
        onSuccess && onSuccess();
      } else if (action === "edit") {
        updateBuilding(formData as AvaEdificio);
        console.log("Edificio Actualizado:", formData);
        onSuccess && onSuccess();
      }
    } catch (error: any) {
      console.error("Error al guardar el Edificio:", error);
      const errorMessage = error.response?.data?.error || "Error desconocido";
      setError("Error al guardar el Edificio: " + errorMessage);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="edi_identificador">Identificador</Label>
            <Input
              id="edi_identificador"
              name="edi_identificador"
              type="text"
              value={formData.edi_identificador}
              onChange={handleChange}
              required
              disabled={action === "view"}
            />
          </div>
          <div>
            <Label htmlFor="edi_descripcion">Descripcion</Label>
            <Input
              id="edi_descripcion"
              name="edi_descripcion"
              type="text"
              value={formData.edi_descripcion || ""}
              onChange={handleChange}
              required
              disabled={action === "view"}
            />
          </div>
        </div>
        {action !== "view" && (
          <div className="pt-4">
            <Button type="submit">
              {action === "create" ? "Crear Edificio" : "Guardar Cambios"}
            </Button>
          </div>
        )}
        {error && <Alert variant="destructive">{error}</Alert>}
      </form>
      <div className="">
        <DataTable columns={columns} data={entity?.ava_propiedad as AvaPropiedad[]} />
      </div>
    </div>
  );
};

export default BuildForm;
