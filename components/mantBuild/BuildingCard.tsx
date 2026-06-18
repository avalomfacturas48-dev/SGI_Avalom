"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  MapPin,
  Mail,
  MoreHorizontal,
  Banknote,
} from "lucide-react";
import axios from "axios";
import cookie from "js-cookie";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AlertDialog from "@/components/alertDialog";
import { AvaEdificio } from "@/lib/types";
import useBuildingStore from "@/lib/zustand/buildStore";

const formatCRC = (amount: bigint) =>
  new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    maximumFractionDigits: 0,
  }).format(Number(amount));

interface BuildingCardProps {
  building: AvaEdificio;
}

const BuildingCard: React.FC<BuildingCardProps> = ({ building }) => {
  const router = useRouter();
  const { removeBuilding } = useBuildingStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const properties = building.ava_propiedad ?? [];
  const total = properties.length;
  const ocupadas = properties.filter(
    (p) => (p.ava_alquiler?.length ?? 0) > 0
  ).length;
  const libres = total - ocupadas;

  const totalIngreso = properties
    .flatMap((p) => p.ava_alquiler ?? [])
    .reduce((sum, r) => sum + BigInt(r.alq_monto || "0"), BigInt(0));

  const handleDelete = async () => {
    try {
      const token = cookie.get("token");
      const response = await axios.delete(`/api/building/${building.edi_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response?.data?.success) {
        removeBuilding(building.edi_id);
        toast.success("Edificio eliminado", {
          description: `El edificio ${building.edi_identificador} ha sido borrado.`,
        });
      } else {
        toast.error("No se puede eliminar el edificio", {
          description: response?.data?.error || "Error desconocido",
        });
      }
    } catch (error: any) {
      toast.error("Error", {
        description:
          error.response?.data?.error ||
          error.message ||
          "Error interno del servidor",
      });
    }
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-md hover:border-primary/30 transition-all duration-200 flex flex-col group"
      onClick={() => router.push(`/mantBuild/${building.edi_id}`)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg font-semibold truncate group-hover:text-primary transition-colors">
              {building.edi_identificador}
            </CardTitle>
          </div>
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-7 w-7 p-0 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel className="text-center">
                Acciones
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild onClick={(e) => e.stopPropagation()}>
                <AlertDialog
                  title="¿Está seguro?"
                  description="Esta acción no se puede deshacer. ¿Está seguro de que desea borrar este edificio?"
                  triggerText="Borrar Edificio"
                  cancelText="Cancelar"
                  actionText="Continuar"
                  classn="p-4 m-0 h-8 w-full"
                  variant="ghost"
                  onAction={handleDelete}
                />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {building.edi_descripcion && (
          <CardDescription className="text-sm pl-11">
            {building.edi_descripcion}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="pb-3 flex-1 space-y-2">
        {building.edi_direccion && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-2">{building.edi_direccion}</span>
          </div>
        )}
        {building.edi_codigopostal && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4 flex-shrink-0" />
            <span>{building.edi_codigopostal}</span>
          </div>
        )}
        {totalIngreso > 0 && (
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Banknote className="h-4 w-4 flex-shrink-0 text-emerald-600" />
            <span>{formatCRC(totalIngreso)}<span className="text-muted-foreground font-normal"> / mes</span></span>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2 flex flex-wrap gap-1.5">
        <Badge variant="secondary" className="text-xs">
          {total} {total === 1 ? "propiedad" : "propiedades"}
        </Badge>
        {ocupadas > 0 && (
          <Badge
            variant="outline"
            className="text-xs bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-400"
          >
            {ocupadas} ocupada{ocupadas !== 1 ? "s" : ""}
          </Badge>
        )}
        {libres > 0 && (
          <Badge variant="outline" className="text-xs text-muted-foreground">
            {libres} libre{libres !== 1 ? "s" : ""}
          </Badge>
        )}
        {total === 0 && (
          <span className="text-xs text-muted-foreground italic">
            Sin propiedades
          </span>
        )}
      </CardFooter>
    </Card>
  );
};

export default BuildingCard;
