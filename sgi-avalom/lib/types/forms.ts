import { AvaEdificio, AvaPago, AvaPropiedad, Cliente, User, AvaGasto } from "./entities";

// ============================================
// Building Management Forms
// ============================================

export interface RentalFormProps {
  action: "create" | "edit" | "view";
  onSuccess: () => void;
}

export interface PropertyFormProps {
  action: "create" | "edit" | "view";
  property?: AvaPropiedad;
  entity?: string;
  onSuccess: () => void;
}

export interface BuildFormProps {
  action: "create" | "edit" | "view";
  building?: AvaEdificio;
  onSuccess: () => void;
}

// ============================================
// User Management Forms
// ============================================

export interface UserFormProps {
  action: "create" | "edit" | "view";
  entity?: User;
  onSuccess: () => void;
}

// ============================================
// Client Management Forms
// ============================================

export interface ClienteFormProps {
  action: "create" | "edit" | "view";
  entity?: Cliente;
  onSuccess: () => void;
}

// ============================================
// Payment Forms
// ============================================

export interface CancelPaymentFormProps {
  payment: AvaPago;
  onSuccess: () => void;
  /** @deprecated Use onSuccess instead */
  onClose?: () => void;
}

// ============================================
// Expense Module Forms (New Gastos Module)
// ============================================

export interface GastoFormProps {
  action: "create" | "edit" | "view";
  gasto?: AvaGasto;
  onSuccess: () => void;
}

export interface CancelGastoFormProps {
  gasto: AvaGasto;
  onSuccess: () => void;
}
