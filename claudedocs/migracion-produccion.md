# Migración de la base de datos de PRODUCCIÓN

> Guía para aplicar a la BD de producción los cambios de las Tareas 1–3.
> La BD de **test** (AvalomD) ya tiene todo aplicado; esto es solo para producción.

## Qué se va a aplicar

| Migración | Cambios | Riesgo |
|---|---|---|
| `0_init` | Baseline (esquema completo ya existente) | Ninguno — solo se **marca** como aplicada, no se ejecuta |
| `20260618002932_cliente_telefono_correo_opcionales` | `cli_telefono` y `cli_correo` → `NULL` (quita `NOT NULL`) | Bajo — aditivo, retrocompatible |
| `20260618005820_contrato_campos_opcionales` | 12 columnas nuevas opcionales (`ava_edificio`, `ava_propiedad`, `ava_alquiler`) | Bajo — solo `ADD COLUMN ... NULL` |
| `20260618010000_contrato_limpieza_campos` | Elimina 10 de esas columnas que quedaron sin uso (5 de finca + `alq_nucleofamiliar` + 4 de fecha/día derivables) | Bajo — `DROP COLUMN` sobre columnas vacías |

> **Resultado neto en producción** tras aplicar las 4: `cli_telefono`/`cli_correo` pasan a opcionales, y de las columnas nuevas solo quedan **`ava_propiedad.prop_descripcioncontrato`** y **`ava_alquiler.alq_fechafirma`** (las demás se agregan y se vuelven a quitar en la misma corrida de `migrate deploy`, sin pérdida de datos porque están vacías).

**Todos los cambios son aditivos y retrocompatibles:** el código viejo sigue funcionando con el esquema nuevo y los datos existentes no se tocan. No hay borrado de columnas, ni `NOT NULL`, ni defaults, ni migración de datos.

## Antes de empezar (checklist)

- [ ] **Backup / snapshot** de la BD de producción (CockroachDB Cloud → *Backups*). Imprescindible.
- [ ] Tener a mano el `DATABASE_URL` de **producción** (NO el de test).
- [ ] Repo en el commit que incluye la carpeta `prisma/migrations/` con las 3 migraciones.
- [ ] `npx prisma generate` ya corrido localmente (o se corre en el build de deploy).

## Pasos

> ⚠️ Asegúrate de que `DATABASE_URL` apunta a **producción** antes de cada comando.
> Recomendado: exportarlo explícito en la terminal del deploy en lugar de depender del `.env`.

```bash
# (opcional) fijar la URL de producción solo para esta sesión
export DATABASE_URL="<connection-string-de-produccion>"

# 1) Confirmar a qué BD apunta y el estado actual
npx prisma migrate status
#    Debe mostrar el cluster/clase de PRODUCCIÓN y las 3 migraciones como "not yet applied".

# 2) Registrar el baseline (SOLO la primera vez en esta BD).
#    Marca 0_init como aplicada SIN ejecutarla, porque las tablas ya existen.
npx prisma migrate resolve --applied 0_init

# 3) Aplicar las migraciones pendientes (Tarea 1 y Tarea 3)
npx prisma migrate deploy
#    Equivale a: npm run db:deploy

# 4) Verificar
npx prisma migrate status
#    Debe decir: "Database schema is up to date!"
```

## Orden de despliegue recomendado

Como los cambios son retrocompatibles, el orden seguro es:

1. **Migrar la BD de producción** (pasos de arriba).
2. **Desplegar el código nuevo** (que ya espera las columnas/nullabilidad nuevas).

Hacerlo en este orden evita que el código nuevo consulte columnas que aún no existen.

## Si algo sale mal

- `migrate deploy` aplica cada `migration.sql` dentro de su propia transacción; si una falla, se detiene y reporta el archivo.
- Los cambios son aditivos, así que un fallo parcial no corrompe datos. Revisar el error, corregir y volver a `migrate deploy` (reaplica solo lo pendiente).
- Reversión manual (si fuera necesario revertir el esquema, los datos no se pierden):
  ```sql
  -- Tarea 3 (quitar las 2 columnas nuevas que quedan en el estado neto)
  ALTER TABLE "ava_propiedad" DROP COLUMN "prop_descripcioncontrato";
  ALTER TABLE "ava_alquiler"  DROP COLUMN "alq_fechafirma";
  -- Tarea 1 (volver a NOT NULL) — solo si no hay filas con NULL en esas columnas
  ALTER TABLE "ava_cliente" ALTER COLUMN "cli_telefono" SET NOT NULL;
  ALTER TABLE "ava_cliente" ALTER COLUMN "cli_correo"  SET NOT NULL;
  ```
  (La reversión es opcional; lo normal es dejar las columnas, son inofensivas.)

## Para futuras migraciones

Una vez registrado el baseline, cada cambio nuevo es simplemente:
`editar schema.prisma` → generar `migration.sql` (ver `plan-clientes-alquileres-contrato.md` › *Estrategia de migración*) → commit → `npm run db:deploy` en cada entorno.
