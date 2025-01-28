import { Ban } from '../entities/ban.entity';
import { Player } from '../entities/player.entity';

export interface IPlayerFullInfo extends Omit<Player, 'equals'> {
  numberOfVotes: {
    lastHour: number;
    lastDay: number;
    allTime: number;
  };
  totalBanCount: number;
  totalBanDuration: number;
}

export interface IBanFullInfo extends Omit<Ban, 'target'> {
  target: IPlayerFullInfo;
}
