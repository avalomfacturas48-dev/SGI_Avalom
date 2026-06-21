-- DROP SCHEMA public;

CREATE SCHEMA public AUTHORIZATION anthony;

-- DROP SEQUENCE ava_alquiler_alq_id_seq;

CREATE SEQUENCE ava_alquiler_alq_id_seq
	INCREMENT BY 1
	MINVALUE 0
	MAXVALUE 9223372036854775807
	START 1
	NO CYCLE;
-- DROP SEQUENCE ava_alquilercancelado_alqc_id_seq;

CREATE SEQUENCE ava_alquilercancelado_alqc_id_seq
	INCREMENT BY 1
	MINVALUE 0
	MAXVALUE 9223372036854775807
	START 1
	NO CYCLE;
-- DROP SEQUENCE ava_alquilermensual_alqm_id_seq;

CREATE SEQUENCE ava_alquilermensual_alqm_id_seq
	INCREMENT BY 1
	MINVALUE 0
	MAXVALUE 9223372036854775807
	START 1
	NO CYCLE;
-- DROP SEQUENCE ava_anulaciongasto_ang_id_seq;

CREATE SEQUENCE ava_anulaciongasto_ang_id_seq
	INCREMENT BY 1
	MINVALUE 0
	MAXVALUE 9223372036854775807
	START 1
	NO CYCLE;
-- DROP SEQUENCE ava_anulacionpago_anp_id_seq;

CREATE SEQUENCE ava_anulacionpago_anp_id_seq
	INCREMENT BY 1
	MINVALUE 0
	MAXVALUE 9223372036854775807
	START 1
	NO CYCLE;
-- DROP SEQUENCE ava_cliente_cli_id_seq;

CREATE SEQUENCE ava_cliente_cli_id_seq
	INCREMENT BY 1
	MINVALUE 0
	MAXVALUE 9223372036854775807
	START 1
	NO CYCLE;
-- DROP SEQUENCE ava_deposito_depo_id_seq;

CREATE SEQUENCE ava_deposito_depo_id_seq
	INCREMENT BY 1
	MINVALUE 0
	MAXVALUE 9223372036854775807
	START 1
	NO CYCLE;
-- DROP SEQUENCE ava_edificio_edi_id_seq;

CREATE SEQUENCE ava_edificio_edi_id_seq
	INCREMENT BY 1
	MINVALUE 0
	MAXVALUE 9223372036854775807
	START 1
	NO CYCLE;
-- DROP SEQUENCE ava_gasto_gas_id_seq;

CREATE SEQUENCE ava_gasto_gas_id_seq
	INCREMENT BY 1
	MINVALUE 0
	MAXVALUE 9223372036854775807
	START 1
	NO CYCLE;
-- DROP SEQUENCE ava_pago_pag_id_seq;

CREATE SEQUENCE ava_pago_pag_id_seq
	INCREMENT BY 1
	MINVALUE 0
	MAXVALUE 9223372036854775807
	START 1
	NO CYCLE;
-- DROP SEQUENCE ava_propiedad_prop_id_seq;

CREATE SEQUENCE ava_propiedad_prop_id_seq
	INCREMENT BY 1
	MINVALUE 0
	MAXVALUE 9223372036854775807
	START 1
	NO CYCLE;
-- DROP SEQUENCE ava_reservacion_res_id_seq;

CREATE SEQUENCE ava_reservacion_res_id_seq
	INCREMENT BY 1
	MINVALUE 0
	MAXVALUE 9223372036854775807
	START 1
	NO CYCLE;
-- DROP SEQUENCE ava_servicio_ser_id_seq;

CREATE SEQUENCE ava_servicio_ser_id_seq
	INCREMENT BY 1
	MINVALUE 0
	MAXVALUE 9223372036854775807
	START 1
	NO CYCLE;
-- DROP SEQUENCE ava_tipopropiedad_tipp_id_seq;

CREATE SEQUENCE ava_tipopropiedad_tipp_id_seq
	INCREMENT BY 1
	MINVALUE 0
	MAXVALUE 9223372036854775807
	START 1
	NO CYCLE;
-- DROP SEQUENCE ava_usuario_usu_id_seq;

CREATE SEQUENCE ava_usuario_usu_id_seq
	INCREMENT BY 1
	MINVALUE 0
	MAXVALUE 9223372036854775807
	START 1
	NO CYCLE;-- public._prisma_migrations definition

-- Drop table

-- DROP TABLE _prisma_migrations;

CREATE TABLE public._prisma_migrations (
	id VARCHAR(36) NOT NULL,
	checksum VARCHAR(64) NOT NULL,
	finished_at TIMESTAMPTZ NULL,
	migration_name VARCHAR(255) NOT NULL,
	logs STRING NULL,
	rolled_back_at TIMESTAMPTZ NULL,
	started_at TIMESTAMPTZ NOT NULL DEFAULT now():::TIMESTAMPTZ,
	applied_steps_count INT8 NOT NULL DEFAULT 0:::INT8,
	CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id ASC)
);


-- public.ava_cliente definition

-- Drop table

-- DROP TABLE ava_cliente;

CREATE TABLE public.ava_cliente (
	cli_id INT8 NOT NULL GENERATED ALWAYS AS IDENTITY (INCREMENT BY 1 MINVALUE 0 NO MAXVALUE START WITH 1),
	cli_nombre VARCHAR(30) NOT NULL,
	cli_papellido VARCHAR(30) NOT NULL,
	cli_sapellido VARCHAR(30) NULL,
	cli_cedula VARCHAR(15) NOT NULL,
	cli_telefono VARCHAR(15) NULL,
	cli_correo VARCHAR(50) NULL,
	cli_fechacreacion TIMESTAMP NOT NULL DEFAULT current_timestamp():::TIMESTAMP,
	cli_direccion VARCHAR(200) NULL,
	cli_estadocivil VARCHAR(20) NULL,
	rowid INT8 NOT NULL DEFAULT unique_rowid(),
	CONSTRAINT ava_cliente_pk PRIMARY KEY (cli_id ASC),
	UNIQUE INDEX ava_cliente_unq01 (cli_cedula ASC),
	UNIQUE INDEX ava_cliente_unq02 (cli_correo ASC)
);


-- public.ava_edificio definition

-- Drop table

-- DROP TABLE ava_edificio;

CREATE TABLE public.ava_edificio (
	edi_id INT8 NOT NULL GENERATED ALWAYS AS IDENTITY (INCREMENT BY 1 MINVALUE 0 NO MAXVALUE START WITH 1),
	edi_identificador VARCHAR(15) NOT NULL,
	edi_descripcion VARCHAR(50) NULL,
	edi_direccion VARCHAR(200) NULL,
	edi_codigopostal VARCHAR(10) NULL,
	rowid INT8 NOT NULL DEFAULT unique_rowid(),
	CONSTRAINT pk_ava_edificio PRIMARY KEY (edi_id ASC)
);


-- public.ava_servicio definition

-- Drop table

-- DROP TABLE ava_servicio;

CREATE TABLE public.ava_servicio (
	ser_id INT8 NOT NULL GENERATED ALWAYS AS IDENTITY (INCREMENT BY 1 MINVALUE 0 NO MAXVALUE START WITH 1),
	ser_codigo VARCHAR(30) NOT NULL,
	ser_nombre VARCHAR(30) NOT NULL,
	ser_servicio VARCHAR(40) NULL,
	ser_negocio VARCHAR(80) NULL,
	ser_mediopago VARCHAR(30) NULL,
	rowid INT8 NOT NULL DEFAULT unique_rowid(),
	CONSTRAINT ava_servicio_pk PRIMARY KEY (ser_id ASC),
	UNIQUE INDEX ava_servicio_unq01 (ser_codigo ASC)
);
COMMENT ON TABLE public.ava_servicio IS e'Cat\u00E1logo de servicios (proveedores/c\u00F3digos) para gastos de servicio';
COMMENT ON COLUMN public.ava_servicio.ser_id IS 'Id del servicio';
COMMENT ON COLUMN public.ava_servicio.ser_codigo IS e'C\u00F3digo \u00FAnico del servicio';
COMMENT ON COLUMN public.ava_servicio.ser_nombre IS 'Nombre del servicio';
COMMENT ON COLUMN public.ava_servicio.ser_servicio IS 'Tipo de servicio, luz, agua, internet, etc.';
COMMENT ON COLUMN public.ava_servicio.ser_negocio IS 'Proveedor/negocio al que se contrata el servicio';
COMMENT ON COLUMN public.ava_servicio.ser_mediopago IS e'Medio com\u00FAn por el que se paga';
COMMENT ON COLUMN public.ava_servicio.rowid IS e'Identificador \u00FAnico interno para sincronizaci\u00F3n';
COMMENT ON TABLE public.ava_servicio IS 'Catálogo de servicios (proveedores/códigos) para gastos de servicio';

-- Column comments

COMMENT ON COLUMN public.ava_servicio.ser_id IS 'Id del servicio';
COMMENT ON COLUMN public.ava_servicio.ser_codigo IS 'Código único del servicio';
COMMENT ON COLUMN public.ava_servicio.ser_nombre IS 'Nombre del servicio';
COMMENT ON COLUMN public.ava_servicio.ser_servicio IS 'Tipo de servicio, luz, agua, internet, etc.';
COMMENT ON COLUMN public.ava_servicio.ser_negocio IS 'Proveedor/negocio al que se contrata el servicio';
COMMENT ON COLUMN public.ava_servicio.ser_mediopago IS 'Medio común por el que se paga';
COMMENT ON COLUMN public.ava_servicio.rowid IS 'Identificador único interno para sincronización';


-- public.ava_tipopropiedad definition

-- Drop table

-- DROP TABLE ava_tipopropiedad;

CREATE TABLE public.ava_tipopropiedad (
	tipp_id INT8 NOT NULL GENERATED ALWAYS AS IDENTITY (INCREMENT BY 1 MINVALUE 0 NO MAXVALUE START WITH 1),
	tipp_nombre VARCHAR(30) NOT NULL,
	rowid INT8 NOT NULL DEFAULT unique_rowid(),
	CONSTRAINT ava_tipopropiedad_pk PRIMARY KEY (tipp_id ASC)
);


-- public.ava_usuario definition

-- Drop table

-- DROP TABLE ava_usuario;

CREATE TABLE public.ava_usuario (
	usu_id INT8 NOT NULL GENERATED ALWAYS AS IDENTITY (INCREMENT BY 1 MINVALUE 0 NO MAXVALUE START WITH 1),
	usu_nombre VARCHAR(30) NOT NULL,
	usu_papellido VARCHAR(30) NOT NULL,
	usu_sapellido VARCHAR(30) NULL,
	usu_cedula VARCHAR(15) NOT NULL,
	usu_correo VARCHAR(50) NOT NULL,
	usu_contrasena VARCHAR(500) NOT NULL,
	usu_telefono VARCHAR(15) NULL,
	usu_fechacreacion TIMESTAMP NOT NULL DEFAULT current_timestamp():::TIMESTAMP,
	usu_estado VARCHAR(1) NOT NULL,
	usu_rol VARCHAR(1) NOT NULL,
	rowid INT8 NOT NULL DEFAULT unique_rowid(),
	CONSTRAINT ava_usuario_pk PRIMARY KEY (usu_id ASC),
	UNIQUE INDEX ava_usuario_unq01 (usu_cedula ASC),
	UNIQUE INDEX ava_usuario_unq02 (usu_correo ASC),
	CONSTRAINT ava_usuario_ck01 CHECK (usu_estado IN ('A':::STRING, 'I':::STRING)),
	CONSTRAINT ava_usuario_ck02 CHECK (usu_rol IN ('A':::STRING, 'J':::STRING, 'E':::STRING, 'R':::STRING))
);


-- public.parametros definition

-- Drop table

-- DROP TABLE parametros;

CREATE TABLE public.parametros (
	par_nombre VARCHAR(30) NULL,
	par_logo VARCHAR(500) NULL,
	par_correo VARCHAR(50) NULL,
	par_descripcion VARCHAR(200) NULL,
	rowid INT8 NOT NULL DEFAULT unique_rowid(),
	CONSTRAINT parametros_pkey PRIMARY KEY (rowid ASC)
);


-- public.ava_propiedad definition

-- Drop table

-- DROP TABLE ava_propiedad;

CREATE TABLE public.ava_propiedad (
	prop_id INT8 NOT NULL GENERATED ALWAYS AS IDENTITY (INCREMENT BY 1 MINVALUE 0 NO MAXVALUE START WITH 1),
	prop_identificador VARCHAR(15) NOT NULL,
	prop_descripcion VARCHAR(50) NULL,
	edi_id INT8 NULL,
	tipp_id INT8 NULL,
	rowid INT8 NOT NULL DEFAULT unique_rowid(),
	prop_descripcioncontrato STRING(300) NULL,
	CONSTRAINT ava_propiedad_pk PRIMARY KEY (prop_id ASC),
	CONSTRAINT ava_tipopropiedad_x_propiedad FOREIGN KEY (tipp_id) REFERENCES public.ava_tipopropiedad(tipp_id),
	CONSTRAINT ava_edificio_x_ava_propiedad FOREIGN KEY (edi_id) REFERENCES public.ava_edificio(edi_id),
	INDEX ava_propiedad_fk01 (tipp_id ASC),
	INDEX ava_propiedad_fk02 (edi_id ASC)
);


-- public.ava_reservacion definition

-- Drop table

-- DROP TABLE ava_reservacion;

CREATE TABLE public.ava_reservacion (
	res_id INT8 NOT NULL GENERATED ALWAYS AS IDENTITY (INCREMENT BY 1 MINVALUE 0 NO MAXVALUE START WITH 1),
	res_nombrecliente VARCHAR(50) NOT NULL,
	res_telefonocliente VARCHAR(15) NULL,
	res_correocliente VARCHAR(50) NULL,
	res_fechaentrada TIMESTAMP NOT NULL,
	res_fechasalida TIMESTAMP NOT NULL,
	res_montototal INT8 NOT NULL,
	res_montoactual INT8 NOT NULL,
	res_estado VARCHAR(1) NOT NULL,
	res_fechacreacion TIMESTAMP NOT NULL DEFAULT current_timestamp():::TIMESTAMP,
	prop_id INT8 NULL,
	rowid INT8 NOT NULL DEFAULT unique_rowid(),
	CONSTRAINT ava_reservacion_pk PRIMARY KEY (res_id ASC),
	CONSTRAINT ava_propiedad_x_ava_reservacion FOREIGN KEY (prop_id) REFERENCES public.ava_propiedad(prop_id),
	INDEX ava_reservacion_fk01 (prop_id ASC),
	CONSTRAINT ava_reservacion_ck01 CHECK (res_estado IN ('R':::STRING, 'A':::STRING, 'C':::STRING, 'F':::STRING))
);


-- public.ava_alquiler definition

-- Drop table

-- DROP TABLE ava_alquiler;

CREATE TABLE public.ava_alquiler (
	alq_id INT8 NOT NULL GENERATED ALWAYS AS IDENTITY (INCREMENT BY 1 MINVALUE 0 NO MAXVALUE START WITH 1),
	alq_monto INT8 NOT NULL,
	alq_fechapago TIMESTAMP NOT NULL,
	alq_contrato VARCHAR(500) NULL,
	alq_estado VARCHAR(1) NOT NULL,
	alq_fechacreacion TIMESTAMP NOT NULL DEFAULT current_timestamp():::TIMESTAMP,
	prop_id INT8 NULL,
	rowid INT8 NOT NULL DEFAULT unique_rowid(),
	alq_fechafirma TIMESTAMP(6) NULL,
	CONSTRAINT ava_alquiler_pk PRIMARY KEY (alq_id ASC),
	CONSTRAINT ava_propiedad_x_ava_alquiler FOREIGN KEY (prop_id) REFERENCES public.ava_propiedad(prop_id),
	INDEX ava_alquiler_fk01 (prop_id ASC),
	CONSTRAINT ava_alquiler_ck01 CHECK (alq_estado IN ('A':::STRING, 'F':::STRING, 'C':::STRING))
);


-- public.ava_alquilercancelado definition

-- Drop table

-- DROP TABLE ava_alquilercancelado;

CREATE TABLE public.ava_alquilercancelado (
	alqc_id INT8 NOT NULL GENERATED ALWAYS AS IDENTITY (INCREMENT BY 1 MINVALUE 0 NO MAXVALUE START WITH 1),
	alqc_motivo VARCHAR(50) NOT NULL,
	alqc_montodevuelto INT8 NULL,
	alqc_castigo INT8 NULL,
	alqc_motivomontodevuelto VARCHAR(50) NULL,
	alqc_motivocastigo VARCHAR(50) NULL,
	alqc_fecha_cancelacion TIMESTAMP NOT NULL,
	alqc_fechacreacion TIMESTAMP NOT NULL DEFAULT current_timestamp():::TIMESTAMP,
	alq_id INT8 NULL,
	rowid INT8 NOT NULL DEFAULT unique_rowid(),
	CONSTRAINT pk_ava_alquilercancelado PRIMARY KEY (alqc_id ASC),
	CONSTRAINT ava_alquiler_x_ava_alquilercancelado FOREIGN KEY (alq_id) REFERENCES public.ava_alquiler(alq_id),
	INDEX ava_alquilercancelado_fk01 (alq_id ASC)
);


-- public.ava_alquilermensual definition

-- Drop table

-- DROP TABLE ava_alquilermensual;

CREATE TABLE public.ava_alquilermensual (
	alqm_id INT8 NOT NULL GENERATED ALWAYS AS IDENTITY (INCREMENT BY 1 MINVALUE 0 NO MAXVALUE START WITH 1),
	alqm_identificador VARCHAR(15) NOT NULL,
	alqm_fechainicio TIMESTAMP NOT NULL,
	alqm_fechafin TIMESTAMP NOT NULL,
	alqm_montototal INT8 NOT NULL,
	alqm_montopagado INT8 NOT NULL,
	alqm_fechapago TIMESTAMP NULL,
	alqm_estado VARCHAR(1) NOT NULL,
	alqm_fechacreacion TIMESTAMP NOT NULL DEFAULT current_timestamp():::TIMESTAMP,
	alq_id INT8 NULL,
	rowid INT8 NOT NULL DEFAULT unique_rowid(),
	CONSTRAINT ava_alquilermensual_pk PRIMARY KEY (alqm_id ASC),
	CONSTRAINT ava_alquiler_x_ava_alquilermensual FOREIGN KEY (alq_id) REFERENCES public.ava_alquiler(alq_id),
	CONSTRAINT ava_alquilermensual_ck01 CHECK (alqm_estado IN ('A':::STRING, 'P':::STRING, 'I':::STRING, 'R':::STRING))
);


-- public.ava_clientexalquiler definition

-- Drop table

-- DROP TABLE ava_clientexalquiler;

CREATE TABLE public.ava_clientexalquiler (
	alq_id INT8 NOT NULL,
	cli_id INT8 NOT NULL,
	rowid INT8 NOT NULL DEFAULT unique_rowid(),
	CONSTRAINT pk_ava_clientexalquiler PRIMARY KEY (alq_id ASC, cli_id ASC),
	CONSTRAINT ava_cliente_x_ava_clientexalquiler FOREIGN KEY (cli_id) REFERENCES public.ava_cliente(cli_id),
	CONSTRAINT ava_alquiler_x_ava_clientexalquiler FOREIGN KEY (alq_id) REFERENCES public.ava_alquiler(alq_id)
);


-- public.ava_deposito definition

-- Drop table

-- DROP TABLE ava_deposito;

CREATE TABLE public.ava_deposito (
	depo_id INT8 NOT NULL GENERATED ALWAYS AS IDENTITY (INCREMENT BY 1 MINVALUE 0 NO MAXVALUE START WITH 1),
	depo_montoactual INT8 NOT NULL,
	depo_total INT8 NOT NULL,
	depo_montodevuelto INT8 NULL,
	depo_montocastigo INT8 NULL,
	depo_descmontodevuelto VARCHAR(50) NULL,
	depo_descrmontocastigo VARCHAR(50) NULL,
	depo_fechadevolucion TIMESTAMP NULL,
	depo_fechacreacion TIMESTAMP NOT NULL DEFAULT current_timestamp():::TIMESTAMP,
	alq_id INT8 NULL,
	rowid INT8 NOT NULL DEFAULT unique_rowid(),
	CONSTRAINT ava_deposito_pk PRIMARY KEY (depo_id ASC),
	CONSTRAINT ava_alquiler_x_ava_deposito FOREIGN KEY (alq_id) REFERENCES public.ava_alquiler(alq_id),
	INDEX ava_deposito_fk01 (alq_id ASC)
);


-- public.ava_gasto definition

-- Drop table

-- DROP TABLE ava_gasto;

CREATE TABLE public.ava_gasto (
	gas_id INT8 NOT NULL GENERATED ALWAYS AS IDENTITY (INCREMENT BY 1 MINVALUE 0 NO MAXVALUE START WITH 1),
	gas_tipo VARCHAR(1) NOT NULL,
	gas_concepto VARCHAR(60) NOT NULL,
	gas_descripcion VARCHAR(200) NULL,
	gas_monto INT8 NOT NULL,
	gas_fecha TIMESTAMP NOT NULL DEFAULT current_timestamp():::TIMESTAMP,
	gas_estado VARCHAR(1) NOT NULL DEFAULT 'A':::STRING,
	gas_metodopago VARCHAR(30) NULL,
	gas_cuenta VARCHAR(50) NULL,
	gas_banco VARCHAR(50) NULL,
	gas_referencia VARCHAR(100) NULL,
	gas_comprobante VARCHAR(500) NULL,
	edi_id INT8 NOT NULL,
	prop_id INT8 NULL,
	ser_id INT8 NULL,
	usu_id INT8 NULL,
	rowid INT8 NOT NULL DEFAULT unique_rowid(),
	CONSTRAINT ava_gasto_pk PRIMARY KEY (gas_id ASC),
	CONSTRAINT ava_edificio_x_ava_gasto FOREIGN KEY (edi_id) REFERENCES public.ava_edificio(edi_id),
	CONSTRAINT ava_propiedad_x_ava_gasto FOREIGN KEY (prop_id) REFERENCES public.ava_propiedad(prop_id),
	CONSTRAINT ava_servicio_x_ava_gasto FOREIGN KEY (ser_id) REFERENCES public.ava_servicio(ser_id),
	CONSTRAINT ava_usuario_x_ava_gasto FOREIGN KEY (usu_id) REFERENCES public.ava_usuario(usu_id),
	INDEX ava_gasto_fk01 (edi_id ASC),
	INDEX ava_gasto_fk02 (prop_id ASC),
	INDEX ava_gasto_fk03 (ser_id ASC),
	INDEX ava_gasto_idx01 (gas_tipo ASC, gas_fecha ASC),
	CONSTRAINT ava_gasto_ck01 CHECK (gas_tipo IN ('S':::STRING, 'M':::STRING)),
	CONSTRAINT ava_gasto_ck02 CHECK (gas_estado IN ('A':::STRING, 'D':::STRING)),
	CONSTRAINT ava_gasto_ck03 CHECK (((gas_tipo = 'S':::STRING) AND (ser_id IS NOT NULL)) OR ((gas_tipo = 'M':::STRING) AND (ser_id IS NULL)))
);
COMMENT ON TABLE public.ava_gasto IS 'Gastos por edificio y opcionalmente por propiedad: Servicios y Mantenimiento';
COMMENT ON COLUMN public.ava_gasto.gas_tipo IS 'Tipo de gasto (S=Servicio, M=Mantenimiento)';
COMMENT ON COLUMN public.ava_gasto.edi_id IS 'Edificio al que pertenece el gasto';
COMMENT ON COLUMN public.ava_gasto.prop_id IS 'Propiedad (opcional) relacionada al gasto';
COMMENT ON COLUMN public.ava_gasto.ser_id IS 'Servicio (solo si gas_tipo=S)';
COMMENT ON COLUMN public.ava_gasto.usu_id IS e'Usuario que registr\u00F3 el gasto';
COMMENT ON COLUMN public.ava_gasto.rowid IS e'Identificador \u00FAnico interno para sincronizaci\u00F3n';
COMMENT ON TABLE public.ava_gasto IS 'Gastos por edificio y opcionalmente por propiedad: Servicios y Mantenimiento';

-- Column comments

COMMENT ON COLUMN public.ava_gasto.gas_tipo IS 'Tipo de gasto (S=Servicio, M=Mantenimiento)';
COMMENT ON COLUMN public.ava_gasto.edi_id IS 'Edificio al que pertenece el gasto';
COMMENT ON COLUMN public.ava_gasto.prop_id IS 'Propiedad (opcional) relacionada al gasto';
COMMENT ON COLUMN public.ava_gasto.ser_id IS 'Servicio (solo si gas_tipo=S)';
COMMENT ON COLUMN public.ava_gasto.usu_id IS 'Usuario que registró el gasto';
COMMENT ON COLUMN public.ava_gasto.rowid IS 'Identificador único interno para sincronización';


-- public.ava_pago definition

-- Drop table

-- DROP TABLE ava_pago;

CREATE TABLE public.ava_pago (
	pag_id INT8 NOT NULL GENERATED ALWAYS AS IDENTITY (INCREMENT BY 1 MINVALUE 0 NO MAXVALUE START WITH 1),
	pag_monto INT8 NOT NULL,
	pag_descripcion VARCHAR(50) NULL,
	pag_cuenta VARCHAR(50) NULL,
	pag_estado VARCHAR(1) NOT NULL,
	pag_fechapago TIMESTAMP NOT NULL,
	pag_metodopago VARCHAR(30) NULL,
	pag_banco VARCHAR(50) NULL,
	pag_referencia VARCHAR(100) NULL,
	rowid INT8 NOT NULL DEFAULT unique_rowid(),
	res_id INT8 NULL,
	alqm_id INT8 NULL,
	depo_id INT8 NULL,
	CONSTRAINT ava_pago_pk PRIMARY KEY (pag_id ASC),
	CONSTRAINT ava_deposito_x_ava_pago FOREIGN KEY (depo_id) REFERENCES public.ava_deposito(depo_id),
	CONSTRAINT ava_alquilermensual_x_ava_pago FOREIGN KEY (alqm_id) REFERENCES public.ava_alquilermensual(alqm_id),
	CONSTRAINT ava_reservacion_x_ava_pago FOREIGN KEY (res_id) REFERENCES public.ava_reservacion(res_id),
	CONSTRAINT ava_pago_ck01 CHECK (pag_estado IN ('A':::STRING, 'D':::STRING))
);


-- public.ava_anulaciongasto definition

-- Drop table

-- DROP TABLE ava_anulaciongasto;

CREATE TABLE public.ava_anulaciongasto (
	ang_id INT8 NOT NULL GENERATED ALWAYS AS IDENTITY (INCREMENT BY 1 MINVALUE 0 NO MAXVALUE START WITH 1),
	ang_motivo VARCHAR(50) NOT NULL,
	ang_descripcion VARCHAR(200) NULL,
	ang_montooriginal INT8 NOT NULL,
	ang_montofinal INT8 NOT NULL,
	ang_fechaanulacion TIMESTAMP NOT NULL DEFAULT current_timestamp():::TIMESTAMP,
	gas_id INT8 NOT NULL,
	usu_id INT8 NOT NULL,
	rowid INT8 NOT NULL DEFAULT unique_rowid(),
	CONSTRAINT pk_ava_anulaciongasto PRIMARY KEY (ang_id ASC),
	CONSTRAINT ava_gasto_x_ava_anulaciongasto FOREIGN KEY (gas_id) REFERENCES public.ava_gasto(gas_id),
	CONSTRAINT ava_usuario_x_ava_anulaciongasto FOREIGN KEY (usu_id) REFERENCES public.ava_usuario(usu_id),
	INDEX ava_anulaciongasto_fk01 (gas_id ASC),
	INDEX ava_anulaciongasto_fk02 (usu_id ASC)
);


-- public.ava_anulacionpago definition

-- Drop table

-- DROP TABLE ava_anulacionpago;

CREATE TABLE public.ava_anulacionpago (
	anp_id INT8 NOT NULL GENERATED ALWAYS AS IDENTITY (INCREMENT BY 1 MINVALUE 0 NO MAXVALUE START WITH 1),
	anp_motivo VARCHAR(50) NOT NULL,
	anp_descripcion VARCHAR(50) NOT NULL,
	anp_montooriginal INT8 NOT NULL,
	anp_montofinal INT8 NOT NULL,
	anp_fechaanulacion TIMESTAMP NOT NULL DEFAULT current_timestamp():::TIMESTAMP,
	pag_id INT8 NULL,
	usu_id INT8 NULL,
	rowid INT8 NOT NULL DEFAULT unique_rowid(),
	CONSTRAINT pk_ava_anulacionpago PRIMARY KEY (anp_id ASC),
	CONSTRAINT ava_pago_x_ava_anulacionpago FOREIGN KEY (pag_id) REFERENCES public.ava_pago(pag_id),
	CONSTRAINT ava_usuario_x_ava_anulacionpago FOREIGN KEY (usu_id) REFERENCES public.ava_usuario(usu_id),
	INDEX ava_anulacionpago_fk01 (pag_id ASC),
	INDEX ava_anulacionpago_fk02 (usu_id ASC)
);