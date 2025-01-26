import { Player } from '../entities/player.entity';
import { Vote } from '../entities/vote.entity';

export interface IPlayerFullInfo extends Omit<Player, 'equals'> {
  numberOfVotes: {
    lastHour: number;
    lastDay: number;
    allTime: number;
  };
  totalBanCount: number;
  totalBanDuration: number;
}

export interface IVoteFullInfo extends Omit<Vote, 'voter' | 'target'> {
  voter: IPlayerFullInfo;
  target?: IPlayerFullInfo;
}

// export interface IVoteFullInfo implements IVoteWithoutVoterTarget {}
