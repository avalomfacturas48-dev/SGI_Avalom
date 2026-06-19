"use client";

import { useEffect, useState } from "react";
import cookie from "js-cookie";
import axios from "axios";
import { Plus } from "lucide-react";
import { columns } from "./columnsUser";
import { DataTable } from "@/components/dataTable/data-table";
import ManageActions from "@/components/dataTable/manageActions";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import UserForm from "./UserFormProps";
import useUserStore from "@/lib/zustand/userStore";

const BodyMantUser: React.FC = () => {
  const { users, setUsers } = useUserStore((state) => ({
    users: state.users,
    setUsers: state.setUsers,
  }));
  const [isLoading, setIsLoading] = useState(true);
  const [openNew, setOpenNew] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    const token = cookie.get("token");
    if (!token) {
      console.error("No hay token disponible");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.get("/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setUsers(response.data.data);
    } catch (error) {
      console.error("Error al buscar usuarios:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      {isLoading ? (
        <>
          <div className="flex justify-end">
            <Skeleton className="h-9 w-32" />
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="flex items-center px-6 py-4 border-b">
                <Skeleton className="h-8 w-64" />
              </div>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-6 px-6 py-4 border-b last:border-0">
                  <Skeleton className="h-5 w-[180px]" />
                  <Skeleton className="h-5 w-[120px]" />
                  <Skeleton className="h-5 w-[150px]" />
                  <Skeleton className="ml-auto h-8 w-8 rounded-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          <div className="flex justify-end">
            <ManageActions
              open={openNew}
              onOpenChange={setOpenNew}
              variant="default"
              titleButton="Nuevo Usuario"
              icon={<Plus className="mr-2 h-4 w-4" />}
              title="Nuevo Usuario"
              description="Ingresa un nuevo usuario"
              FormComponent={
                <UserForm
                  action="create"
                  onSuccess={() => {
                    setOpenNew(false);
                  }}
                />
              }
            />
          </div>

          <Card>
            <CardContent>
              <DataTable
                columns={columns}
                data={users}
                renderMobileCard={(user, actions) => (
                  <Card className="hover:bg-muted/50 transition-colors">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold">
                            {user.usu_nombre} {user.usu_papellido}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {user.usu_cedula}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <StatusBadge status={user.usu_estado} />
                          <div onClick={(e) => e.stopPropagation()}>{actions}</div>
                        </div>
                      </div>
                      <div className="border-t pt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
                        <span className="text-muted-foreground">Correo</span>
                        <span className="truncate">{user.usu_correo}</span>
                        <span className="text-muted-foreground">Rol</span>
                        <span>
                          {user.usu_rol === "A"
                            ? "Administrador"
                            : user.usu_rol === "J"
                            ? "Jefe"
                            : user.usu_rol === "E"
                            ? "Empleado"
                            : "Auditor"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default BodyMantUser;
