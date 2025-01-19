import { Player } from 'src/modules/event-storage/entities/player.entity';

export interface IJoinEvent {
  target: Player;
}
