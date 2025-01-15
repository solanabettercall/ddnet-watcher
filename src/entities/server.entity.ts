import {
  Entity,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import { Address } from './address.entity';
import { Map } from './map.entity';

@Entity('servers')
@Unique(['address', 'map'])
export class Server {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @ManyToOne(() => Address, { nullable: false, eager: true })
  @JoinColumn({ name: 'address_id' })
  address: Address;

  @ManyToOne(() => Map, { nullable: false, eager: true })
  @JoinColumn({ name: 'map_id' })
  map: Map;
}
