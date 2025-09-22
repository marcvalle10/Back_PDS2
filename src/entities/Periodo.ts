import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Unique } from 'typeorm';
import { Grupo } from './Grupo';
import { Inscripcion } from './Inscripcion';
import { Kardex } from './Kardex';

@Entity('periodo')
@Unique('uq_periodo_etiqueta', ['etiqueta'])
export class Periodo {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  anio!: number;

  @Column({ type: 'int', comment: '1=Ene-Jun, 2=Ago-Dic, o similar' })
  ciclo!: number;

  @Column({ type: 'varchar', length: 50 })
  etiqueta!: string;

  @Column({ type: 'date' })
  fecha_inicio!: string;

  @Column({ type: 'date' })
  fecha_fin!: string;

  @OneToMany(() => Grupo, (g) => g.periodo)
  grupos!: Grupo[];

  @OneToMany(() => Inscripcion, (i) => i.periodo)
  inscripciones!: Inscripcion[];

  @OneToMany(() => Kardex, (k) => k.periodo)
  kardex!: Kardex[];
}
