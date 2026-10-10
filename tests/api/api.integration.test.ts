/**
 * @jest-environment node
 *
 * Pruebas de integración de la API contra un servidor corriendo (next dev o
 * next start) y la BD de su .env. ESCRIBEN EN LA BD: crean datos con prefijo
 * ZZTEST y los borran al final. Solo corren con `npm run test:api`, que exige
 * ALLOW_DB_WRITE_TESTS=1. Nunca correr apuntando a producción.
 */
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const BASE = process.env.API_TEST_URL || "http://localhost:3000";
const ENABLED = process.env.ALLOW_DB_WRITE_TESTS === "1";
const describeApi = ENABLED ? describe : describe.skip;

jest.setTimeout(120_000);

const db = new PrismaClient();
const PASSWORD = "Clave-ZZ-123";
const TAG = `ZZTEST${Date.now().toString().slice(-6)}`;

type Session = { cookie: string; userId: string };
const sessions: Record<string, Session> = {};

async function api(
  method: string,
  path: string,
  { session, body }: { session?: Session; body?: unknown } = {}
) {
  const res = await fetch(BASE + path, {
    method,
    redirect: "manual",
    headers: {
      "Content-Type": "application/json",
      ...(session ? { Cookie: session.cookie } : {}),
    },
    body: body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body),
  });
  let json: any = null;
  try {
    json = await res.json();
  } catch {}
  return { status: res.status, json, headers: res.headers };
}

async function login(email: string): Promise<Session> {
  const r = await api("POST", "/api/login", { body: { email, password: PASSWORD } });
  expect(r.status).toBe(200);
  const setCookie = r.headers.get("set-cookie") || "";
  return { cookie: setCookie.split(";")[0], userId: r.json.user.usu_id };
}

// Ids creados para limpiar al final
const created = {
  users: [] as bigint[],
  clients: [] as bigint[],
  buildings: [] as bigint[],
  properties: [] as bigint[],
  rents: [] as bigint[],
  expenses: [] as bigint[],
};

// Datos de prueba compartidos
let rentId = "";
let monthlyIds: string[] = [];
let depositId = "";
let propertyId = "";

describeApi("API (integración)", () => {
  beforeAll(async () => {
    const hash = bcrypt.hashSync(PASSWORD, 10);
    for (const rol of ["J", "A", "E", "R"]) {
      const u = await db.ava_usuario.create({
        data: {
          usu_nombre: "ZZ",
          usu_papellido: `${TAG}${rol}`,
          usu_cedula: `${TAG}${rol}`.slice(-15),
          usu_correo: `${TAG.toLowerCase()}${rol.toLowerCase()}@prueba.local`,
          usu_contrasena: hash,
          usu_estado: "A",
          usu_rol: rol,
        },
      });
      created.users.push(u.usu_id);
      sessions[rol] = await login(u.usu_correo);
    }

    // Edificio → propiedad → alquiler → mensualidades → depósito (por la API)
    const J = sessions.J;
    const edi = await api("POST", "/api/building", {
      session: J,
      body: { edi_identificador: TAG.slice(-15), edi_descripcion: "Edificio de pruebas" },
    });
    expect(edi.status).toBe(201);
    created.buildings.push(BigInt(edi.json.data.edi_id));

    const tipo = await db.ava_tipopropiedad.findFirst();
    const prop = await api("POST", "/api/property", {
      session: J,
      body: {
        prop_identificador: "ZZ-P1",
        prop_descripcion: "Propiedad de pruebas",
        tipp_id: tipo?.tipp_id.toString() ?? "",
        edi_id: edi.json.data.edi_id,
      },
    });
    expect(prop.status).toBe(201);
    propertyId = prop.json.data.prop_id;
    created.properties.push(BigInt(propertyId));

    const rent = await api("POST", "/api/rent", {
      session: J,
      body: {
        alq_monto: 50000,
        alq_fechapago: "2026-01-01T06:00:00.000Z",
        alq_estado: "A",
        prop_id: propertyId,
      },
    });
    expect(rent.status).toBe(201);
    rentId = rent.json.data.alq_id;
    created.rents.push(BigInt(rentId));

    const saved = await api("POST", "/api/monthlyrent/saveall", {
      session: J,
      body: {
        alqId: rentId,
        rents: [1, 2].map((n) => ({
          alqm_identificador: `Mes ${n}`,
          alqm_montototal: "50000",
          alqm_montopagado: "999", // el servidor debe ignorarlo
          alqm_fechainicio: `2026-0${n}-01T06:00:00.000Z`,
          alqm_fechafin: `2026-0${n + 1}-01T06:00:00.000Z`,
          alqm_fechapago: "",
          alqm_estado: "I",
        })),
      },
    });
    expect(saved.status).toBe(201);
    monthlyIds = saved.json.data.map((m: any) => m.alqm_id);

    const depo = await api("POST", "/api/deposit", {
      session: J,
      body: { alq_id: rentId, depo_total: "50000" },
    });
    expect(depo.status).toBe(201);
    depositId = depo.json.data.depo_id;
  });

  afterAll(async () => {
    const rentIds = created.rents;
    const pagos = await db.ava_pago.findMany({
      where: {
        OR: [
          { ava_alquilermensual: { alq_id: { in: rentIds } } },
          { ava_deposito: { alq_id: { in: rentIds } } },
        ],
      },
      select: { pag_id: true },
    });
    const pagIds = pagos.map((p) => p.pag_id);
    await db.ava_anulacionpago.deleteMany({ where: { pag_id: { in: pagIds } } });
    await db.ava_pago.deleteMany({ where: { pag_id: { in: pagIds } } });
    await db.ava_alquilermensual.deleteMany({ where: { alq_id: { in: rentIds } } });
    await db.ava_deposito.deleteMany({ where: { alq_id: { in: rentIds } } });
    await db.ava_clientexalquiler.deleteMany({ where: { alq_id: { in: rentIds } } });
    await db.ava_alquilercancelado.deleteMany({ where: { alq_id: { in: rentIds } } });
    await db.ava_alquiler.deleteMany({ where: { alq_id: { in: rentIds } } });
    await db.ava_propiedad.deleteMany({ where: { prop_id: { in: created.properties } } });
    // Los gastos referencian al edificio: van antes
    await db.ava_anulaciongasto.deleteMany({ where: { gas_id: { in: created.expenses } } });
    await db.ava_gasto.deleteMany({ where: { gas_id: { in: created.expenses } } });
    await db.ava_edificio.deleteMany({ where: { edi_id: { in: created.buildings } } });
    await db.ava_cliente.deleteMany({ where: { cli_id: { in: created.clients } } });
    await db.ava_usuario.deleteMany({
      where: { usu_correo: { startsWith: TAG.toLowerCase(), endsWith: "@prueba.local" } },
    });
    await db.$disconnect();
  });

  // ------------------------------------------------------------
  describe("autenticación", () => {
    it.each([
      ["GET", "/api/expenses"],
      ["GET", "/api/users"],
      ["GET", "/api/export-clients"],
      ["GET", "/api/export-users"],
      ["GET", "/api/users/listUsers"],
      ["POST", "/api/import-clients"],
      ["POST", "/api/generate-contract"],
      ["GET", "/api/me"],
    ])("%s %s sin sesión → 401", async (method, path) => {
      const r = await api(method, path, { body: method === "POST" ? {} : undefined });
      expect(r.status).toBe(401);
    });

    it("las páginas sin sesión redirigen al login", async () => {
      const r = await api("GET", "/expenses");
      expect(r.status).toBe(307);
      expect(r.headers.get("location")).toMatch(/\/$/);
    });

    it("login: credenciales malas → 401 con mensaje genérico", async () => {
      const r = await api("POST", "/api/login", {
        body: { email: `${TAG.toLowerCase()}j@prueba.local`, password: "mala" },
      });
      expect(r.status).toBe(401);
      expect(r.json.error).toBe("Email o contraseña invalidos");
    });

    it("login: cookie httpOnly, sin token ni hash en la respuesta", async () => {
      const r = await api("POST", "/api/login", {
        body: { email: `${TAG.toLowerCase()}e@prueba.local`, password: PASSWORD },
      });
      expect(r.status).toBe(200);
      expect(r.json.token).toBeUndefined();
      expect(r.json.user.usu_contrasena).toBeUndefined();
      expect(r.headers.get("set-cookie")).toMatch(/HttpOnly/i);
    });

    it("/api/me devuelve el usuario de la sesión sin contraseña", async () => {
      const r = await api("GET", "/api/me", { session: sessions.E });
      expect(r.status).toBe(200);
      expect(r.json.data.usu_rol).toBe("E");
      expect(r.json.data.usu_contrasena).toBeUndefined();
    });

    it("logout borra la cookie", async () => {
      const r = await api("POST", "/api/logout");
      expect(r.headers.get("set-cookie")).toMatch(/token=;.*Max-Age=0/i);
    });

    it("ninguna respuesta incluye hashes de contraseña", async () => {
      const users = await api("GET", "/api/users", { session: sessions.J });
      expect(users.json.data.some((u: any) => "usu_contrasena" in u)).toBe(false);
      const exp = await api("GET", "/api/expenses?limit=50", { session: sessions.J });
      expect(
        exp.json.data.some((e: any) => e.ava_usuario && "usu_contrasena" in e.ava_usuario)
      ).toBe(false);
    });
  });

  // ------------------------------------------------------------
  describe("roles", () => {
    it("Auditor puede leer pero no escribir", async () => {
      expect((await api("GET", "/api/expenses", { session: sessions.R })).status).toBe(200);
      expect(
        (await api("POST", "/api/expenses", { session: sessions.R, body: {} })).status
      ).toBe(403);
    });

    const nuevoUsuario = (rol: string, n: string) => ({
      usu_nombre: "ZZ",
      usu_papellido: "Nuevo",
      usu_cedula: `${TAG}${n}`.slice(-15),
      usu_correo: `${TAG.toLowerCase()}${n}@prueba.local`,
      usu_contrasena: PASSWORD,
      usu_estado: "A",
      usu_rol: rol,
    });

    it("Empleado no puede crear un Admin", async () => {
      const r = await api("POST", "/api/users", {
        session: sessions.E,
        body: nuevoUsuario("A", "x1"),
      });
      expect(r.status).toBe(403);
    });

    it("Admin no puede editar a un Jefe", async () => {
      const r = await api("PUT", `/api/users/${sessions.J.userId}`, {
        session: sessions.A,
        body: { ...nuevoUsuario("J", "x2"), usu_contrasena: "" },
      });
      expect(r.status).toBe(403);
    });

    it("nadie puede cambiarse su propio rol ni borrarse", async () => {
      const me = await api("GET", "/api/me", { session: sessions.J });
      const put = await api("PUT", `/api/users/${sessions.J.userId}`, {
        session: sessions.J,
        body: { ...me.json.data, usu_rol: "E", usu_contrasena: "" },
      });
      expect(put.status).toBe(400);
      const del = await api("DELETE", `/api/users/${sessions.J.userId}`, { session: sessions.J });
      expect(del.status).toBe(400);
    });

    it("Jefe sí puede crear un Empleado (y la contraseña corta se rechaza)", async () => {
      const corta = await api("POST", "/api/users", {
        session: sessions.J,
        body: { ...nuevoUsuario("E", "x3"), usu_contrasena: "123" },
      });
      expect(corta.status).toBe(400);
      const ok = await api("POST", "/api/users", {
        session: sessions.J,
        body: nuevoUsuario("E", "x4"),
      });
      expect(ok.status).toBe(200);
      expect(ok.json.data.usu_contrasena).toBeUndefined();
    });
  });

  // ------------------------------------------------------------
  describe("gastos", () => {
    const gasto = {
      gas_tipo: "M",
      gas_concepto: `${TAG} pintura`,
      gas_monto: "12345",
      gas_fecha: "2026-09-15T06:00:00.000Z",
      edi_id: "",
    };
    let gastoId = "";

    beforeAll(() => {
      gasto.edi_id = created.buildings[0].toString();
    });

    it("crea con el usuario de la sesión e ignora campos no permitidos", async () => {
      const r = await api("POST", "/api/expenses", {
        session: sessions.E,
        body: { ...gasto, usu_id: "1", gas_estado: "D" },
      });
      expect(r.status).toBe(201);
      gastoId = r.json.data.gas_id;
      created.expenses.push(BigInt(gastoId));
      expect(r.json.data.usu_id).toBe(sessions.E.userId);
      expect(r.json.data.gas_estado).toBe("A");
    });

    it("rechaza montos con decimales, JSON inválido y servicio faltante", async () => {
      const dec = await api("POST", "/api/expenses", {
        session: sessions.E,
        body: { ...gasto, gas_monto: "10.5" },
      });
      expect(dec.status).toBe(400);
      const bad = await api("POST", "/api/expenses", { session: sessions.E, body: "{nope" });
      expect(bad.status).toBe(400);
      const serv = await api("POST", "/api/expenses", {
        session: sessions.E,
        body: { ...gasto, gas_tipo: "S" },
      });
      expect(serv.status).toBe(400);
    });

    it("detecta posibles duplicados y excluye el propio gasto al editar", async () => {
      const q = new URLSearchParams({
        gas_tipo: "M",
        edi_id: gasto.edi_id,
        gas_concepto: gasto.gas_concepto,
        gas_monto: gasto.gas_monto,
        gas_fecha: gasto.gas_fecha,
      });
      const dup = await api("GET", `/api/expenses/duplicates?${q}`, { session: sessions.E });
      expect(dup.json.data.map((g: any) => g.gas_id)).toContain(gastoId);
      q.set("exclude_id", gastoId);
      const self = await api("GET", `/api/expenses/duplicates?${q}`, { session: sessions.E });
      expect(self.json.data.map((g: any) => g.gas_id)).not.toContain(gastoId);
    });

    it("editar no cambia quién lo registró y no se puede borrar físicamente", async () => {
      const r = await api("PUT", `/api/expenses/${gastoId}`, {
        session: sessions.J,
        body: { ...gasto, gas_monto: "500" },
      });
      expect(r.status).toBe(200);
      expect(r.json.data.usu_id).toBe(sessions.E.userId);
      expect((await api("DELETE", `/api/expenses/${gastoId}`, { session: sessions.J })).status).toBe(405);
    });

    it("anular dos veces el mismo gasto se rechaza", async () => {
      const a1 = await api("POST", `/api/expenses/cancel/${gastoId}`, {
        session: sessions.J,
        body: { ang_motivo: "Gasto duplicado" },
      });
      expect(a1.status).toBe(200);
      const a2 = await api("POST", `/api/expenses/cancel/${gastoId}`, {
        session: sessions.J,
        body: { ang_motivo: "Gasto duplicado" },
      });
      expect(a2.status).toBe(400);
    });

    it("la paginación no repite ni pierde gastos", async () => {
      const first = await api("GET", "/api/expenses?page=1&limit=25", { session: sessions.J });
      const { totalPages, total } = first.json.pagination;
      const seen = new Map<string, number>();
      for (let p = 1; p <= totalPages; p++) {
        const r =
          p === 1
            ? first
            : await api("GET", `/api/expenses?page=${p}&limit=25`, { session: sessions.J });
        for (const e of r.json.data) seen.set(e.gas_id, (seen.get(e.gas_id) ?? 0) + 1);
      }
      expect(seen.size).toBe(total);
      expect([...seen.values()].every((n) => n === 1)).toBe(true);
    });
  });

  // ------------------------------------------------------------
  describe("alquileres, mensualidades y pagos", () => {
    it("saveall ignora el monto pagado enviado por el cliente", async () => {
      const m = await db.ava_alquilermensual.findUnique({
        where: { alqm_id: BigInt(monthlyIds[0]) },
      });
      expect(m?.alqm_montopagado).toBe(BigInt(0));
    });

    it("no permite pagar más que el saldo pendiente", async () => {
      const r = await api("POST", "/api/accounting/payment", {
        session: sessions.E,
        body: {
          alqm_id: monthlyIds[0],
          pag_monto: 50001,
          pag_fechapago: new Date().toISOString(),
          pag_metodopago: "SINPE Móvil",
        },
      });
      expect(r.status).toBe(400);
      expect(r.json.error).toMatch(/saldo pendiente/);
    });

    let pagoId = "";
    it("un pago completo deja la mensualidad como pagada", async () => {
      const r = await api("POST", "/api/accounting/payment", {
        session: sessions.E,
        body: {
          alqm_id: monthlyIds[0],
          pag_monto: 50000,
          pag_fechapago: new Date().toISOString(),
          pag_metodopago: "SINPE Móvil",
          pag_estado: "D", // el servidor debe ignorarlo
        },
      });
      expect(r.status).toBe(201);
      pagoId = r.json.data.payment.pag_id;
      expect(r.json.data.payment.pag_estado).toBe("A");
      expect(r.json.data.updatedMonthlyRent.alqm_estado).toBe("P");
    });

    it("anular un pago lo registra a nombre de la sesión y no se puede repetir", async () => {
      const body = {
        pag_id: pagoId,
        anp_motivo: "Error de registro",
        anp_fechaanulacion: new Date().toISOString(),
        usu_id: "1", // el servidor debe ignorarlo
      };
      const a1 = await api("POST", "/api/accounting/canceledpayment", { session: sessions.E, body });
      expect(a1.status).toBe(201);
      expect(a1.json.data.anulacionPago.usu_id).toBe(sessions.E.userId);
      expect(a1.json.data.anulacionPago.anp_montooriginal).toBe("50000");
      expect(a1.json.data.anulacionPago.anp_montofinal).toBe("0");
      const a2 = await api("POST", "/api/accounting/canceledpayment", { session: sessions.E, body });
      expect(a2.status).toBe(400);
    });

    it("no se puede marcar como pagada una mensualidad con saldo pendiente", async () => {
      const r = await api("PUT", `/api/monthlyrent/${monthlyIds[1]}`, {
        session: sessions.E,
        body: {
          alqm_identificador: "Mes 2",
          alqm_montototal: "50000",
          alqm_montopagado: "50000",
          alqm_fechainicio: "2026-02-01T06:00:00.000Z",
          alqm_fechafin: "2026-03-01T06:00:00.000Z",
          alqm_estado: "P",
        },
      });
      expect(r.status).toBe(400);
    });

    it("un mes regalado no acepta pagos", async () => {
      const g = await api("PUT", `/api/accounting/payment/gift/${monthlyIds[1]}`, {
        session: sessions.E,
        body: { isGifted: true },
      });
      expect(g.status).toBe(200);
      const p = await api("POST", "/api/accounting/payment", {
        session: sessions.E,
        body: {
          alqm_id: monthlyIds[1],
          pag_monto: 100,
          pag_fechapago: new Date().toISOString(),
          pag_metodopago: "SINPE Móvil",
        },
      });
      expect(p.status).toBe(400);
    });

    it("el total del depósito no puede quedar por debajo de lo pagado", async () => {
      const pago = await api("POST", "/api/accounting/deposit/payment", {
        session: sessions.E,
        body: {
          depo_id: depositId,
          pag_monto: 30000,
          pag_fechapago: new Date().toISOString(),
          pag_metodopago: "Transferencia",
        },
      });
      expect(pago.status).toBe(201);
      const r = await api("PUT", `/api/deposit/${depositId}`, {
        session: sessions.E,
        body: { depo_total: "1000" },
      });
      expect(r.status).toBe(400);
    });

    it("editar el alquiler con inquilinos devuelve la forma completa", async () => {
      const cli = await api("POST", "/api/client", {
        session: sessions.E,
        body: {
          cli_nombre: "ZZ",
          cli_papellido: "Inquilino",
          cli_cedula: `${TAG}C`.slice(-15),
          cli_correo: "",
        },
      });
      expect(cli.status).toBe(201);
      created.clients.push(BigInt(cli.json.data.cli_id));

      const r = await api("PUT", `/api/rent/${rentId}`, {
        session: sessions.E,
        body: {
          alq_monto: "50000",
          alq_fechapago: "2026-01-01T06:00:00.000Z",
          alq_estado: "A",
          prop_id: "1", // el servidor debe ignorarlo
          ava_clientexalquiler: [
            { cli_id: cli.json.data.cli_id },
            { cli_id: cli.json.data.cli_id }, // repetido
          ],
        },
      });
      expect(r.status).toBe(200);
      expect(r.json.data.prop_id).toBe(propertyId);
      expect(r.json.data.ava_propiedad.ava_tipopropiedad).toBeTruthy();
      expect(r.json.data.ava_alquilermensual).toHaveLength(2);
      expect(r.json.data.ava_clientexalquiler).toHaveLength(1);
    });

    it("editar la propiedad devuelve tipo, edificio y alquileres", async () => {
      const r = await api("PUT", `/api/property/${propertyId}`, {
        session: sessions.E,
        body: { prop_identificador: "ZZ-P1", prop_descripcion: "Editada", tipp_id: "" },
      });
      expect(r.status).toBe(200);
      expect(r.json.data.ava_edificio).toBeTruthy();
      expect(Array.isArray(r.json.data.ava_alquiler)).toBe(true);
    });

    it("no se puede finalizar con pagos pendientes, y cancelar funciona una sola vez", async () => {
      const fin = await api("PUT", `/api/accounting/finishedrent/${rentId}`, {
        session: sessions.E,
        body: { depo_montodevuelto: "0", depo_montocastigo: "0" },
      });
      expect(fin.status).toBe(400);

      const cancelar = {
        depo_montodevuelto: "0",
        depo_montocastigo: "0",
        depo_fechadevolucion: null,
        alqc_motivo: "Prueba",
        alqc_montodevuelto: "0",
        alqc_castigo: "0",
        alqc_fecha_cancelacion: new Date().toISOString(),
      };
      const c1 = await api("PUT", `/api/accounting/canceledrent/${rentId}`, {
        session: sessions.E,
        body: cancelar,
      });
      expect(c1.status).toBe(200);
      const c2 = await api("PUT", `/api/accounting/canceledrent/${rentId}`, {
        session: sessions.E,
        body: cancelar,
      });
      expect(c2.status).toBe(400);
    });

    it("endpoints que permitían alterar la contabilidad ya no existen", async () => {
      for (const path of [
        "/api/accounting/payment/1",
        "/api/accounting/monthlyrent/1",
        "/api/accounting/canceledpayment/1",
      ]) {
        expect((await api("PUT", path, { session: sessions.J, body: {} })).status).toBe(405);
      }
      expect((await api("POST", "/api/import-users", { session: sessions.J, body: {} })).status).toBe(404);
    });
  });
});
