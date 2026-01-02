/* =========================================================
   0) (Opcional) Verificar rápido si hay data antes de borrar
   =========================================================
-- SELECT COUNT(*) FROM AVA_PAGOSERVICIO;
-- SELECT COUNT(*) FROM AVA_SERVICIO;
*/


/* =========================================================
   1) Eliminar FKs e índices relacionados al módulo viejo
   ========================================================= */

-- FK AVA_SERVICIO_X_AVA_PAGOSERVICIO (si existe)
ALTER TABLE IF EXISTS AVA_PAGOSERVICIO
  DROP CONSTRAINT IF EXISTS AVA_SERVICIO_X_AVA_PAGOSERVICIO;

-- FK AVA_PROPIEDAD_X_AVA_PAGOSERVICIO (si existe)
ALTER TABLE IF EXISTS AVA_PAGOSERVICIO
  DROP CONSTRAINT IF EXISTS AVA_PROPIEDAD_X_AVA_PAGOSERVICIO;

-- Índices viejos (si existen)
DROP INDEX IF EXISTS AVA_PAGOSERVICIO_FK01;
DROP INDEX IF EXISTS AVA_PAGOSERVICIO_FK02;


/* =========================================================
   2) Drop tablas viejas de servicio (primero la hija)
   ========================================================= */

DROP TABLE IF EXISTS AVA_PAGOSERVICIO;
DROP TABLE IF EXISTS AVA_SERVICIO;



/* =========================================================
   3) Crear nuevas tablas del módulo de gastos
   ========================================================= */

/* ---------- 3.1) Nueva tabla de catálogo de servicios ---------- */
CREATE TABLE AVA_SERVICIO (
  ser_id BIGINT NOT NULL GENERATED ALWAYS AS IDENTITY
    (INCREMENT BY 1 MINVALUE 0 NO MAXVALUE START WITH 1),  -- Id

  ser_codigo VARCHAR(30) NOT NULL,                         -- Código único (ej: "AYA-001", "NETFLIX-ED1")
  ser_nombre VARCHAR(30) NOT NULL,                         -- Nombre (ej: "Netflix", "Agua", "Luz")
  ser_servicio VARCHAR(40),                                -- Tipo (luz, agua, internet...)
  ser_negocio VARCHAR(80),                                 -- Proveedor/negocio contratado
  ser_mediopago VARCHAR(30),                               -- medio común por el que se paga

  rowid BIGINT NOT NULL DEFAULT unique_rowid(),
  CONSTRAINT AVA_SERVICIO_PK PRIMARY KEY (ser_id),
  CONSTRAINT AVA_SERVICIO_UNQ01 UNIQUE (ser_codigo)
);

COMMENT ON TABLE AVA_SERVICIO IS 'Catálogo de servicios (proveedores/códigos) para gastos de servicio';
COMMENT ON COLUMN AVA_SERVICIO.ser_id IS 'Id del servicio';
COMMENT ON COLUMN AVA_SERVICIO.ser_codigo IS 'Código único del servicio';
COMMENT ON COLUMN AVA_SERVICIO.ser_nombre IS 'Nombre del servicio';
COMMENT ON COLUMN AVA_SERVICIO.ser_servicio IS 'Tipo de servicio, luz, agua, internet, etc.';
COMMENT ON COLUMN AVA_SERVICIO.ser_negocio IS 'Proveedor/negocio al que se contrata el servicio';
COMMENT ON COLUMN AVA_SERVICIO.ser_mediopago IS 'Medio común por el que se paga';
COMMENT ON COLUMN AVA_SERVICIO.rowid IS 'Identificador único interno para sincronización';



/* ---------- 3.2) Tabla unificada de gastos ---------- */
CREATE TABLE AVA_GASTO (
  gas_id BIGINT NOT NULL GENERATED ALWAYS AS IDENTITY
    (INCREMENT BY 1 MINVALUE 0 NO MAXVALUE START WITH 1),

  gas_tipo VARCHAR(1) NOT NULL,                 -- 'S' servicio, 'M' mantenimiento
  gas_concepto VARCHAR(60) NOT NULL,            -- Netflix, Luz, Reparación techo...
  gas_descripcion VARCHAR(200),

  gas_monto BIGINT NOT NULL,
  gas_fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  gas_estado VARCHAR(1) NOT NULL DEFAULT 'A',   -- 'A'=activo, 'D'=anulado

  -- Datos del pago (1 gasto = 1 pago)
  gas_metodopago VARCHAR(30),
  gas_cuenta VARCHAR(50),
  gas_banco VARCHAR(50),
  gas_referencia VARCHAR(100),
  gas_comprobante VARCHAR(500),

  -- Relaciones
  edi_id BIGINT NOT NULL,       -- siempre
  prop_id BIGINT,               -- opcional
  ser_id BIGINT,                -- requerido si es 'S', null si es 'M'
  usu_id BIGINT,                -- quién lo registró

  rowid BIGINT NOT NULL DEFAULT unique_rowid(),

  CONSTRAINT AVA_GASTO_PK PRIMARY KEY (gas_id),
  CONSTRAINT AVA_GASTO_CK01 CHECK (gas_tipo IN ('S','M')),
  CONSTRAINT AVA_GASTO_CK02 CHECK (gas_estado IN ('A','D')),
  CONSTRAINT AVA_GASTO_CK03 CHECK (
    (gas_tipo = 'S' AND ser_id IS NOT NULL) OR
    (gas_tipo = 'M' AND ser_id IS NULL)
  )
);

COMMENT ON TABLE AVA_GASTO IS 'Gastos por edificio y opcionalmente por propiedad: Servicios y Mantenimiento';
COMMENT ON COLUMN AVA_GASTO.gas_tipo IS 'Tipo de gasto (S=Servicio, M=Mantenimiento)';
COMMENT ON COLUMN AVA_GASTO.edi_id IS 'Edificio al que pertenece el gasto';
COMMENT ON COLUMN AVA_GASTO.prop_id IS 'Propiedad (opcional) relacionada al gasto';
COMMENT ON COLUMN AVA_GASTO.ser_id IS 'Servicio (solo si gas_tipo=S)';
COMMENT ON COLUMN AVA_GASTO.usu_id IS 'Usuario que registró el gasto';
COMMENT ON COLUMN AVA_GASTO.rowid IS 'Identificador único interno para sincronización';

-- Índices para performance
CREATE INDEX AVA_GASTO_FK01 ON AVA_GASTO (edi_id);
CREATE INDEX AVA_GASTO_FK02 ON AVA_GASTO (prop_id);
CREATE INDEX AVA_GASTO_FK03 ON AVA_GASTO (ser_id);
CREATE INDEX AVA_GASTO_IDX01 ON AVA_GASTO (gas_tipo, gas_fecha);

-- Foreign keys
ALTER TABLE AVA_GASTO
  ADD CONSTRAINT AVA_EDIFICIO_X_AVA_GASTO
    FOREIGN KEY (edi_id) REFERENCES AVA_EDIFICIO (edi_id)
      ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE AVA_GASTO
  ADD CONSTRAINT AVA_PROPIEDAD_X_AVA_GASTO
    FOREIGN KEY (prop_id) REFERENCES AVA_PROPIEDAD (prop_id)
      ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE AVA_GASTO
  ADD CONSTRAINT AVA_SERVICIO_X_AVA_GASTO
    FOREIGN KEY (ser_id) REFERENCES AVA_SERVICIO (ser_id)
      ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE AVA_GASTO
  ADD CONSTRAINT AVA_USUARIO_X_AVA_GASTO
    FOREIGN KEY (usu_id) REFERENCES AVA_USUARIO (usu_id)
      ON DELETE NO ACTION ON UPDATE NO ACTION;



/* ---------- 3.3) Auditoría de anulación de gastos ---------- */
CREATE TABLE AVA_ANULACIONGASTO (
  ang_id BIGINT NOT NULL GENERATED ALWAYS AS IDENTITY
    (INCREMENT BY 1 MINVALUE 0 NO MAXVALUE START WITH 1),

  ang_motivo VARCHAR(50) NOT NULL,
  ang_descripcion VARCHAR(200),

  ang_montooriginal BIGINT NOT NULL,
  ang_montofinal BIGINT NOT NULL,
  ang_fechaanulacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  gas_id BIGINT NOT NULL,
  usu_id BIGINT NOT NULL,

  rowid BIGINT NOT NULL DEFAULT unique_rowid(),
  CONSTRAINT PK_AVA_ANULACIONGASTO PRIMARY KEY (ang_id)
);

CREATE INDEX AVA_ANULACIONGASTO_FK01 ON AVA_ANULACIONGASTO (gas_id);
CREATE INDEX AVA_ANULACIONGASTO_FK02 ON AVA_ANULACIONGASTO (usu_id);

ALTER TABLE AVA_ANULACIONGASTO
  ADD CONSTRAINT AVA_GASTO_X_AVA_ANULACIONGASTO
    FOREIGN KEY (gas_id) REFERENCES AVA_GASTO (gas_id)
      ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE AVA_ANULACIONGASTO
  ADD CONSTRAINT AVA_USUARIO_X_AVA_ANULACIONGASTO
    FOREIGN KEY (usu_id) REFERENCES AVA_USUARIO (usu_id)
      ON DELETE NO ACTION ON UPDATE NO ACTION;
