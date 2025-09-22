import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { Kardex } from './Kardex';
import { Materia } from './Materia';

@Entity('calificacion')
export class Calificacion {
  @PrimaryGeneratedColumn()
  id!: number;

  // Relación 1:1 con Kardex (consolida)
  @OneToOne(() => Kardex, (k) => k.detalleCalificacion, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'kardex_id' })
  kardex!: Kardex;

  // Además ligada a Materia (según diagrama)
  @ManyToOne(() => Materia, (m) => m.calificaciones, { nullable: false })
  materia!: Materia;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  ordinario!: string | null;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  extraordinario!: string | null;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  final!: string | null;

  @Column({ type: 'date', nullable: true })
  fecha_cierre!: string | null;
}
