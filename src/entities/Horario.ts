import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique } from 'typeorm';
import { Grupo } from './Grupo';

@Entity('horario')
@Unique('uq_horario_bloque', ['grupo', 'dia_semana', 'hora_inicio', 'hora_fin', 'aula'])
export class Horario {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Grupo, (g) => g.horarios, { nullable: false, onDelete: 'CASCADE' })
  grupo!: Grupo;

  @Column({ type: 'int', comment: '1=Lunes ... 7=Domingo' })
  dia_semana!: number;

  @Column({ type: 'time without time zone' })
  hora_inicio!: string;

  @Column({ type: 'time without time zone' })
  hora_fin!: string;

  @Column({ type: 'varchar', length: 50 })
  aula!: string;
}
