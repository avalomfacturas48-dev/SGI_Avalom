# Plan de implementación — Clientes, Alquileres y Contrato de Departamentos

> Rama actual: `ui-and-workflows` · Stack: Next.js 15 App Router, Prisma (CockroachDB), Zod + react-hook-form, pdf-lib.

Este documento describe las **3 tareas** solicitadas, divididas en fases. Cada fase indica los archivos afectados y los criterios de aceptación.

## Decisiones tomadas

| Tema | Decisión |
|------|----------|
| Generación del PDF | **Regenerar texto fiel** con `pdf-lib`, reproduciendo las 3 páginas del contrato original verbatim, rellenando espacios o dejando `____` en blanco. |
| Arrendante | **Fijo en código** (constante): replica el encabezado legal completo de Fermín Ávila Mora / César Ávila Mora. |
| Punto de entrada | **Pantalla dedicada** lanzada desde "Modificar alquiler", pre-rellenada desde cliente/propiedad/edificio/alquiler. |
| Campos nuevos en BD | Todos **opcionales** (nullable). |

---

## Tarea 1 — Teléfono y correo opcionales en clientes

**Estado actual:** `cli_telefono` es `NOT NULL` y `cli_correo` es `NOT NULL` + `@unique`. El esquema Zod (`useClientForm.ts`) exige ambos con `.min(1)`.

### Fase 1.1 — Base de datos
- `prisma/schema.prisma` → `model ava_cliente`:
  - `cli_telefono String @db.String(15)` → `cli_telefono String? @db.String(15)`
  - `cli_correo String @unique(...) @db.String(50)` → `cli_correo String? @unique(...) @db.String(50)`
  - Mantener `@unique` en correo: CockroachDB/Postgres permite múltiples `NULL` en índices únicos. **Clave:** el formulario y la API deben enviar `null` (no `""`) cuando el campo esté vacío, para evitar colisión de cadenas vacías.
- Generar migración + `npx prisma generate`.

### Fase 1.2 — Validación y formulario
- `hooks/mantClient/useClientForm.ts`:
  - `cli_telefono`: quitar `.min(1)`, dejar `.max(15).optional()`.
  - `cli_correo`: `z.string().max(50).email().optional().or(z.literal(""))` o equivalente que acepte vacío y valide email solo si hay valor.
  - En `onSubmit`, normalizar `cli_telefono`/`cli_correo` vacíos a `null` antes de enviar.
- `components/mantClient/clienteFormProps.tsx`: ajustar labels de Teléfono/Correo para que no sugieran obligatoriedad (sin asterisco; opcionalmente añadir "(opcional)").

### Fase 1.3 — API y tipos
- `app/api/client/route.ts` (POST) y `app/api/client/[cliId]/route.ts` (PUT): normalizar `""` → `null` en teléfono/correo antes de `create`/`update`.
- `lib/types/entities.ts`: `cli_telefono?` y `cli_correo?` opcionales (verificar usos que asuman string no-nulo).
- Revisar `components/mantClient/importClients.tsx` y `app/api/import-clients/route.ts`: que la importación no falle si faltan teléfono/correo.

### Criterios de aceptación
- Crear/editar un cliente sin teléfono ni correo guarda correctamente.
- Si se ingresa correo, se valida formato y unicidad; si se deja vacío, no colisiona con otros vacíos.
- La importación masiva acepta filas sin teléfono/correo.

---

## Tarea 2 — Editar alquiler mensual y depósito con pagos asociados

**Estado actual:**
- **Depósito:** bloqueado en UI (`useDepositForm.isFormDisabled = Boolean(deposit?.ava_pago?.length)` + alerta en `depositForm.tsx`) **y** en API (`deposit/[depoId]` PUT devuelve 409 si hay pagos).
- **Alquiler mensual:** la API `monthlyrent/[alqmId]` (PUT) **ya permite** editar; el bloqueo está solo en UI (`MonthsBetween.tsx`: `hasPayments` desactiva el botón editar).

### Fase 2.1 — Depósito
- `app/api/deposit/[depoId]/route.ts`: eliminar el bloque que devuelve `409` cuando `deposit.ava_pago.length > 0`.
- `hooks/mantRent/useDepositForm.ts`: eliminar `isFormDisabled` (o reducirlo solo a `isLoading`).
- `components/mantRent/edit/depositForm.tsx`: cambiar la alerta de bloqueo por una **advertencia informativa** ("Este depósito tiene pagos asociados; al modificar el monto verifique la consistencia del saldo") y dejar los campos habilitados.

### Fase 2.2 — Alquiler mensual
- `components/mantRent/edit/MonthsBetween.tsx`: permitir editar aunque `hasPayments` sea `true`:
  - Quitar `disabled={hasPayments}` y `pointer-events-none opacity-40` del botón editar.
  - Mantener el indicador visual "Tiene pagos" como aviso, no como bloqueo.
  - **El botón Eliminar SIGUE bloqueado** con pagos (la API `DELETE` lo impide por integridad; no fue solicitado cambiarlo).
- `app/api/monthlyrent/[alqmId]/route.ts`: sin cambios (ya permite editar).

### Fase 2.3 — Consistencia de saldos (consideración)
- Editar `alqm_montototal` con pagos existentes puede dejar `alqm_montopagado`/estado inconsistentes. **No se bloquea** (es lo solicitado), pero:
  - Mostrar advertencia en el formulario al editar un alquiler/depósito con pagos.
  - Documentar que el ajuste de estado (`A/P/I/R`) queda a criterio del usuario.

### Criterios de aceptación
- Se puede abrir y guardar la edición de un alquiler mensual que tiene pagos.
- Se puede editar el monto total de un depósito que tiene pagos.
- Eliminar sigue bloqueado con pagos.

---

## Tarea 3 — Contrato de arrendamiento para departamentos (fiel al original)

**Estado actual:** existe `/api/generate-contract` + `useContractGenerator` + un modal (`contractDialog.tsx` en reportes y `generateContractModal.tsx` en edificios). El generador actual **parafrasea** las cláusulas y exige varios campos. El objetivo es reproducir el contrato **verbatim** y pre-rellenarlo automáticamente desde los datos existentes.

Referencia: `claudedocs/arrendamiento apartamento fermin 1.pdf` (3 páginas, cláusulas PRIMERA a DÉCIMA TERCERA).

### Fase 3.1 — Nuevos campos opcionales en BD
Todos nullable. Distribución por entidad:

**`ava_edificio` (la finca — datos compartidos del inmueble):**
- `edi_matricula String?` — matrícula Folio Real (cláusula PRIMERA)
- `edi_plano String?` — número de plano catastrado
- `edi_areafinca String?` — medida/área de la finca
- `edi_ubicacionfinca String?` — distrito, cantón, provincia
- `edi_linderos String?` — linderos (Norte/Sur/Este/Oeste)

**`ava_propiedad` (el apartamento):**
- `prop_descripcioncontrato String?` — "consta de sala, comedor, cocina, N habitaciones..." (cláusula SEGUNDA). *(`prop_descripcion` actual es `String(50)`, insuficiente; se añade campo nuevo más amplio.)*

**`ava_alquiler` (el contrato/alquiler):**
- `alq_diapago Int?` — día de pago mensual (cláusula TERCERA)
- `alq_fechaprimerpago DateTime?` — fecha del primer pago
- `alq_nucleofamiliar Int?` — número de miembros del núcleo familiar (cláusula QUINTA)
- `alq_fechafirma DateTime?` — fecha de firma (cierre)
- `alq_fechainicio DateTime?` / `alq_fechafin DateTime?` — plazo del contrato (cláusula CUARTA). *(Pueden derivarse de los alquileres mensuales si no se capturan.)*

> El depósito de garantía (cláusula DÉCIMA PRIMERA) ya existe en `ava_deposito.depo_total`. El monto del alquiler en `ava_alquiler.alq_monto`. Los datos del arrendatario en `ava_cliente`.

- Generar migración + `npx prisma generate` + actualizar `lib/types/entities.ts`.

### Fase 3.2 — Reescritura del generador PDF (fiel al original)
- `app/api/generate-contract/route.ts`:
  - Definir el **arrendante como constante fija** replicando el encabezado legal completo del contrato original (Fermín Ávila Mora / César Ávila Mora, personería, etc.).
  - Reproducir **verbatim** el cuerpo y todas las cláusulas (PRIMERA a DÉCIMA TERCERA) más el bloque de firmas.
  - Sustituir cada espacio por el valor recibido **o** por una línea en blanco (`____________`) cuando el dato no exista (nada obligatorio).
  - Mantener la justificación/paginación A4 existente; verificar que el resultado ocupe ~3 páginas como el original.
  - Quitar las validaciones de campos obligatorios (`diaPrimerPago`, `numeroMiembros`, `depositoGarantia`): ahora todo es opcional.
- Actualizar la interfaz `ContractData` (en route + hook) para reflejar campos opcionales y los nuevos.

### Fase 3.3 — Pantalla dedicada de generación + pre-llenado
- Nueva ruta, p.ej. `app/mantRent/[alqId]/contrato/page.tsx` (o `app/newRent/...` según convención), envuelta en `<AuthRoute>`.
- Reutilizar el endpoint `GET /api/modifiyrent/[alqId]` (ya incluye `ava_cliente`, `ava_propiedad`, `ava_edificio`, `ava_deposito`, `ava_alquilermensual`) para **pre-rellenar**:
  - Arrendatario: nombre completo + cédula + estado civil + dirección (de `ava_cliente`).
  - Apartamento: `prop_identificador` y `prop_descripcioncontrato`.
  - Finca: campos `edi_*` del edificio.
  - Montos/fechas: `alq_monto`, `alq_diapago`, plazo, depósito (`depo_total`).
- Formulario editable sobre los valores pre-cargados (el usuario puede completar lo que falte antes de generar).
- Botón "Generar contrato" → `POST /api/generate-contract` → descarga del PDF.
- Enlace de acceso desde `components/mantRent/edit/bodyEditRent.tsx` (botón en la cabecera o en `ContractCard`).
- Migrar/retirar el modal previo (`contractDialog.tsx`, `generateContractModal.tsx`) o dejarlo apuntando a la nueva lógica para evitar duplicación. Actualizar `hooks/reports/useContractGenerator.ts`.

### Criterios de aceptación
- Al abrir la pantalla de contrato desde un alquiler, los campos disponibles aparecen pre-rellenados.
- El PDF generado reproduce el contrato original (encabezado fijo + cláusulas exactas).
- Los datos faltantes aparecen como líneas en blanco; ningún campo es obligatorio.
- Se pueden guardar los nuevos campos opcionales (finca/apartamento/alquiler) y se reflejan en el PDF.

---

## Orden de ejecución sugerido
1. **Tarea 1** (cambios pequeños y aislados: BD + validación cliente).
2. **Tarea 2** (quitar restricciones de edición; bajo riesgo).
3. **Tarea 3** (mayor alcance: BD + generador + pantalla dedicada).

## Notas / riesgos
- Cada cambio de `schema.prisma` requiere migración y `prisma generate`; las 3 tareas tocan BD (clientes, edificio/propiedad/alquiler).
- Verificar que `stringifyWithBigInt` y los tipos manejen los nuevos campos `Int?`/`DateTime?`.
- Editar montos con pagos existentes puede descuadrar saldos: es intencional por requerimiento; se mitiga con advertencias en UI.
- Revisar tests bajo `tests/mantClient` y `tests/mantRent` que asuman teléfono/correo obligatorios o el bloqueo de edición con pagos.
