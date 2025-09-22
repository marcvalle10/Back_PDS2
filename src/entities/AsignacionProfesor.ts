import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique } from 'typeorm';
import { Grupo } from './Grupo';
import { Profesor } from './Profesor';

export enum RolDocente {
  TITULAR = 'TITULAR',
  AUXILIAR = 'AUXILIAR',
  PRACTICAS = 'PRACTICAS',
}

@Entity('asignacion_profesor')
@Unique('uq_asignacion_profesor', ['grupo', 'profesor', 'rol_docente'])
export class AsignacionProfesor {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Grupo, (g) => g.asignaciones, { nullable: false, onDelete: 'CASCADE' })
  grupo!: Grupo;

  @ManyToOne(() => Profesor, (p) => p.asignaciones, { nullable: false })
  profesor!: Profesor;

  @Column({ type: 'enum', enum: RolDocente, default: RolDocente.TITULAR })
  rol_docente!: RolDocente;
}
