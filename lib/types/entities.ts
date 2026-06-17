// ============================================
// User & Authentication Types
// ============================================

export interface User {
  usu_id: string;
  usu_nombre: string;
  usu_papellido: string;
  usu_sapellido?: string;
  usu_cedula: string;
  usu_correo: string;
  usu_contrasena: string;
  usu_telefono?: string;
  usu_fechacreacion?: string;
  usu_estado: "A" | "I";
  usu_rol: "A" | "J" | "E" | "R";
  ava_anulacionpago?: AvaAnulacionPago[];
  ava_gasto?: AvaGasto[];
  ava_anulaciongasto?: AvaAnulacionGasto[];
}

export interface UserWithToken extends User {
  userId: string;
  userRole: string;
}

// ============================================
// Client Types
// ============================================

export interface Cliente {
  cli_id: string;
  cli_nombre: string;
  cli_papellido: string;
  cli_sapellido?: string;
  cli_cedula: string;
  cli_telefono: string;
  cli_correo: string;
  cli_fechacreacion?: string;
  cli_direccion?: string;
  cli_estadocivil?: string;
  ava_clientexalquiler: AvaClientexAlquiler[];
}

export interface AvaClientexAlquiler {
  alq_id: string;
  cli_id: string;
  ava_alquiler: AvaAlquiler;
  ava_cliente: Cliente;
}

// ============================================
// Property & Building Types
// ============================================

export interface AvaEdificio {
  edi_id: string;
  edi_identificador: string;
  edi_descripcion?: string;
  edi_direccion?: string;
  edi_codigopostal?: string;
  ava_propiedad: AvaPropiedad[];
  ava_gasto?: AvaGasto[];
}

export interface AvaPropiedad {
  prop_id: string;
  prop_identificador: string;
  prop_descripcion?: string;
  edi_id?: string;
  tipp_id?: string;
  ava_alquiler: AvaAlquiler[];
  ava_edificio?: AvaEdificio;
  ava_tipopropiedad?: AvaTipoPropiedad;
  ava_reservacion: AvaReservacion[];
  ava_gasto?: AvaGasto[];
}

export interface AvaTipoPropiedad {
  tipp_id: string;
  tipp_nombre: string;
  ava_propiedad: AvaPropiedad[];
}

// ============================================
// Rental Types
// ============================================

export interface AvaAlquiler {
  alq_id: string;
  alq_monto: string;
  alq_fechapago: string;
  alq_contrato?: string;
  alq_estado: "A" | "F" | "C";
  alq_fechacreacion?: string;
  prop_id?: string;
  ava_propiedad?: AvaPropiedad;
  ava_alquilermensual: AvaAlquilerMensual[];
  ava_deposito: AvaDeposito[];
  ava_clientexalquiler: AvaClientexAlquiler[];
  ava_alquilercancelado?: AvaAlquilerCancelado[];
}

export interface AvaAlquilerMensual {
  alqm_id: string;
  alqm_identificador: string;
  alqm_fechainicio: string;
  alqm_fechafin: string;
  alqm_montototal: string;
  alqm_montopagado: string;
  alqm_fechapago?: string;
  alqm_estado: "A" | "P" | "I" | "R";
  alqm_fechacreacion?: string;
  alq_id?: string;
  ava_alquiler?: AvaAlquiler;
  ava_pago: AvaPago[];
}

export interface AvaAlquilerCancelado {
  alqc_id: string;
  alqc_motivo: string;
  alqc_montodevuelto?: string;
  alqc_castigo?: string;
  alqc_motivomontodevuelto?: string;
  alqc_motivocastigo?: string;
  alqc_fecha_cancelacion: string;
  alqc_fechacreacion?: string;
  alq_id?: string;
  ava_alquiler?: AvaAlquiler;
}

// ============================================
// Deposit Types
// ============================================

export interface AvaDeposito {
  depo_id: string;
  depo_montoactual: string;
  depo_total: string;
  depo_montodevuelto?: string;
  depo_montocastigo?: string;
  depo_descmontodevuelto?: string;
  depo_descrmontocastigo?: string;
  depo_fechadevolucion?: string;
  depo_fechacreacion?: string;
  alq_id?: string;
  ava_alquiler?: AvaAlquiler;
  ava_pago: AvaPago[];
}

// ============================================
// Payment Types
// ============================================

export interface AvaPago {
  pag_id: string;
  pag_monto: string;
  pag_descripcion?: string;
  pag_cuenta?: string;
  pag_metodopago?: string;
  pag_banco?: string;
  pag_referencia?: string;
  pag_estado: "A" | "D";
  pag_fechapago: string;
  res_id?: string;
  alqm_id?: string;
  depo_id?: string;
  ava_reservacion?: AvaReservacion;
  ava_alquilermensual?: AvaAlquilerMensual;
  ava_deposito?: AvaDeposito;
  ava_anulacionpago?: AvaAnulacionPago[];
}

export interface AvaAnulacionPago {
  anp_id: string;
  anp_motivo: string;
  anp_descripcion: string;
  anp_montooriginal: string;
  anp_montofinal: string;
  anp_fechaanulacion: string;
  pag_id?: string;
  usu_id?: string;
  ava_pago?: AvaPago;
  ava_usuario?: User;
}

// ============================================
// Reservation Types
// ============================================

export interface AvaReservacion {
  res_id: string;
  res_nombrecliente: string;
  res_telefonocliente?: string;
  res_correocliente?: string;
  res_fechaentrada: string;
  res_fechasalida: string;
  res_montototal: string;
  res_montoactual: string;
  res_estado: "R" | "A" | "C" | "F";
  res_fechacreacion?: string;
  prop_id?: string;
  ava_pago: AvaPago[];
  ava_propiedad?: AvaPropiedad;
}

// ============================================
// Service Types
// ============================================

export interface AvaServicio {
  ser_id: string;
  ser_codigo: string;
  ser_nombre: string;
  ser_servicio?: string;
  ser_negocio?: string;
  ser_mediopago?: string;
  ava_gasto?: AvaGasto[];
}

// ============================================
// Expense Module Types (New Gastos Module)
// ============================================

export type TipoGasto = "S" | "M"; // S = Servicio, M = Mantenimiento
export type EstadoGasto = "A" | "D"; // A = Activo, D = Anulado

export interface AvaGasto {
  gas_id: string;
  gas_tipo: TipoGasto;
  gas_concepto: string;
  gas_descripcion?: string;
  gas_monto: string;
  gas_fecha: string;
  gas_estado: EstadoGasto;
  gas_metodopago?: string;
  gas_cuenta?: string;
  gas_banco?: string;
  gas_referencia?: string;
  gas_comprobante?: string;
  edi_id: string;
  prop_id?: string;
  ser_id?: string;
  usu_id?: string;
  ava_edificio?: AvaEdificio;
  ava_propiedad?: AvaPropiedad;
  ava_servicio?: AvaServicio;
  ava_usuario?: User;
  ava_anulaciongasto?: AvaAnulacionGasto[];
}

export interface AvaAnulacionGasto {
  ang_id: string;
  ang_motivo: string;
  ang_descripcion?: string;
  ang_montooriginal: string;
  ang_montofinal: string;
  ang_fechaanulacion: string;
  gas_id: string;
  usu_id: string;
  ava_gasto?: AvaGasto;
  ava_usuario?: User;
}

// ============================================
// Next.js Extension Types
// ============================================

declare module "next/server" {
  interface NextRequest {
    user?: User;
  }
}
