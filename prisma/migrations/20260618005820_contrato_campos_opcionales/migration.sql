-- AlterTable: campos opcionales del contrato en ava_alquiler
ALTER TABLE "ava_alquiler" ADD COLUMN     "alq_diapago" INT4;
ALTER TABLE "ava_alquiler" ADD COLUMN     "alq_fechaprimerpago" TIMESTAMP(6);
ALTER TABLE "ava_alquiler" ADD COLUMN     "alq_nucleofamiliar" INT4;
ALTER TABLE "ava_alquiler" ADD COLUMN     "alq_fechainicio" TIMESTAMP(6);
ALTER TABLE "ava_alquiler" ADD COLUMN     "alq_fechafin" TIMESTAMP(6);
ALTER TABLE "ava_alquiler" ADD COLUMN     "alq_fechafirma" TIMESTAMP(6);

-- AlterTable: datos de la finca en ava_edificio
ALTER TABLE "ava_edificio" ADD COLUMN     "edi_matricula" STRING(100);
ALTER TABLE "ava_edificio" ADD COLUMN     "edi_plano" STRING(100);
ALTER TABLE "ava_edificio" ADD COLUMN     "edi_areafinca" STRING(100);
ALTER TABLE "ava_edificio" ADD COLUMN     "edi_ubicacionfinca" STRING(200);
ALTER TABLE "ava_edificio" ADD COLUMN     "edi_linderos" STRING(300);

-- AlterTable: descripción del apartamento para el contrato en ava_propiedad
ALTER TABLE "ava_propiedad" ADD COLUMN     "prop_descripcioncontrato" STRING(300);
