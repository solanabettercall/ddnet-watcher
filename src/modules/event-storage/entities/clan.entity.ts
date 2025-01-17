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

  constructor(name: string) {
    this.name = name;
  }

  static create(name: string): Clan | null {
    if (!name || name.trim() === '') {
      return null;
    }
    return new Clan(name);
  }
}
