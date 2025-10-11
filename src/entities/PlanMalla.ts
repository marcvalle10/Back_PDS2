import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, JoinColumn } from 'typeorm';
import { PlanEstudio } from './PlanEstudio';
import { Materia } from './Materia';

@Entity({ name: 'plan_malla' })
export class PlanMalla {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => PlanEstudio, { eager: false })
  @JoinColumn({ name: 'plan_estudio_id' })
  plan_estudio!: PlanEstudio;

  @ManyToOne(() => Materia, { eager: false })
  @JoinColumn({ name: 'materia_id' })
  materia!: Materia;

  @Column({ type: 'int', nullable: false })
  semestre_sugerido!: number;

  @ManyToOne(() => Materia, { eager: false, nullable: true })
  @JoinColumn({ name: 'prerrequisito_id' })
  prerrequisito?: Materia | null;
}
