"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { CreditCard, FileText } from "lucide-react";

interface PaymentFormProps {
  onSubmit: (data: { pag_descripcion: string; pag_cuenta: string }) => void;
}

export function PaymentForm({ onSubmit }: PaymentFormProps) {
  const [pag_descripcion, setPagDescripcion] = useState("");
  const [pag_cuenta, setPagCuenta] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ pag_descripcion, pag_cuenta });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Detalles del Pago
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="pag_cuenta"
              className="text-sm font-medium flex items-center"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Cuenta
            </label>
            <Input
              id="pag_cuenta"
              value={pag_cuenta}
              onChange={(e) => setPagCuenta(e.target.value)}
              placeholder="Ingrese la cuenta"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="pag_descripcion"
              className="text-sm font-medium flex items-center"
            >
              <FileText className="mr-2 h-4 w-4" />
              Descripción
            </label>
            <Textarea
              id="pag_descripcion"
              value={pag_descripcion}
              onChange={(e) => setPagDescripcion(e.target.value)}
              placeholder="Ingrese la descripción del pago"
              rows={4}
              className="w-full"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full sm:w-auto">
            Guardar
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
