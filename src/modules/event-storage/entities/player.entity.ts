import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Clan } from './clan.entity';

@Entity('players')
@Unique(['name', 'clan'])
export class Player {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column({
    name: 'name',
    nullable: false,
    unique: true,
  })
  name: string;

  @ManyToOne(() => Clan, { nullable: true, eager: true, cascade: true })
  @JoinColumn({ name: 'clan_id' })
  clan?: Clan;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
  })
  updatedAt: Date;

  constructor(name: string, clan?: string) {
    this.name = name;
    this.clan = clan ? new Clan(clan) : null;
  }

  equals(other: Player): boolean {
    if (!other) return false;

    // Сравнение имени и клана
    return (
      this.name === other.name &&
      (this.clan?.name || null) === (other.clan?.name || null)
    );
  }
}
