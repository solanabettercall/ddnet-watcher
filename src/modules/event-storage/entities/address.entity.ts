import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';
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
}
