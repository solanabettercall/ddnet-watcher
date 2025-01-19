import { Player } from 'src/modules/event-storage/entities/player.entity';

export enum VoteType {
  Option = 'option',
  Ban = 'kick',
  Spectate = 'spectate',
}

export interface IVoteEvent {
  voter: Player;
  target?: Player;
  option?: string;
  reason: string | null;

  type: VoteType;
}
