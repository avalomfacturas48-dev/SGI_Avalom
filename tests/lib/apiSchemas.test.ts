/**
 * @jest-environment node
 */
import {
  cancelRentSchema,
  clientSchema,
  expenseSchema,
  monthlyPaymentSchema,
  monthlyRentSaveAllSchema,
  paymentCancelSchema,
  propertyCreateSchema,
  rentUpdateSchema,
  userCreateSchema,
  userUpdateSchema,
} from "@/lib/schemas/apiSchemas";

const gastoBase = {
  gas_tipo: "S",
  ser_id: "4",
  gas_concepto: "Pago electricidad",
  gas_monto: "22345",
  gas_fecha: "2026-09-01T06:00:00.000Z",
  edi_id: "1",
};

describe("expenseSchema", () => {
  it("acepta un gasto de servicio válido y convierte tipos", () => {
    const r = expenseSchema.parse(gastoBase);
    expect(r.gas_monto).toBe(BigInt(22345));
    expect(r.ser_id).toBe(BigInt(4));
    expect(r.gas_fecha).toBeInstanceOf(Date);
  });

  it("descarta campos no permitidos (asignación masiva)", () => {
    const r = expenseSchema.parse({
      ...gastoBase,
      gas_estado: "D",
      usu_id: "1",
      gas_id: "999",
    }) as Record<string, unknown>;
    expect(r.gas_estado).toBeUndefined();
    expect(r.usu_id).toBeUndefined();
    expect(r.gas_id).toBeUndefined();
  });

  it("exige servicio en gastos de servicio y lo prohíbe en mantenimiento", () => {
    expect(expenseSchema.safeParse({ ...gastoBase, ser_id: "" }).success).toBe(false);
    expect(
      expenseSchema.safeParse({ ...gastoBase, gas_tipo: "M", ser_id: "4" }).success
    ).toBe(false);
    expect(
      expenseSchema.safeParse({ ...gastoBase, gas_tipo: "M", ser_id: "" }).success
    ).toBe(true);
  });

  it("rechaza monto 0, decimal o concepto muy largo", () => {
    expect(expenseSchema.safeParse({ ...gastoBase, gas_monto: "0" }).success).toBe(false);
    expect(expenseSchema.safeParse({ ...gastoBase, gas_monto: "10.5" }).success).toBe(false);
    expect(
      expenseSchema.safeParse({ ...gastoBase, gas_concepto: "x".repeat(61) }).success
    ).toBe(false);
  });
});

describe("monthlyPaymentSchema", () => {
  const pago = {
    pag_monto: 50000,
    pag_fechapago: "2026-09-01T06:00:00.000Z",
    pag_metodopago: "SINPE Móvil",
    alqm_id: "12",
    pag_estado: "A",
  };

  it("acepta el payload que arma usePaymentForm", () => {
    const r = monthlyPaymentSchema.parse(pago) as Record<string, unknown>;
    expect(r.pag_monto).toBe(BigInt(50000));
    // El estado lo decide el servidor
    expect(r.pag_estado).toBeUndefined();
  });

  it("rechaza monto 0 y método vacío", () => {
    expect(monthlyPaymentSchema.safeParse({ ...pago, pag_monto: 0 }).success).toBe(false);
    expect(monthlyPaymentSchema.safeParse({ ...pago, pag_metodopago: "" }).success).toBe(false);
  });
});

describe("paymentCancelSchema", () => {
  it("la descripción es opcional y se guarda como texto vacío", () => {
    const r = paymentCancelSchema.parse({
      pag_id: "154",
      anp_motivo: "Error de registro",
      anp_fechaanulacion: new Date().toISOString(),
    });
    expect(r.anp_descripcion).toBe("");
  });
});

describe("rentUpdateSchema", () => {
  it("no permite cambiar la propiedad del alquiler", () => {
    const r = rentUpdateSchema.parse({
      alq_monto: "80000",
      alq_fechapago: "2026-01-01T06:00:00.000Z",
      alq_estado: "A",
      prop_id: "99",
      ava_clientexalquiler: [{ cli_id: "6" }],
    }) as Record<string, unknown>;
    expect(r.prop_id).toBeUndefined();
    expect(r.ava_clientexalquiler).toEqual([{ cli_id: BigInt(6) }]);
  });
});

describe("monthlyRentSaveAllSchema", () => {
  it("acepta las mensualidades que genera DateRangeCalculator", () => {
    const r = monthlyRentSaveAllSchema.parse({
      alqId: "4",
      rents: [
        {
          alqm_id: "Temp-0",
          alqm_identificador: "Mes 1",
          alqm_montototal: "80000",
          alqm_fechainicio: "2026-01-01T06:00:00.000Z",
          alqm_fechafin: "2026-02-01T06:00:00.000Z",
          alqm_fechapago: "",
          alqm_estado: "I",
          alqm_montopagado: "0",
          ava_pago: [],
        },
      ],
    });
    expect(r.rents[0].alqm_fechapago).toBeNull();
    expect((r.rents[0] as Record<string, unknown>).alqm_id).toBeUndefined();
  });
});

describe("cancelRentSchema", () => {
  it("acepta cancelar sin fecha de devolución", () => {
    const r = cancelRentSchema.parse({
      depo_montodevuelto: "0",
      depo_montocastigo: "0",
      depo_fechadevolucion: null,
      alqc_motivo: "Se fue antes",
      alqc_montodevuelto: "0",
      alqc_castigo: "0",
      alqc_fecha_cancelacion: "2026-10-01T06:00:00.000Z",
    });
    expect(r.depo_fechadevolucion).toBeNull();
  });
});

describe("propertyCreateSchema / clientSchema", () => {
  it("propiedad: tipo vacío se vuelve null y descarta prop_id", () => {
    const r = propertyCreateSchema.parse({
      prop_identificador: "DEP09",
      tipp_id: "",
      edi_id: "1",
      prop_id: "999",
    }) as Record<string, unknown>;
    expect(r.tipp_id).toBeNull();
    expect(r.prop_id).toBeUndefined();
  });

  it("cliente: correo vacío es null y correo inválido se rechaza", () => {
    const base = { cli_nombre: "Ana", cli_papellido: "Mora", cli_cedula: "1234" };
    expect(clientSchema.parse({ ...base, cli_correo: "" }).cli_correo).toBeNull();
    expect(clientSchema.safeParse({ ...base, cli_correo: "no-es-correo" }).success).toBe(false);
  });
});

describe("usuarios", () => {
  const user = {
    usu_nombre: "Ana",
    usu_papellido: "Mora",
    usu_cedula: "1234",
    usu_correo: "ANA@Correo.com",
    usu_estado: "A",
    usu_rol: "E",
  };

  it("crear exige contraseña de 8+ caracteres y normaliza el correo", () => {
    expect(userCreateSchema.safeParse({ ...user, usu_contrasena: "123" }).success).toBe(false);
    const r = userCreateSchema.parse({ ...user, usu_contrasena: "Clave-123" });
    expect(r.usu_correo).toBe("ana@correo.com");
  });

  it("editar permite omitir la contraseña", () => {
    expect(userUpdateSchema.parse({ ...user, usu_contrasena: "" }).usu_contrasena).toBeUndefined();
  });

  it("rechaza roles inexistentes", () => {
    expect(
      userCreateSchema.safeParse({ ...user, usu_rol: "X", usu_contrasena: "Clave-123" }).success
    ).toBe(false);
  });
});
