import {
  Entity,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
  Unique,
  Column,
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

  constructor(dto: IServerContext) {
    Object.assign(this, dto);
  }
}
