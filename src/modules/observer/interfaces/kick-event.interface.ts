import { Player } from 'src/modules/event-storage/entities/player.entity';

export interface IKickEvent {
  target: Player;
  reason: string | null;
}
