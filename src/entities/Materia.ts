import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, Unique } from 'typeorm';
import { PlanEstudio } from './PlanEstudio';
import { Grupo } from './Grupo';
import { Kardex } from './Kardex';
import { Calificacion } from './Calificacion';

export enum TipoMateria {
  OBLIGATORIA = 'OBLIGATORIA',
  OPTATIVA = 'OPTATIVA',
}

@Entity('materia')
@Unique('uq_materia_codigo', ['codigo'])
export class Materia {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 20 })
  codigo!: string;

  @Column({ type: 'varchar', length: 150 })
  nombre!: string;

  @Column({ type: 'int' })
  creditos!: number;

  @Column({ type: 'enum', enum: TipoMateria, default: TipoMateria.OBLIGATORIA })
  tipo!: TipoMateria;

  @ManyToOne(() => PlanEstudio, (p) => p.materias, { nullable: false })
  planEstudio!: PlanEstudio;

  @OneToMany(() => Grupo, (g) => g.materia)
  grupos!: Grupo[];

  @OneToMany(() => Kardex, (k) => k.materia)
  kardex!: Kardex[];

  @OneToMany(() => Calificacion, (c) => c.materia)
  calificaciones!: Calificacion[];
}
