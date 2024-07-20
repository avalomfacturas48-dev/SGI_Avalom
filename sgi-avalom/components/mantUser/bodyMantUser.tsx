"use client";
import { useEffect } from "react";
import cookie from "js-cookie";
import axios from "axios";
import { Plus } from "lucide-react";
import useUserStore from "@/lib/zustand/userStore";
import { User } from "@/lib/types";
import { ModeToggle } from "@/components/modeToggle";
import { columns } from "./columnsUser";
import { DataTable } from "@/components/dataTable/data-table";
import ManageActions from "@/components/dataTable/manageActions";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import UserForm from "./UserFormProps";

const BodyMantUser: React.FC = () => {
  const { users, setUsers } = useUserStore((state) => ({
    users: state.users,
    setUsers: state.setUsers,
    addUser: state.addUser,
  }));

  useEffect(() => {
    const fetchUsers = async () => {
      const token = cookie.get("token");
      if (!token) {
        console.error("No hay token disponible");
        return;
      }

      try {
        const response = await axios.get("/api/users", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setUsers(response.data);
      } catch (error) {
        console.error("Error al buscar usuarios: " + error);
      }
    };

    fetchUsers();
  }, [setUsers]);

  return (
    <div className="flex flex-col w-full space-y-10 md:flex-row md:space-y-0 md:space-x-10">
      <section className="p-4 md:px-5 md:py-10 mx-auto w-full flex flex-col space-y-10">
        <Card className="flex flex-col md:flex-row justify-between items-center w-full p-2">
          <h1 className="text-xl md:text-2xl font-bold">Gestión de Usuarios</h1>
          <div className="flex flex-wrap justify-center md:justify-end">
          <ManageActions<User>
              variant={"nuevo"}
              titleButton={"Nuevo Usuario"}
              icon={<Plus />}
              title={"Nuevo Usuario"}
              description={"Ingresa un nuevo Usuario"}
              action={"create"}
              classn={"m-2"}
              FormComponent={UserForm}
            />
            <Button className="m-2">Exportar Usuarios</Button>
            <Button className="m-2">Descargar Plantilla</Button>
            <Button className="m-2">Importar</Button>
            <ModeToggle />
          </div>
        </Card>
        <Card>
          <CardContent>
            <DataTable data={users} columns={columns} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default BodyMantUser;
