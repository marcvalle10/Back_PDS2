import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, Unique } from 'typeorm';
import { Materia } from './Materia';
import { Periodo } from './Periodo';
import { Horario } from './Horario';
import { AsignacionProfesor } from './AsignacionProfesor';
import { Incidencia } from './Incidencia';

@Entity('grupo')
@Unique('uq_grupo_periodo_materia_clave', ['materia', 'periodo', 'clave_grupo'])
export class Grupo {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Materia, (m) => m.grupos, { nullable: false })
  materia!: Materia;

  @ManyToOne(() => Periodo, (p) => p.grupos, { nullable: false })
  periodo!: Periodo;

  @Column({ type: 'varchar', length: 30 })
  clave_grupo!: string;

  @Column({ type: 'int' })
  cupo!: number;

  @OneToMany(() => Horario, (h) => h.grupo)
  horarios!: Horario[];

  @OneToMany(() => AsignacionProfesor, (ap) => ap.grupo)
  asignaciones!: AsignacionProfesor[];

  @OneToMany(() => Incidencia, (i) => i.grupo)
  incidencias!: Incidencia[];
}
