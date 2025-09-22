import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Alumno } from './Alumno';
import { Profesor } from './Profesor';
import { Materia } from './Materia';
import { Grupo } from './Grupo';

@Entity('incidencia')
export class Incidencia {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Alumno, (a) => a.incidencias, { nullable: false })
  alumno!: Alumno;

  @ManyToOne(() => Profesor, (p) => p.incidencias, { nullable: false })
  profesor!: Profesor;

  @ManyToOne(() => Materia, (m) => m.kardex, { nullable: false })
  materia!: Materia;

  @ManyToOne(() => Grupo, (g) => g.incidencias, { nullable: false })
  grupo!: Grupo;

  @Column({ type: 'varchar', length: 50 })
  tipo!: string;

  @Column({ type: 'timestamptz' })
  fecha!: Date;

  @Column({ type: 'text' })
  descripcion!: string;
}
