// ============================================
// Rental Payloads
// ============================================

export interface FinalizarAlquilerPayload {
  depo_montodevuelto: string;
  depo_descmontodevuelto?: string;
  depo_montocastigo?: string;
  depo_descrmontocastigo?: string;
  depo_fechadevolucion: string;
}

export interface CancelarAlquilerPayload {
  depo_montodevuelto: string;
  depo_descmontodevuelto?: string;
  depo_montocastigo?: string;
  depo_descrmontocastigo?: string;
  depo_fechadevolucion: string;

  alqc_motivo: string;
  alqc_montodevuelto?: string;
  alqc_castigo?: string;
  alqc_motivomontodevuelto?: string;
  alqc_motivocastigo?: string;
  alqc_fecha_cancelacion: string;
}

// ============================================
// Expense Module Payloads (New Gastos Module)
// ============================================

export interface CrearGastoPayload {
  gas_tipo: "S" | "M";
  gas_concepto: string;
  gas_descripcion?: string;
  gas_monto: string;
  gas_fecha?: string;
  gas_metodopago?: string;
  gas_cuenta?: string;
  gas_banco?: string;
  gas_referencia?: string;
  gas_comprobante?: string;
  edi_id: string;
  prop_id?: string;
  ser_id?: string;
  usu_id?: string;
}

export interface AnularGastoPayload {
  ang_motivo: string;
  ang_descripcion?: string;
  usu_id: string;
}
