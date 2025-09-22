import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, Unique } from 'typeorm';
import { Alumno } from './Alumno';
import { Materia } from './Materia';
import { Periodo } from './Periodo';
import { Calificacion } from './Calificacion';

@Entity('kardex')
@Unique('uq_kardex_alumno_materia_periodo', ['alumno', 'materia', 'periodo'])
export class Kardex {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Alumno, (a) => a.kardex, { nullable: false })
  alumno!: Alumno;

  @ManyToOne(() => Materia, (m) => m.kardex, { nullable: false })
  materia!: Materia;

  @ManyToOne(() => Periodo, (p) => p.kardex, { nullable: false })
  periodo!: Periodo;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  calificacion!: string | null;

  @Column({ type: 'varchar', length: 30 })
  estatus!: string;

  @Column({ type: 'int', default: 0 })
  promedio_kardex!: number;

  @Column({ type: 'int', default: 0 })
  promedio_sem_act!: number;

  @OneToOne(() => Calificacion, (c) => c.kardex)
  detalleCalificacion!: Calificacion;
}
