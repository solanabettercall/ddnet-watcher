import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
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

  @ManyToOne(() => Clan, { nullable: true, eager: true })
  @JoinColumn({ name: 'clan_id' })
  clan?: Clan;
}
