import { z } from "zod";
import {
  zDate,
  zEnum,
  zId,
  zMoney,
  zOptDate,
  zOptId,
  zOptText,
  zText,
} from "@/lib/validation";

// ============================================
// Esquemas de los bodies de la API (servidor).
// Los largos coinciden con las columnas de prisma/schema.prisma.
// Los campos que no aparecen aquí se descartan.
// ============================================

// ---------- Gastos y servicios ----------

const expenseBase = z.object({
  gas_tipo: zEnum(["S", "M"], "Tipo de gasto"),
  ser_id: zOptId,
  gas_concepto: zText(60, "El concepto"),
  gas_descripcion: zOptText(200, "La descripción"),
  gas_monto: zMoney.refine((v) => v > BigInt(0), "El monto debe ser mayor a 0"),
  gas_fecha: zOptDate,
  edi_id: zId,
  prop_id: zOptId,
  gas_metodopago: zOptText(30, "El método de pago"),
  gas_cuenta: zOptText(50, "La cuenta"),
  gas_banco: zOptText(50, "El banco"),
  gas_referencia: zOptText(100, "La referencia"),
  gas_comprobante: zOptText(500, "El comprobante"),
});

const expenseTypeRule = <T extends { gas_tipo: string; ser_id?: bigint | null }>(
  data: T,
  ctx: z.RefinementCtx
) => {
  if (data.gas_tipo === "S" && !data.ser_id) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Los gastos de servicio deben tener un servicio asociado",
      path: ["ser_id"],
    });
  }
  if (data.gas_tipo === "M" && data.ser_id) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Los gastos de mantenimiento no deben tener servicio asociado",
      path: ["ser_id"],
    });
  }
};

export const expenseSchema = expenseBase.superRefine(expenseTypeRule);

export const expenseCancelSchema = z.object({
  ang_motivo: zText(50, "El motivo de anulación"),
  ang_descripcion: zOptText(200, "La descripción"),
});

export const serviceSchema = z.object({
  ser_codigo: zText(30, "El código"),
  ser_nombre: zText(30, "El nombre"),
  ser_servicio: zOptText(40, "El servicio"),
  ser_negocio: zOptText(80, "El negocio"),
  ser_mediopago: zOptText(30, "El medio de pago"),
});

// ---------- Pagos y anulaciones ----------

const paymentBase = {
  pag_monto: zMoney.refine((v) => v > BigInt(0), "El monto debe ser mayor a 0"),
  pag_fechapago: zDate,
  pag_cuenta: zOptText(50, "La cuenta"),
  pag_descripcion: zOptText(50, "La descripción"),
  pag_metodopago: zText(30, "El método de pago"),
  pag_banco: zOptText(50, "El banco"),
  pag_referencia: zOptText(100, "La referencia"),
};

export const monthlyPaymentSchema = z.object({ ...paymentBase, alqm_id: zId });
export const depositPaymentSchema = z.object({ ...paymentBase, depo_id: zId });

export const paymentCancelSchema = z.object({
  pag_id: zId,
  anp_motivo: zText(50, "El motivo"),
  // Opcional en el formulario; la columna no admite null
  anp_descripcion: zOptText(50, "La descripción").transform((v) => v ?? ""),
  anp_fechaanulacion: zDate,
});

export const giftSchema = z.object({
  isGifted: z.boolean({ required_error: "isGifted es requerido" }),
});

// ---------- Alquileres ----------

const refundFields = {
  depo_montodevuelto: zMoney,
  depo_descmontodevuelto: zOptText(50, "La descripción del monto devuelto"),
  depo_montocastigo: zMoney,
  depo_descrmontocastigo: zOptText(50, "La descripción del castigo"),
  depo_fechadevolucion: zOptDate,
};

export const finishRentSchema = z.object(refundFields);

export const cancelRentSchema = z.object({
  ...refundFields,
  alqc_motivo: zText(50, "El motivo"),
  alqc_montodevuelto: zMoney,
  alqc_castigo: zMoney,
  alqc_motivomontodevuelto: zOptText(50, "El motivo del monto devuelto"),
  alqc_motivocastigo: zOptText(50, "El motivo del castigo"),
  alqc_fecha_cancelacion: zDate,
});

const rentEstado = zEnum(["A", "F", "C"], "Estado del alquiler");

export const rentCreateSchema = z.object({
  alq_monto: zMoney,
  alq_fechapago: zDate,
  alq_estado: rentEstado.default("A"),
  alq_contrato: zOptText(500, "El contrato"),
  prop_id: zId,
});

export const rentUpdateSchema = z.object({
  alq_monto: zMoney,
  alq_fechapago: zDate,
  alq_estado: rentEstado,
  ava_clientexalquiler: z.array(z.object({ cli_id: zId })).optional(),
});

const monthlyEstado = zEnum(["A", "P", "I", "R"], "Estado de la mensualidad");

export const monthlyRentSchema = z.object({
  alqm_identificador: zText(15, "El identificador"),
  alqm_fechainicio: zDate,
  alqm_fechafin: zDate,
  alqm_montototal: zMoney,
  alqm_montopagado: zMoney.default(BigInt(0)),
  alqm_fechapago: zOptDate,
  alqm_estado: monthlyEstado,
});

export const monthlyRentCreateSchema = monthlyRentSchema.extend({ alq_id: zId });

export const monthlyRentSaveAllSchema = z.object({
  alqId: zId,
  rents: z.array(monthlyRentSchema).min(1, "No hay mensualidades para guardar"),
});

export const depositCreateSchema = z.object({ alq_id: zId, depo_total: zMoney });
export const depositUpdateSchema = z.object({ depo_total: zMoney });

// ---------- Edificios, propiedades y clientes ----------

export const buildingSchema = z.object({
  edi_identificador: zText(15, "El identificador"),
  edi_descripcion: zOptText(50, "La descripción"),
  edi_direccion: zOptText(200, "La dirección"),
  edi_codigopostal: zOptText(10, "El código postal"),
});

export const propertySchema = z.object({
  prop_identificador: zText(15, "El identificador"),
  prop_descripcion: zOptText(50, "La descripción"),
  prop_descripcioncontrato: zOptText(300, "La descripción del contrato"),
  tipp_id: zOptId,
});

export const propertyCreateSchema = propertySchema.extend({ edi_id: zId });

export const propertyTypeSchema = z.object({
  tipp_nombre: zText(30, "El nombre"),
});

export const clientSchema = z.object({
  cli_nombre: zText(30, "El nombre"),
  cli_papellido: zText(30, "El primer apellido"),
  cli_sapellido: zOptText(30, "El segundo apellido"),
  cli_cedula: zText(15, "La cédula"),
  cli_telefono: zOptText(15, "El teléfono"),
  cli_correo: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? null : v),
    z.string().trim().email("Correo inválido").max(50).nullish()
  ),
  cli_direccion: zOptText(200, "La dirección"),
  cli_estadocivil: zOptText(20, "El estado civil"),
});

// ---------- Usuarios ----------

const userBase = {
  usu_nombre: zText(30, "El nombre"),
  usu_papellido: zText(30, "El primer apellido"),
  usu_sapellido: zOptText(30, "El segundo apellido"),
  usu_cedula: zText(15, "La cédula"),
  usu_correo: z
    .string({ required_error: "El correo es requerido" })
    .trim()
    .toLowerCase()
    .email("Correo inválido")
    .max(50),
  usu_telefono: zOptText(15, "El teléfono"),
  usu_estado: zEnum(["A", "I"], "Estado"),
  usu_rol: zEnum(["A", "J", "E", "R"], "Rol"),
};

const password = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .max(100);

export const userCreateSchema = z.object({ ...userBase, usu_contrasena: password });
export const userUpdateSchema = z.object({
  ...userBase,
  usu_contrasena: z.preprocess((v) => (v === "" ? undefined : v), password.optional()),
});

