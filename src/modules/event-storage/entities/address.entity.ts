import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IAddress } from '../interfaces';

@Entity('addresses')
@Unique(['scheme', 'host', 'port'])
export class Address implements IAddress {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column({
    name: 'scheme',
    nullable: false,
  })
  scheme: string;

  @Column({
    name: 'host',
    nullable: false,
  })
  host: string;

  @Column({
    name: 'port',
    type: 'smallint',
    nullable: false,
  })
  port: number;

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

  constructor(host: string, port: number, scheme: string = 'tw-0.7+udp') {
    this.host = host;
    this.port = port;
    this.scheme = scheme;
  }
}
