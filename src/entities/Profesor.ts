import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Unique } from 'typeorm';
import { AsignacionProfesor } from './AsignacionProfesor';
import { Incidencia } from './Incidencia';
import { Sancion } from './Sancion';

@Entity('profesor')
@Unique('uq_profesor_num_empleado', ['num_empleado'])
export class Profesor {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  nombre!: string;

  @Column({ type: 'varchar', length: 100 })
  apellido_paterno!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  apellido_materno!: string | null;

  @Column({ type: 'varchar', length: 150 })
  correo!: string;

  @Column({ type: 'int' })
  num_empleado!: number;

  @OneToMany(() => AsignacionProfesor, (ap) => ap.profesor)
  asignaciones!: AsignacionProfesor[];

  @OneToMany(() => Incidencia, (i) => i.profesor)
  incidencias!: Incidencia[];

  @OneToMany(() => Sancion, (s) => s.profesor)
  sanciones!: Sancion[];
}
