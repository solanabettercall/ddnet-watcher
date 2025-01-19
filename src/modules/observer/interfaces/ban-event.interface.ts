import { Player } from 'src/modules/event-storage/entities/player.entity';

export interface IBanEvent {
  target: Player;

  until?: Date;

  reason: string;
}
