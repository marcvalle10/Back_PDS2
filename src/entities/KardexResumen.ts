import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, JoinColumn, CreateDateColumn } from 'typeorm';
import { Alumno } from './Alumno';
import { ArchivoCargado } from './ArchivoCargado';

@Entity({ name: 'kardex_resumen' })
export class KardexResumen {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Alumno, { nullable: true })
  @JoinColumn({ name: 'alumno_id' })
  alumno?: Alumno | null;

  @ManyToOne(() => ArchivoCargado, { nullable: false })
  @JoinColumn({ name: 'archivo_id' })
  archivo!: ArchivoCargado;

  @Column({ type: 'varchar', length: 16, nullable: true })
  periodo?: string | null;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  promedio_periodo?: number | null;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  promedio_kardex?: number | null;

  @Column({ type: 'int', nullable: true }) creditos_apr?: number | null;
  @Column({ type: 'int', nullable: true }) creditos_rep?: number | null;
  @Column({ type: 'int', nullable: true }) creditos_ins?: number | null;

  @Column({ type: 'int', nullable: true }) materias_apr?: number | null;
  @Column({ type: 'int', nullable: true }) materias_rep?: number | null;
  @Column({ type: 'int', nullable: true }) materias_nmr?: number | null;
  @Column({ type: 'int', nullable: true }) materias_ins?: number | null;

  @CreateDateColumn({ name: 'creado_en' })
  creado_en!: Date;
}
