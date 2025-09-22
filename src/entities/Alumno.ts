import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, OneToOne, Unique, Index } from 'typeorm';
import { PlanEstudio } from './PlanEstudio';
import { Inscripcion } from './Inscripcion';
import { Kardex } from './Kardex';
import { OptativaProgreso } from './OptativaProgreso';
import { Incidencia } from './Incidencia';
import { Sancion } from './Sancion';

export enum EstadoAcademico {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
  BAJA = 'BAJA',
  EGRESADO = 'EGRESADO',
}

@Entity('alumno')
@Unique('uq_alumno_matricula', ['matricula'])
@Index('ix_alumno_nombre', ['nombre', 'apellido_paterno', 'apellido_materno'])
export class Alumno {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 20 })
  matricula!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  expediente!: string | null;

  @Column({ type: 'varchar', length: 100 })
  nombre!: string;

  @Column({ type: 'varchar', length: 100 })
  apellido_paterno!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  apellido_materno!: string | null;

  @Column({ type: 'varchar', length: 150 })
  correo!: string;

  @Column({ type: 'enum', enum: EstadoAcademico, default: EstadoAcademico.ACTIVO })
  estado_academico!: EstadoAcademico;

  @Column({ type: 'varchar', length: 50, nullable: true })
  nivel_ingles_actual!: string | null;

  @Column({ type: 'int', default: 0 })
  total_creditos!: number;

  @ManyToOne(() => PlanEstudio, (p) => p.alumnos, { nullable: false })
  planEstudio!: PlanEstudio;

  @OneToMany(() => Inscripcion, (i) => i.alumno)
  inscripciones!: Inscripcion[];

  @OneToMany(() => Kardex, (k) => k.alumno)
  kardex!: Kardex[];

  @OneToOne(() => OptativaProgreso, (op) => op.alumno)
  optativaProgreso!: OptativaProgreso;

  @OneToMany(() => Incidencia, (i) => i.alumno)
  incidencias!: Incidencia[];

  @OneToMany(() => Sancion, (s) => s.alumno)
  sanciones!: Sancion[];
}
