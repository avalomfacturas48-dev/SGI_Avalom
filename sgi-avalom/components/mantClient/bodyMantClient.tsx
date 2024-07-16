"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { ModeToggle } from "../modeToggle";
import axios from "axios";
import { useEffect, useState } from "react";
import { Cliente } from "@/lib/types";
import cookie from "js-cookie";
import ManageClientActions from "./manageClientActions";
import { Plus } from "lucide-react";

const BodyMantClient: React.FC = () => {
  const [clients, setClients] = useState<Cliente[]>([]);
  const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   const fetchClients = async () => {
  //     const token = cookie.get("token");
  //     if (!token) {
  //       console.error("No hay token disponible");
  //       setError("No hay token disponible");
  //       return;
  //     }

  //     try {
  //       const response = await axios.get("/api/client", {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           "Content-Type": "application/json",
  //         },
  //       });
  //       setClients(response.data);
  //     } catch (error) {
  //       setError("Error al buscar clientes: " + error);
  //     }
  //   };

  //   fetchClients();
  // }, []);

  return (
    <div className="flex flex-col w-full space-y-10 md:flex-row md:space-y-0 md:space-x-10">
      <section className="p-4 md:px-5 md:py-10 mx-auto w-full flex flex-col space-y-10">
        <Card className="flex flex-col md:flex-row justify-between items-center w-full p-2">
          <h1 className="text-xl md:text-2xl font-bold">Gestión de Clientes</h1>
          <div className="flex flex-wrap justify-center md:justify-end">
            <ManageClientActions
              variant={"nuevo"}
              titleButtom={"Nuevo Cliente"}
              icon={<Plus />}
              title={"Nuevo Cliente"}
              description={"Ingresa un nuevo cliente"}
              action={"create"}
              classn={"m-2"}
            />
            <Button className="m-2">Exportar Clientes</Button>
            <Button className="m-2">Descargar Plantilla</Button>
            <Button className="m-2">Importar</Button>
            <ModeToggle />
          </div>
        </Card>
        <Card>
          <CardContent>
            <DataTable columns={columns} data={clients} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default BodyMantClient;
