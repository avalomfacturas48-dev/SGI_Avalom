export interface Cliente {
  cli_id: number;
  cli_nombre: string;
  cli_papellido: string;
  cli_sapellido?: string | null;
  cli_cedula: string;
  cli_telefono: string;
  cli_correo?: string | null;
  cli_fechacreacion?: string | null;
  ava_deposito: AvaDeposito[];
  ava_pago: AvaPago[];
}

export interface AvaDeposito {
  dep_id: number;
  dep_monto: number;
  dep_fecha: string;
  cli_id: number;
}

export interface AvaPago {
  pago_id: number;
  pago_monto: number;
  pago_fecha: string;
  cli_id: number;
}

export interface User {
  usu_id: number;
  usu_nombre: string;
  usu_papellido: string;
  usu_sapellido?: string | null;
  usu_cedula: string;
  usu_correo: string;
  usu_contrasena: string;
  usu_telefono?: string | null;
  usu_fechacreacion?: string | null;
  usu_estado: string;
  usu_rol: string;
}

declare module "next/server" {
  interface NextRequest {
    user?: User;
  }
}
