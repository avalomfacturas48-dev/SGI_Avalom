"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  MoreHorizontal,
  Wallet,
  Pencil,
  Banknote,
  CalendarDays,
  User,
  Users,
} from "lucide-react";
import axios from "axios";
import cookie from "js-cookie";
import Link from "next/link";
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
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AlertDialog from "@/components/alertDialog";
import DateRangeDialog from "@/components/DateRangeDialog";
import { AvaPropiedad } from "@/lib/types";
import { getClientFullName } from "@/utils/rentalHelpers";
import useBuildingStore from "@/lib/zustand/buildStore";
import useTypeStore from "@/lib/zustand/typeStore";

const formatCRC = (value: string) => {
  try {
    return new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: "CRC",
      maximumFractionDigits: 0,
    }).format(Number(BigInt(value)));
  } catch {
    return value;
  }
};

const getPaymentDay = (fechapago: string): number | null => {
  const datePart = fechapago.split("T")[0];
  const parts = datePart.split("-");
  return parts.length === 3 ? parseInt(parts[2], 10) : null;
};

interface PropertyCardProps {
  property: AvaPropiedad;
  ediId: string;
  onRefresh: () => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  ediId,
  onRefresh,
}) => {
  const router = useRouter();
  const { removeProperty } = useBuildingStore();
  const { types } = useTypeStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [openDateDialog, setOpenDateDialog] = useState(false);

  const activeRental = property.ava_alquiler?.[0];
  const isOcupada = !!activeRental;
  const typeName =
    property.ava_tipopropiedad?.tipp_nombre ??
    types.find((t) => t.tipp_id === property.tipp_id)?.tipp_nombre;

  const tenants =
    activeRental?.ava_clientexalquiler?.map((rel) => rel.ava_cliente) ?? [];
  const paymentDay = activeRental?.alq_fechapago
    ? getPaymentDay(activeRental.alq_fechapago)
    : null;

  const handleDelete = async () => {
    try {
      const token = cookie.get("token");
      const response = await axios.delete(`/api/property/${property.prop_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response?.data?.success) {
        removeProperty(property.edi_id || "0", property.prop_id);
        toast.success("Propiedad eliminada", {
          description: `La propiedad ${property.prop_identificador} ha sido borrada.`,
        });
        onRefresh();
      } else {
        toast.error("Error al eliminar", {
          description: response?.data?.error || "Error desconocido",
        });
      }
    } catch {
      toast.error("Error al borrar la propiedad");
    }
  };

  return (
    <>
      <Card
        className="cursor-pointer hover:shadow-md hover:border-primary/30 transition-all duration-200 flex flex-col group"
        onClick={() =>
          router.push(`/mantBuild/${ediId}/propiedades/${property.prop_id}`)
        }
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Home className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-base font-semibold truncate group-hover:text-primary transition-colors">
                {property.prop_identificador}
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
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="text-center">
                  Acciones
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {activeRental && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/accounting/payments/${activeRental.alq_id}`}
                        className="flex items-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Wallet className="mr-2 h-4 w-4" />
                        Ver contabilidad
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/mantRent/edit/${activeRental.alq_id}`}
                        className="flex items-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar alquiler
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenDateDialog(true);
                  }}
                >
                  Generar Reporte
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild onClick={(e) => e.stopPropagation()}>
                  <AlertDialog
                    title="¿Está seguro?"
                    description="Esta acción no se puede deshacer. ¿Está seguro de que desea borrar esta propiedad?"
                    triggerText="Borrar Propiedad"
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
          {property.prop_descripcion && (
            <CardDescription className="text-xs line-clamp-2 pl-10">
              {property.prop_descripcion}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="pb-2 flex-1 space-y-3">
          {typeName && (
            <Badge variant="secondary" className="text-xs">
              {typeName}
            </Badge>
          )}

          {isOcupada && activeRental && (
            <>
              <Separator className="opacity-50" />
              <div className="space-y-1.5">
                {activeRental.alq_monto && (
                  <div className="flex items-center gap-2 text-sm">
                    <Banknote className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                    <span className="font-semibold">
                      {formatCRC(activeRental.alq_monto)}
                    </span>
                    <span className="text-muted-foreground text-xs">/ mes</span>
                  </div>
                )}
                {paymentDay && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4 flex-shrink-0" />
                    <span>Pago el día {paymentDay}</span>
                  </div>
                )}
                {tenants.length > 0 && (
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    {tenants.length > 1 ? (
                      <Users className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    ) : (
                      <User className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-0.5">
                      {tenants.map((t) => (
                        <p key={t.cli_id} className="truncate max-w-[180px]">
                          {getClientFullName(t)}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>

        <CardFooter className="pt-2">
          {isOcupada ? (
            <Badge
              variant="outline"
              className="text-xs bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-400"
            >
              Ocupada
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs text-muted-foreground">
              Disponible
            </Badge>
          )}
        </CardFooter>
      </Card>

      <DateRangeDialog
        open={openDateDialog}
        onOpenChange={setOpenDateDialog}
        onGenerate={async (from, to) => {
          try {
            const token = cookie.get("token");
            const response = await axios.get(
              `/api/propertytypes/report/${property.prop_id}?from=${from}&to=${to}`,
              {
                responseType: "blob",
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute(
              "download",
              `reporte_propiedad_${property.prop_id}_rango.pdf`
            );
            document.body.appendChild(link);
            link.click();
            link.remove();
            setOpenDateDialog(false);
          } catch {
            toast.error("Error al generar el reporte por rango");
          }
        }}
      />
    </>
  );
};

export default PropertyCard;
