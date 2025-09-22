"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitSchema1700000000000 = void 0;
class InitSchema1700000000000 {
    constructor() {
        this.name = 'InitSchema1700000000000';
    }
    async up(queryRunner) {
        // ===== Enums
        await queryRunner.query(`DO $$ BEGIN
      CREATE TYPE estado_academico AS ENUM ('ACTIVO','INACTIVO','BAJA','EGRESADO');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;`);
        await queryRunner.query(`DO $$ BEGIN
      CREATE TYPE tipo_materia AS ENUM ('OBLIGATORIA','OPTATIVA');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;`);
        await queryRunner.query(`DO $$ BEGIN
      CREATE TYPE estatus_inscripcion AS ENUM ('INSCRITO','BAJA','PENDIENTE');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;`);
        await queryRunner.query(`DO $$ BEGIN
      CREATE TYPE rol_docente AS ENUM ('TITULAR','AUXILIAR','PRACTICAS');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;`);
        await queryRunner.query(`DO $$ BEGIN
      CREATE TYPE severidad AS ENUM ('INFO','WARNING','ERROR');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;`);
        // ===== Tablas
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS plan_estudio (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(150) NOT NULL,
        version VARCHAR(50) NOT NULL,
        total_creditos INT NOT NULL,
        semestres_sugeridos INT NOT NULL
      )`);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS alumno (
        id SERIAL PRIMARY KEY,
        matricula VARCHAR(20) NOT NULL,
        expediente VARCHAR(50),
        nombre VARCHAR(100) NOT NULL,
        apellido_paterno VARCHAR(100) NOT NULL,
        apellido_materno VARCHAR(100),
        correo VARCHAR(150) NOT NULL,
        estado_academico estado_academico NOT NULL DEFAULT 'ACTIVO',
        nivel_ingles_actual VARCHAR(50),
        plan_estudio_id INT NOT NULL REFERENCES plan_estudio(id),
        total_creditos INT NOT NULL DEFAULT 0,
        CONSTRAINT uq_alumno_matricula UNIQUE (matricula)
      );
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS ix_alumno_nombre
      ON alumno (nombre, apellido_paterno, apellido_materno);
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS profesor (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        apellido_paterno VARCHAR(100) NOT NULL,
        apellido_materno VARCHAR(100),
        correo VARCHAR(150) NOT NULL,
        num_empleado INT NOT NULL,
        CONSTRAINT uq_profesor_num_empleado UNIQUE (num_empleado)
      );
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS materia (
        id SERIAL PRIMARY KEY,
        codigo VARCHAR(20) NOT NULL,
        nombre VARCHAR(150) NOT NULL,
        creditos INT NOT NULL,
        tipo tipo_materia NOT NULL DEFAULT 'OBLIGATORIA',
        plan_estudio_id INT NOT NULL REFERENCES plan_estudio(id),
        CONSTRAINT uq_materia_codigo UNIQUE (codigo)
      );
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS periodo (
        id SERIAL PRIMARY KEY,
        anio INT NOT NULL,
        ciclo INT NOT NULL,
        etiqueta VARCHAR(50) NOT NULL,
        fecha_inicio DATE NOT NULL,
        fecha_fin DATE NOT NULL,
        CONSTRAINT uq_periodo_etiqueta UNIQUE (etiqueta)
      );
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS grupo (
        id SERIAL PRIMARY KEY,
        materia_id INT NOT NULL REFERENCES materia(id),
        periodo_id INT NOT NULL REFERENCES periodo(id),
        clave_grupo VARCHAR(30) NOT NULL,
        cupo INT NOT NULL,
        CONSTRAINT uq_grupo_periodo_materia_clave UNIQUE (materia_id, periodo_id, clave_grupo)
      );
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS horario (
        id SERIAL PRIMARY KEY,
        grupo_id INT NOT NULL REFERENCES grupo(id) ON DELETE CASCADE,
        dia_semana INT NOT NULL,
        hora_inicio TIME NOT NULL,
        hora_fin TIME NOT NULL,
        aula VARCHAR(50) NOT NULL,
        CONSTRAINT uq_horario_bloque UNIQUE (grupo_id, dia_semana, hora_inicio, hora_fin, aula)
      );
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS inscripcion (
        id SERIAL PRIMARY KEY,
        alumno_id INT NOT NULL REFERENCES alumno(id),
        periodo_id INT NOT NULL REFERENCES periodo(id),
        estatus estatus_inscripcion NOT NULL DEFAULT 'INSCRITO',
        fecha_alta TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_inscripcion_alumno_periodo UNIQUE (alumno_id, periodo_id)
      );
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS kardex (
        id SERIAL PRIMARY KEY,
        alumno_id INT NOT NULL REFERENCES alumno(id),
        materia_id INT NOT NULL REFERENCES materia(id),
        periodo_id INT NOT NULL REFERENCES periodo(id),
        calificacion NUMERIC(5,2),
        estatus VARCHAR(30) NOT NULL,
        promedio_kardex INT NOT NULL DEFAULT 0,
        promedio_sem_act INT NOT NULL DEFAULT 0,
        CONSTRAINT uq_kardex_alumno_materia_periodo UNIQUE (alumno_id, materia_id, periodo_id)
      );
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS calificacion (
        id SERIAL PRIMARY KEY,
        kardex_id INT NOT NULL UNIQUE REFERENCES kardex(id) ON DELETE CASCADE,
        materia_id INT NOT NULL REFERENCES materia(id),
        ordinario NUMERIC(5,2),
        extraordinario NUMERIC(5,2),
        final NUMERIC(5,2),
        fecha_cierre DATE
      );
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS asignacion_profesor (
        id SERIAL PRIMARY KEY,
        grupo_id INT NOT NULL REFERENCES grupo(id) ON DELETE CASCADE,
        profesor_id INT NOT NULL REFERENCES profesor(id),
        rol_docente rol_docente NOT NULL DEFAULT 'TITULAR',
        CONSTRAINT uq_asignacion_profesor UNIQUE (grupo_id, profesor_id, rol_docente)
      );
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS optativa_progreso (
        id SERIAL PRIMARY KEY,
        alumno_id INT NOT NULL UNIQUE REFERENCES alumno(id) ON DELETE CASCADE,
        creditos_optativos_cursados INT NOT NULL DEFAULT 0,
        creditos_optativos_requeridos INT NOT NULL DEFAULT 0
      );
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS archivo_cargado (
        id SERIAL PRIMARY KEY,
        tipo VARCHAR(50) NOT NULL,
        nombre_archivo VARCHAR(255) NOT NULL,
        hash VARCHAR(128) NOT NULL,
        usuario VARCHAR(100) NOT NULL,
        fecha TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        estado_proceso VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE'
      );
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS ix_archivo_tipo_fecha
      ON archivo_cargado (tipo, fecha);
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS validacion_resultado (
        id SERIAL PRIMARY KEY,
        archivo_id INT NOT NULL REFERENCES archivo_cargado(id) ON DELETE CASCADE,
        severidad severidad NOT NULL DEFAULT 'INFO',
        regla_codigo VARCHAR(50) NOT NULL,
        descripcion TEXT NOT NULL,
        fila_origen VARCHAR(50)
      );
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS ix_validacion_archivo_severidad
      ON validacion_resultado (archivo_id, severidad);
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS auditoria_cargas (
        id SERIAL PRIMARY KEY,
        archivo_id INT NOT NULL REFERENCES archivo_cargado(id) ON DELETE CASCADE,
        etapa VARCHAR(50) NOT NULL,
        estado VARCHAR(30) NOT NULL,
        timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        detalle TEXT
      );
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS incidencia (
        id SERIAL PRIMARY KEY,
        alumno_id INT NOT NULL REFERENCES alumno(id),
        profesor_id INT NOT NULL REFERENCES profesor(id),
        materia_id INT NOT NULL REFERENCES materia(id),
        grupo_id INT NOT NULL REFERENCES grupo(id),
        tipo VARCHAR(50) NOT NULL,
        fecha TIMESTAMPTZ NOT NULL,
        descripcion TEXT NOT NULL
      );
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS sancion (
        id SERIAL PRIMARY KEY,
        alumno_id INT NOT NULL REFERENCES alumno(id),
        profesor_id INT NOT NULL REFERENCES profesor(id),
        regla VARCHAR(100) NOT NULL,
        fecha TIMESTAMPTZ NOT NULL,
        detalle TEXT
      );
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE IF EXISTS sancion`);
        await queryRunner.query(`DROP TABLE IF EXISTS incidencia`);
        await queryRunner.query(`DROP TABLE IF EXISTS auditoria_cargas`);
        await queryRunner.query(`DROP TABLE IF EXISTS validacion_resultado`);
        await queryRunner.query(`DROP TABLE IF EXISTS archivo_cargado`);
        await queryRunner.query(`DROP TABLE IF EXISTS optativa_progreso`);
        await queryRunner.query(`DROP TABLE IF EXISTS asignacion_profesor`);
        await queryRunner.query(`DROP TABLE IF EXISTS calificacion`);
        await queryRunner.query(`DROP TABLE IF EXISTS kardex`);
        await queryRunner.query(`DROP TABLE IF EXISTS inscripcion`);
        await queryRunner.query(`DROP TABLE IF EXISTS horario`);
        await queryRunner.query(`DROP TABLE IF EXISTS grupo`);
        await queryRunner.query(`DROP TABLE IF EXISTS periodo`);
        await queryRunner.query(`DROP TABLE IF EXISTS materia`);
        await queryRunner.query(`DROP TABLE IF EXISTS profesor`);
        await queryRunner.query(`DROP TABLE IF EXISTS alumno`);
        await queryRunner.query(`DROP TABLE IF EXISTS plan_estudio`);
        await queryRunner.query(`DO $$ BEGIN DROP TYPE IF EXISTS severidad; EXCEPTION WHEN undefined_object THEN NULL; END $$;`);
        await queryRunner.query(`DO $$ BEGIN DROP TYPE IF EXISTS rol_docente; EXCEPTION WHEN undefined_object THEN NULL; END $$;`);
        await queryRunner.query(`DO $$ BEGIN DROP TYPE IF EXISTS estatus_inscripcion; EXCEPTION WHEN undefined_object THEN NULL; END $$;`);
        await queryRunner.query(`DO $$ BEGIN DROP TYPE IF EXISTS tipo_materia; EXCEPTION WHEN undefined_object THEN NULL; END $$;`);
        await queryRunner.query(`DO $$ BEGIN DROP TYPE IF EXISTS estado_academico; EXCEPTION WHEN undefined_object THEN NULL; END $$;`);
    }
}
exports.InitSchema1700000000000 = InitSchema1700000000000;
