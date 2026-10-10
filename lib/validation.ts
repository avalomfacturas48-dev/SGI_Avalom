import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// ============================================
// Primitivos para validar bodies de la API
// Devuelven los tipos que espera Prisma (bigint, Date) y descartan los campos
// que no estén en el esquema, así ningún `...body` llega crudo a la BD.
// ============================================

const emptyToNull = (v: unknown) =>
  v === "" || (typeof v === "string" && v.trim() === "") ? null : v;

/** Id numérico (string, number o bigint) → bigint */
export const zId = z
  .union([z.string().trim().regex(/^\d+$/), z.number().int().nonnegative(), z.bigint()], {
    errorMap: () => ({ message: "Identificador inválido" }),
  })
  .transform((v) => BigInt(v));

/** Id opcional: "" o null → null */
export const zOptId = z.preprocess(emptyToNull, zId.nullish());

/** Monto en colones, entero ≥ 0 (acepta "15000" o "15000.00") → bigint */
export const zMoney = z
  .union([z.string().trim(), z.number(), z.bigint()])
  .transform((v, ctx) => {
    if (typeof v === "bigint") return v;
    const n = typeof v === "number" ? v : Number(v);
    if (v === "" || !Number.isFinite(n) || n < 0 || !Number.isInteger(n)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El monto debe ser un número entero mayor o igual a 0",
      });
      return z.NEVER;
    }
    return BigInt(n);
  });

export const zOptMoney = z.preprocess(emptyToNull, zMoney.nullish());

/** Fecha (ISO string o Date) → Date */
export const zDate = z
  .union([z.string().min(1, "Fecha requerida"), z.date()], {
    errorMap: () => ({ message: "Fecha requerida" }),
  })
  // Se valida dentro del transform: un .refine posterior también corre cuando
  // la unión falla y recibiría el texto sin convertir.
  .transform((v, ctx) => {
    const d = v instanceof Date ? v : new Date(v);
    if (Number.isNaN(d.getTime())) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Fecha inválida" });
      return z.NEVER;
    }
    return d;
  });

export const zOptDate = z.preprocess(emptyToNull, zDate.nullish());

/** Texto requerido con largo máximo de la columna */
export const zText = (max: number, label = "El campo") =>
  z
    .string({ required_error: `${label} es requerido` })
    .trim()
    .min(1, `${label} es requerido`)
    .max(max, `${label} no puede exceder ${max} caracteres`);

/** Texto opcional: "" → null */
export const zOptText = (max: number, label = "El campo") =>
  z.preprocess(
    emptyToNull,
    z.string().trim().max(max, `${label} no puede exceder ${max} caracteres`).nullish()
  );

/** Un carácter dentro de un conjunto de estados válidos */
export const zEnum = <T extends [string, ...string[]]>(values: T, label = "Estado") =>
  z.enum(values, { errorMap: () => ({ message: `${label} inválido` }) });

/**
 * Lee y valida el body. Si no cumple el esquema devuelve la respuesta 400 lista
 * para retornar desde el handler.
 */
export async function parseBody<S extends z.ZodTypeAny>(
  req: NextRequest,
  schema: S
): Promise<
  | { success: true; data: z.output<S> }
  | { success: false; response: NextResponse }
> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return {
      success: false,
      response: NextResponse.json(
        { success: false, error: "El cuerpo de la solicitud no es JSON válido" },
        { status: 400 }
      ),
    };
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    const issue = result.error.issues[0];
    const field = issue?.path.join(".");
    return {
      success: false,
      response: NextResponse.json(
        {
          success: false,
          error: issue?.message ?? "Datos inválidos",
          ...(field ? { field } : {}),
        },
        { status: 400 }
      ),
    };
  }

  return { success: true, data: result.data };
}
