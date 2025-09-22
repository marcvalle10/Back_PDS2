import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique, CreateDateColumn } from 'typeorm';
import { Alumno } from './Alumno';
import { Periodo } from './Periodo';

export enum EstatusInscripcion {
  INSCRITO = 'INSCRITO',
  BAJA = 'BAJA',
  PENDIENTE = 'PENDIENTE',
}

@Entity('inscripcion')
@Unique('uq_inscripcion_alumno_periodo', ['alumno', 'periodo'])
export class Inscripcion {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Alumno, (a) => a.inscripciones, { nullable: false })
  alumno!: Alumno;

  @ManyToOne(() => Periodo, (p) => p.inscripciones, { nullable: false })
  periodo!: Periodo;

  @Column({ type: 'enum', enum: EstatusInscripcion, default: EstatusInscripcion.INSCRITO })
  estatus!: EstatusInscripcion;

  @CreateDateColumn({ type: 'timestamptz' })
  fecha_alta!: Date;
}