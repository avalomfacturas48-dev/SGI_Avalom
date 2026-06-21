"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import cookie from "js-cookie";
import { toast } from "sonner";
import {
  ArrowLeft,
  CalendarIcon,
  Download,
  FileText,
  Loader2,
  User,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { BreadcrumbResponsive } from "@/components/breadcrumbResponsive";
import { AvaAlquiler } from "@/lib/types";
import { formatLongDateEs } from "@/utils/dateUtils";

interface ContractForm {
  arrendatario: string;
  cedulaArrendatario: string;
  estadoCivil: string;
  aptoNumero: string;
  descripcionApartamento: string;
  montoTotal: string;
  diaPago: string;
  primerPago: string;
  contratoDesde: string;
  contratoHasta: string;
  depositoGarantia: string;
  fechaFirma: string;
}

const EMPTY_FORM: ContractForm = {
  arrendatario: "",
  cedulaArrendatario: "",
  estadoCivil: "",
  aptoNumero: "",
  descripcionApartamento: "",
  montoTotal: "",
  diaPago: "",
  primerPago: "",
  contratoDesde: "",
  contratoHasta: "",
  depositoGarantia: "",
  fechaFirma: "",
};

// Formatea una fecha ISO a "1 de julio de 2026"; vacío si no hay dato.
const longDate = (iso?: string | null): string => {
  if (!iso) return "";
  try {
    return formatLongDateEs(iso);
  } catch {
    return "";
  }
};

// Día del mes (1-31) de una fecha ISO.
const dayOfMonth = (iso?: string | null): string =>
  iso ? String(new Date(iso).getUTCDate()) : "";

// Menor / mayor fecha ISO de una lista (las ISO se ordenan lexicográficamente).
const minIso = (arr: (string | undefined | null)[]): string | null => {
  const v = arr.filter(Boolean) as string[];
  return v.length ? v.reduce((a, b) => (a < b ? a : b)) : null;
};
const maxIso = (arr: (string | undefined | null)[]): string | null => {
  const v = arr.filter(Boolean) as string[];
  return v.length ? v.reduce((a, b) => (a > b ? a : b)) : null;
};

// Campo de fecha: texto editable (precargado por defecto) + calendario opcional.
// Al elegir una fecha, escribe el texto en formato "1 de abril de 2025".
const DateField: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}> = ({ value, onChange, placeholder }) => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  return (
    <div className="flex gap-2">
      <Input
        className="flex-1"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Seleccionar fecha"
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => {
              setDate(d);
              if (d) onChange(format(d, "PPP", { locale: es }));
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

const BodyContract: React.FC = () => {
  const { alqId } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState<ContractForm>(EMPTY_FORM);
  const [propIdent, setPropIdent] = useState<string>("");

  const handleChange = (field: keyof ContractForm, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  useEffect(() => {
    if (!alqId) return;

    const fetchRental = async () => {
      setLoading(true);
      try {
        const token = cookie.get("token");
        if (!token) throw new Error("Token no disponible");

        const { data } = await axios.get(`/api/modifiyrent/${alqId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!data?.success) {
          throw new Error(data?.error || "Error al cargar el alquiler.");
        }

        const rental: AvaAlquiler = data.data;
        const cliente = rental.ava_clientexalquiler?.[0]?.ava_cliente;
        const propiedad = rental.ava_propiedad;
        const deposito = rental.ava_deposito?.[0];

        const nombreCompleto = cliente
          ? [cliente.cli_nombre, cliente.cli_papellido, cliente.cli_sapellido]
              .filter(Boolean)
              .join(" ")
              .trim()
          : "";

        // Derivar de la información existente del alquiler.
        const monthly = rental.ava_alquilermensual ?? [];
        const inicioContrato = minIso(monthly.map((m) => m.alqm_fechainicio));
        const finContrato = maxIso(monthly.map((m) => m.alqm_fechafin));
        const pagos = [
          ...monthly.flatMap((m) => m.ava_pago ?? []),
          ...(deposito?.ava_pago ?? []),
        ].map((p) => p.pag_fechapago);
        const primerPago = minIso(pagos);
        const diaPago = dayOfMonth(rental.alq_fechapago);

        setPropIdent(propiedad?.prop_identificador ?? "");
        setForm({
          arrendatario: nombreCompleto,
          cedulaArrendatario: cliente?.cli_cedula ?? "",
          estadoCivil: cliente?.cli_estadocivil ?? "",
          aptoNumero: propiedad?.prop_identificador ?? "",
          descripcionApartamento: propiedad?.prop_descripcioncontrato ?? "",
          montoTotal: rental.alq_monto ? String(rental.alq_monto) : "",
          diaPago,
          primerPago: longDate(primerPago),
          contratoDesde: longDate(inicioContrato),
          contratoHasta: longDate(finContrato),
          depositoGarantia: deposito?.depo_montoactual
            ? String(deposito.depo_montoactual)
            : "",
          fechaFirma: longDate(rental.alq_fechafirma),
        });
      } catch (error: any) {
        toast.error("Error", {
          description: error.message || "Error al cargar el alquiler.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRental();
  }, [alqId]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const token = cookie.get("token");
      const payload = {
        ...form,
        montoTotal: form.montoTotal ? Number(form.montoTotal) : undefined,
        diaPago: form.diaPago ? Number(form.diaPago) : undefined,
        depositoGarantia: form.depositoGarantia
          ? Number(form.depositoGarantia)
          : undefined,
      };

      const response = await fetch("/api/generate-contract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Error al generar el contrato");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `contrato_${form.aptoNumero || "apartamento"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("Contrato generado exitosamente");
    } catch (error: any) {
      toast.error("Error", {
        description: error.message || "Error al generar el contrato",
      });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-72 w-full rounded-md" />
        <Skeleton className="h-72 w-full rounded-md" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <Card className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <CardHeader>
          <BreadcrumbResponsive
            items={[
              { label: "Inicio", href: "/homePage" },
              { label: "Gestión de alquileres", href: "/mantRent" },
              {
                label: propIdent
                  ? `Propiedad ${propIdent}`
                  : "Alquiler",
                href: `/mantRent/edit/${alqId}`,
              },
              { label: "Contrato" },
            ]}
          />
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl md:text-2xl text-primary font-bold">
            <FileText className="h-6 w-6" />
            Contrato de arrendamiento
          </CardTitle>
          <CardDescription>
            Los campos disponibles se rellenan con la información del alquiler.
            Complete lo que falte; lo que quede vacío saldrá en blanco en el PDF.
          </CardDescription>
        </CardHeader>
        <div className="px-6 pb-6 sm:pb-0">
          <Button
            variant="outline"
            onClick={() => router.push(`/mantRent/edit/${alqId}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al alquiler
          </Button>
        </div>
      </Card>

      {/* Información de las partes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <User className="h-4 w-4 text-primary" />
            Información del arrendatario
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Arrendatario</Label>
            <Input
              value={form.arrendatario}
              onChange={(e) => handleChange("arrendatario", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Cédula</Label>
            <Input
              value={form.cedulaArrendatario}
              onChange={(e) =>
                handleChange("cedulaArrendatario", e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Estado civil</Label>
            <Input
              value={form.estadoCivil}
              onChange={(e) => handleChange("estadoCivil", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Número de apartamento</Label>
            <Input
              value={form.aptoNumero}
              onChange={(e) => handleChange("aptoNumero", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Apartamento y contrato */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <FileText className="h-4 w-4 text-primary" />
            Apartamento y condiciones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Descripción del apartamento (de qué consta)</Label>
            <Textarea
              rows={2}
              placeholder="sala, comedor, cocina, dos habitaciones y un baño"
              value={form.descripcionApartamento}
              onChange={(e) =>
                handleChange("descripcionApartamento", e.target.value)
              }
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Monto del alquiler (₡)</Label>
              <Input
                type="number"
                value={form.montoTotal}
                onChange={(e) => handleChange("montoTotal", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Día de pago mensual (1-31)</Label>
              <Input
                type="number"
                min={1}
                max={31}
                value={form.diaPago}
                onChange={(e) => handleChange("diaPago", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Fecha del primer pago</Label>
              <DateField
                value={form.primerPago}
                placeholder="1 de abril de 2025"
                onChange={(v) => handleChange("primerPago", v)}
              />
            </div>
            <div className="space-y-2">
              <Label>Depósito de garantía (₡)</Label>
              <Input
                type="number"
                value={form.depositoGarantia}
                onChange={(e) =>
                  handleChange("depositoGarantia", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Inicio del contrato</Label>
              <DateField
                value={form.contratoDesde}
                placeholder="1 de abril de 2025"
                onChange={(v) => handleChange("contratoDesde", v)}
              />
            </div>
            <div className="space-y-2">
              <Label>Fin del contrato</Label>
              <DateField
                value={form.contratoHasta}
                placeholder="1 de abril de 2028"
                onChange={(v) => handleChange("contratoHasta", v)}
              />
            </div>
            <div className="space-y-2">
              <Label>Fecha de firma</Label>
              <DateField
                value={form.fechaFirma}
                placeholder="1 de abril de 2025"
                onChange={(v) => handleChange("fechaFirma", v)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex justify-end">
        <Button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-2"
        >
          {generating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Generar contrato
        </Button>
      </div>
    </div>
  );
};

export default BodyContract;
