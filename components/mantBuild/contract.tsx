// types/contract.ts

export interface ContractData {
  // Campos existentes (obligatorios)
  arrendante: string;
  cedulaArrendante: string;
  arrendatario: string;
  cedulaArrendatario: string;
  estadoCivil: string;
  direccion: string;
  aptoNumero: string;
  contratoDesde: string;
  contratoHasta: string;
  montoTotal: number;
  diaPago: number;
  duracionAnios: number;
  
  // Nuevos campos obligatorios
  diaPrimerPago: number; // Día del mes del primer pago
  numeroMiembros: number; // Número de miembros del núcleo familiar
  depositoGarantia: number; // Monto del depósito de garantía
  
  // Nuevos campos opcionales
  fechaFirma?: string; // Fecha de firma del contrato
  matriculaFinca?: string; // Matrícula de la finca en el Registro Público
  planoFinca?: string; // Información del plano de la finca
  ubicacionFinca?: string; // Ubicación (distrito, cantón, provincia)
  linderosFinca?: string; // Linderos de la finca
  descripcionApartamento?: string; // Descripción detallada del apartamento
}
