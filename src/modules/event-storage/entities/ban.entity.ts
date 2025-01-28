import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Server } from './server.entity';
import { Player } from './player.entity';
import { IBanEvent } from 'src/modules/observer/interfaces/ban-event.interface';

@Entity('bans')
export class Ban {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  constructor(ban: IBanEvent) {
    Object.assign(this, ban);
  }
}
