import {
  Entity,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
  Unique,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Address } from './address.entity';
import { MapInfo } from './map.entity';
import { IServerContext } from 'src/modules/observer/interfaces/server-context.interface';

@Entity('servers')
@Unique(['address', 'map'])
export class Server implements IServerContext {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @ManyToOne(() => Address, { nullable: false, eager: true, cascade: true })
  @JoinColumn({ name: 'address_id' })
  address: Address;

  @ManyToOne(() => MapInfo, { nullable: false, eager: true, cascade: true })
  @JoinColumn({ name: 'map_id' })
  map: MapInfo;

  @Column({
    name: 'name',
    nullable: false,
    unique: false,
  })
  name: string;

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

  constructor(dto: IServerContext) {
    Object.assign(this, dto);
  }
}
