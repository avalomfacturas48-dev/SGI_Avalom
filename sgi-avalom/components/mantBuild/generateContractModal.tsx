"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ContractData } from "@/components/mantBuild/contract";

interface User {
  id: string;
  nombre: string;
  cedula: string;
}

export default function GenerateContractModal() {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ContractData>({
    arrendante: "",
    cedulaArrendante: "",
    arrendatario: "",
    cedulaArrendatario: "",
    estadoCivil: "",
    direccion: "",
    aptoNumero: "",
    contratoDesde: "",
    contratoHasta: "",
    montoTotal: 0,
    diaPago: new Date().getDate(),
    duracionAnios: 1,
  });

  useEffect(() => {
    if (!open) return;
    setLoadingUsers(true);
    fetch("/api/users/listUsers")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error(err))
      .finally(() => setLoadingUsers(false));
  }, [open]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/generate-contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      toast.success("Contrato generado correctamente");
      setOpen(false);
    } catch (e) {
      console.error(e);
      toast.error("Error al generar contrato");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Generar Contrato</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generar Contrato</DialogTitle>
          <DialogDescription>
            Rellena la información faltante y selecciona un usuario.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <Label htmlFor="user-select">Usuario</Label>
            <Select
              onValueChange={(val) => {
                const user = users.find((u) => u.id === val);
                if (user) {
                  setData((prev) => ({
                    ...prev,
                    arrendatario: user.nombre,
                    cedulaArrendatario: user.cedula,
                  }));
                }
              }}
              disabled={loadingUsers}
            >
              <SelectTrigger id="user-select">
                <SelectValue
                  placeholder={
                    loadingUsers ? "Cargando..." : "Selecciona usuario"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.nombre} - {u.cedula}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Resto de campos de contrato */}
          <div>
            <Label htmlFor="arrendante">Arrendante</Label>
            <Input
              id="arrendante"
              value={data.arrendante}
              onChange={(e) =>
                setData((prev) => ({ ...prev, arrendante: e.target.value }))
              }
            />
          </div>
          <div>
            <Label htmlFor="cedulaArrendante">Cédula Arrendante</Label>
            <Input
              id="cedulaArrendante"
              value={data.cedulaArrendante}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  cedulaArrendante: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <Label htmlFor="estadoCivil">Estado Civil</Label>
            <Input
              id="estadoCivil"
              value={data.estadoCivil}
              onChange={(e) =>
                setData((prev) => ({ ...prev, estadoCivil: e.target.value }))
              }
            />
          </div>
          <div>
            <Label htmlFor="direccion">Dirección</Label>
            <Input
              id="direccion"
              value={data.direccion}
              onChange={(e) =>
                setData((prev) => ({ ...prev, direccion: e.target.value }))
              }
            />
          </div>
          <div>
            <Label htmlFor="aptoNumero">Nro. Apto</Label>
            <Input
              id="aptoNumero"
              value={data.aptoNumero}
              onChange={(e) =>
                setData((prev) => ({ ...prev, aptoNumero: e.target.value }))
              }
            />
          </div>
          <div>
            <Label htmlFor="contratoDesde">Desde</Label>
            <Input
              id="contratoDesde"
              type="date"
              value={data.contratoDesde}
              onChange={(e) =>
                setData((prev) => ({ ...prev, contratoDesde: e.target.value }))
              }
            />
          </div>
          <div>
            <Label htmlFor="contratoHasta">Hasta</Label>
            <Input
              id="contratoHasta"
              type="date"
              value={data.contratoHasta}
              onChange={(e) =>
                setData((prev) => ({ ...prev, contratoHasta: e.target.value }))
              }
            />
          </div>
          <div>
            <Label htmlFor="montoTotal">Monto Total</Label>
            <Input
              id="montoTotal"
              type="number"
              value={data.montoTotal}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  montoTotal: Number(e.target.value),
                }))
              }
            />
          </div>
          <div>
            <Label htmlFor="diaPago">Día de Pago</Label>
            <Input
              id="diaPago"
              type="number"
              value={data.diaPago}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  diaPago: Number(e.target.value),
                }))
              }
            />
          </div>
          <div>
            <Label htmlFor="duracionAnios">Duración (años)</Label>
            <Input
              id="duracionAnios"
              type="number"
              value={data.duracionAnios}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  duracionAnios: Number(e.target.value),
                }))
              }
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" className="mr-2">
              Cancelar
            </Button>
          </DialogClose>
          <Button variant="default" onClick={handleSubmit} disabled={loading}>
            {loading ? "Generando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
