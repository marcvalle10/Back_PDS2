import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { ArchivoCargado } from './ArchivoCargado';

@Entity('auditoria_cargas')
export class AuditoriaCargas {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ArchivoCargado, (a) => a.auditorias, { nullable: false, onDelete: 'CASCADE' })
  archivo!: ArchivoCargado;

  @Column({ type: 'varchar', length: 50 })
  etapa!: string;

  @Column({ type: 'varchar', length: 30 })
  estado!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  timestamp!: Date;

  @Column({ type: 'text', nullable: true })
  detalle!: string | null;
}
