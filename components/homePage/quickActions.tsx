"use client";

import { useState } from "react";
import Link from "next/link";
import { PlusCircle, UserPlus, Building2, LineChart, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ManageActions from "@/components/dataTable/manageActions";
import ClienteForm from "@/components/mantClient/clienteFormProps";

export function QuickActions() {
  const [openNewClient, setOpenNewClient] = useState(false);

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground mr-1 hidden sm:inline">
            Acciones rápidas:
          </span>

          <Button asChild variant="default" size="sm">
            <Link href="/newRent">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nuevo Alquiler
            </Link>
          </Button>

          <ManageActions
            open={openNewClient}
            onOpenChange={setOpenNewClient}
            variant="outline"
            titleButton="Nuevo Cliente"
            icon={<UserPlus className="h-4 w-4" />}
            title="Nuevo Cliente"
            description="Registra un nuevo cliente en el sistema"
            FormComponent={
              <ClienteForm
                action="create"
                onSuccess={() => setOpenNewClient(false)}
              />
            }
          />

          <Button asChild variant="outline" size="sm">
            <Link href="/mantBuild">
              <Building2 className="mr-2 h-4 w-4" />
              Edificios
            </Link>
          </Button>

          <Button asChild variant="outline" size="sm">
            <Link href="/accounting">
              <LineChart className="mr-2 h-4 w-4" />
              Contabilidad
            </Link>
          </Button>

          <Button asChild variant="outline" size="sm">
            <Link href="/expenses">
              <Receipt className="mr-2 h-4 w-4" />
              Gastos
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default QuickActions;
