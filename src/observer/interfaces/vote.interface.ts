export enum VoteType {
  Option = 'option',
  Ban = 'kick',
  Spectate = 'spectate',
}

export interface IVote {
  voter: string;
  target: string;
  reason: string | null;

  type: VoteType;
}
