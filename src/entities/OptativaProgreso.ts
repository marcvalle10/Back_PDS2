import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, Unique } from 'typeorm';
import { Alumno } from './Alumno';

@Entity('optativa_progreso')
@Unique('uq_optativa_progreso_alumno', ['alumno'])
export class OptativaProgreso {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => Alumno, (a) => a.optativaProgreso, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'alumno_id' })
  alumno!: Alumno;

  @Column({ type: 'int', default: 0 })
  creditos_optativos_cursados!: number;

  @Column({ type: 'int', default: 0 })
  creditos_optativos_requeridos!: number;
}
