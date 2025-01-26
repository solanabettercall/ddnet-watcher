import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Player } from './player.entity';
import {
  IVoteEvent,
  VoteType,
} from 'src/modules/observer/interfaces/vote-event.interface';
import { Server } from './server.entity';
import { IServerContext } from 'src/modules/observer/interfaces/server-context.interface';

@Entity('votes')
export class Vote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Player, {
    nullable: false,
    eager: true,
    onDelete: 'CASCADE',
    cascade: true,
  })
  @JoinColumn({ name: 'voter_id' })
  voter: Player;

  @ManyToOne(() => Player, {
    nullable: true,
    eager: true,
    onDelete: 'CASCADE',
    cascade: true,
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
  isSuccess: boolean = false;

  @ManyToOne(() => Server, {
    nullable: false,
    onDelete: 'CASCADE',
    cascade: true,
  })
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

  constructor(dto: IVoteEvent & { server: IServerContext }) {
    Object.assign(this, dto);
  }
}
