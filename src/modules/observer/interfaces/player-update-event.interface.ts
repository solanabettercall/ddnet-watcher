import { Player } from 'src/modules/event-storage/entities/player.entity';

export interface IPlayerUpdateEvent {
  oldPlayer: Player;
  newPlayer: Player;
}
