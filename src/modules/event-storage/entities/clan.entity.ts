import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

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
