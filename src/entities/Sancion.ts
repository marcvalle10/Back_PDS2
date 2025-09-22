import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Alumno } from './Alumno';
import { Profesor } from './Profesor';

@Entity('sancion')
export class Sancion {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Alumno, (a) => a.sanciones, { nullable: false })
  alumno!: Alumno;

  @ManyToOne(() => Profesor, (p) => p.sanciones, { nullable: false })
  profesor!: Profesor;

  @Column({ type: 'varchar', length: 100 })
  regla!: string;

  @Column({ type: 'timestamptz' })
  fecha!: Date;

  @Column({ type: 'text', nullable: true })
  detalle!: string | null;
}
