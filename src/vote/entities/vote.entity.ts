import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Vote {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column({
    name: 'voter',
    nullable: false,
  })
  voter: string;

  @Column({
    name: 'target',
    nullable: false,
  })
  target: string;
}
