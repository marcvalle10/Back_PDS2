import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Alumno } from './Alumno';
import { Materia } from './Materia';

@Entity('plan_estudio')
export class PlanEstudio {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 150 })
  nombre!: string;

  @Column({ type: 'varchar', length: 50 })
  version!: string;

  @Column({ type: 'int' })
  total_creditos!: number;

  @Column({ type: 'int' })
  semestres_sugeridos!: number;

  @OneToMany(() => Alumno, (a) => a.planEstudio)
  alumnos!: Alumno[];

  @OneToMany(() => Materia, (m) => m.planEstudio)
  materias!: Materia[];
}
