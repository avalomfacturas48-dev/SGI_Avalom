/**
 * @jest-environment node
 */
import { canManageRole, manageableRoles } from "@/lib/constants/roles";
import { isMontoEntero } from "@/lib/schemas/formFields";
import { expenseFormSchema } from "@/lib/schemas/expenseSchemas";

describe("roles", () => {
  it("Jefe gestiona todos los roles", () => {
    expect(manageableRoles("J")).toEqual(["A", "J", "E", "R"]);
  });

  it("Admin no puede gestionar Jefes", () => {
    expect(canManageRole("A", "E")).toBe(true);
    expect(canManageRole("A", "J")).toBe(false);
  });

  it("Empleado solo gestiona Empleados y Auditores", () => {
    expect(canManageRole("E", "E")).toBe(true);
    expect(canManageRole("E", "R")).toBe(true);
    expect(canManageRole("E", "A")).toBe(false);
    expect(canManageRole("E", "J")).toBe(false);
  });

  it("Auditor y roles desconocidos no gestionan a nadie", () => {
    expect(manageableRoles("R")).toEqual([]);
    expect(manageableRoles("Z")).toEqual([]);
  });
});

describe("montos en formularios", () => {
  it("solo acepta dígitos", () => {
    expect(isMontoEntero("15000")).toBe(true);
    expect(isMontoEntero(" 15000 ")).toBe(true);
    expect(isMontoEntero("15000.5")).toBe(false);
    expect(isMontoEntero("-5")).toBe(false);
    expect(isMontoEntero("")).toBe(false);
  });

  it("el formulario de gastos rechaza decimales igual que el servidor", () => {
    const base = {
      gas_tipo: "M",
      gas_concepto: "Pintura",
      gas_fecha: "2026-10-10",
      edi_id: "1",
    };
    expect(expenseFormSchema.safeParse({ ...base, gas_monto: "1500" }).success).toBe(true);
    expect(expenseFormSchema.safeParse({ ...base, gas_monto: "1500.50" }).success).toBe(false);
  });
});
