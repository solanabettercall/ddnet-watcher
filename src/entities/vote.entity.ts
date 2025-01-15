import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { Player } from './player.entity';
import { VoteType } from 'src/modules/observer/interfaces/vote-event.interface';
import { Server } from './server.entity';

@Entity('votes')
export class Vote {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @ManyToOne(() => Player, {
    nullable: false,
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'voter_id' })
  voter: Player;

  @ManyToOne(() => Player, {
    nullable: true,
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'target_id' })
  target?: Player;

  @Column({
    name: 'option',
    nullable: true,
  })
  option?: string;

  @Column({
    name: 'reason',
    nullable: true,
  })
  reason?: string;

  @Column({
    type: 'enum',
    enum: VoteType,
    enumName: 'vote_type_enum',
    name: 'type',
    nullable: false,
  })
  type: VoteType;

  @Column({
    name: 'is_success',
    type: 'boolean',
    nullable: false,
    default: false,
  })
  isSuccess: boolean;

  @ManyToOne(() => Server, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'server_id' })
  server: Server;
}
