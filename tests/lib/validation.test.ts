/**
 * @jest-environment node
 */
import {
  zDate,
  zId,
  zMoney,
  zOptDate,
  zOptId,
  zOptText,
  zText,
} from "@/lib/validation";

describe("zId", () => {
  it("acepta string numérico, number y bigint y devuelve bigint", () => {
    expect(zId.parse("15")).toBe(BigInt(15));
    expect(zId.parse(15)).toBe(BigInt(15));
    expect(zId.parse(BigInt(15))).toBe(BigInt(15));
  });

  it("rechaza ids no numéricos, negativos o con decimales", () => {
    for (const v of ["abc", "1.5", "-3", "", 1.5, -1, null]) {
      expect(zId.safeParse(v).success).toBe(false);
    }
  });
});

describe("zOptId", () => {
  it('convierte "" y null en null', () => {
    expect(zOptId.parse("")).toBeNull();
    expect(zOptId.parse(null)).toBeNull();
    expect(zOptId.parse(undefined)).toBeUndefined();
    expect(zOptId.parse("7")).toBe(BigInt(7));
  });
});

describe("zMoney", () => {
  it("acepta enteros como string o number", () => {
    expect(zMoney.parse("15000")).toBe(BigInt(15000));
    expect(zMoney.parse(15000)).toBe(BigInt(15000));
    expect(zMoney.parse("0")).toBe(BigInt(0));
  });

  it('acepta "15000.00" (decimales en cero) como 15000', () => {
    expect(zMoney.parse("15000.00")).toBe(BigInt(15000));
  });

  it("rechaza decimales reales, negativos, vacío y texto", () => {
    for (const v of ["150.5", 150.5, "-1", -1, "", "abc", "1e400"]) {
      expect(zMoney.safeParse(v).success).toBe(false);
    }
  });
});

describe("zDate / zOptDate", () => {
  it("convierte ISO string a Date", () => {
    const d = zDate.parse("2026-09-01T06:00:00.000Z");
    expect(d).toBeInstanceOf(Date);
    expect(d.toISOString()).toBe("2026-09-01T06:00:00.000Z");
  });

  it("rechaza fechas inválidas o vacías", () => {
    expect(zDate.safeParse("no es fecha").success).toBe(false);
    expect(zDate.safeParse("").success).toBe(false);
  });

  it('zOptDate convierte "" en null', () => {
    expect(zOptDate.parse("")).toBeNull();
  });
});

describe("zText / zOptText", () => {
  it("recorta espacios y respeta el largo de la columna", () => {
    expect(zText(5).parse("  hola ")).toBe("hola");
    expect(zText(5).safeParse("demasiado").success).toBe(false);
    expect(zText(5).safeParse("   ").success).toBe(false);
  });

  it('zOptText convierte "" y espacios en null', () => {
    expect(zOptText(10).parse("")).toBeNull();
    expect(zOptText(10).parse("   ")).toBeNull();
    expect(zOptText(10).parse("ok")).toBe("ok");
    expect(zOptText(3).safeParse("largo").success).toBe(false);
  });
});
