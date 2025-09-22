import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, Index } from 'typeorm';
import { ValidacionResultado } from './ValidacionResultado';
import { AuditoriaCargas } from './AuditoriaCargas';

@Entity('archivo_cargado')
@Index('ix_archivo_tipo_fecha', ['tipo', 'fecha'])
export class ArchivoCargado {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 50 })
  tipo!: string;

  @Column({ type: 'varchar', length: 255 })
  nombre_archivo!: string;

  @Column({ type: 'varchar', length: 128 })
  hash!: string;

  @Column({ type: 'varchar', length: 100 })
  usuario!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  fecha!: Date;

  @Column({ type: 'varchar', length: 50, default: 'PENDIENTE' })
  estado_proceso!: string;

  @OneToMany(() => ValidacionResultado, (v) => v.archivo)
  validaciones!: ValidacionResultado[];

  @OneToMany(() => AuditoriaCargas, (a) => a.archivo)
  auditorias!: AuditoriaCargas[];
}
