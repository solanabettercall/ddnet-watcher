import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Server } from './server.entity';
import { Player } from './player.entity';

@Entity('kicks')
export class Kick {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @ManyToOne(() => Player, {
    nullable: false,
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'player_id' })
  target: Player;

  @Column({
    name: 'reason',
    nullable: true,
  })
  reason?: string;

  @ManyToOne(() => Server, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'server_id' })
  server: Server;
}
