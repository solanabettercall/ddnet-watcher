import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('clans')
export class Clan {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column({
    name: 'name',
    nullable: false,
    unique: true,
  })
  name: string;
}
