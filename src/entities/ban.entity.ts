import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Server } from './server.entity';
import { Player } from './player.entity';

@Entity('bans')
export class Ban {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @ManyToOne(() => Player, { nullable: false, eager: true })
  @JoinColumn({ name: 'player_id' })
  target: Player;

  @Column({
    name: 'until',
    type: 'timestamp',
    nullable: true,
  })
  until?: Date;

  @Column({
    name: 'reason',
    nullable: false,
  })
  reason: string;

  @ManyToOne(() => Server, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'server_id' })
  server: Server;
}
