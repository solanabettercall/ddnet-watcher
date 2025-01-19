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
import { IKickEvent } from 'src/modules/observer/interfaces/kick-event.interface';

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

  @ManyToOne(() => Server, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'server_id' })
  server: Server;

  constructor(dto: IKickEvent) {
    Object.assign(this, dto);
  }
}
