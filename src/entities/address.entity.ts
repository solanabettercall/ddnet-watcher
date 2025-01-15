import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity('addresses')
@Unique(['scheme', 'host', 'port'])
export class Address {
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
    nullable: false,
  })
  port: string;
}
