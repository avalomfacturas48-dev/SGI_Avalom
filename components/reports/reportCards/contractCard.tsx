"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";
import { ContractDialog } from "./contractDialog";

export function ContractCard() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Generar Contrato de Arrendamiento
          </CardTitle>
          <CardDescription>Genera un contrato legal de arrendamiento en PDF</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={() => setDialogOpen(true)} className="w-full" variant="default">
            <Plus className="mr-2 h-4 w-4" />
            Abrir Formulario de Contrato
          </Button>
        </CardFooter>
      </Card>

      <ContractDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}

