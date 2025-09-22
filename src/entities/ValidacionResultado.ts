import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index } from 'typeorm';
import { ArchivoCargado } from './ArchivoCargado';

export enum Severidad {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
}

@Entity('validacion_resultado')
@Index('ix_validacion_archivo_severidad', ['archivo', 'severidad'])
export class ValidacionResultado {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ArchivoCargado, (a) => a.validaciones, { nullable: false, onDelete: 'CASCADE' })
  archivo!: ArchivoCargado;

  @Column({ type: 'enum', enum: Severidad, default: Severidad.INFO })
  severidad!: Severidad;

  @Column({ type: 'varchar', length: 50 })
  regla_codigo!: string;

  @Column({ type: 'text' })
  descripcion!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  fila_origen!: string | null;
}
