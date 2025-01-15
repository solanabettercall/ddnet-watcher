import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('maps')
export class MapInfo {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column({
    name: 'name',
    nullable: false,
    unique: true,
  })
  name: string;
}
