import { BaseEventDto } from 'src/observer/abstract/base-event.dto';
import { IServerContext } from 'src/observer/interfaces/server-context.interface';
import { IVote, VoteType } from 'src/observer/interfaces/vote.interface';

export class VoteEventDto extends BaseEventDto implements IVote {
  constructor(server: IServerContext, dto: IVote) {
    if (dto.reason === 'No reason given') dto.reason = null;
    super(server);
    Object.assign(this, dto);
  }
  reason: string | null;
  voter: string;
  target: string;
  type: VoteType;

  toString(): string {
    switch (this.type) {
      case VoteType.Kick: {
        if (this.reason === 'No reason given' || !this.reason) {
          return `'${this.voter}' проголосовал за исключение '${this.target}'.`;
        } else {
          return `'${this.voter}' проголосовал за исключение '${this.target}'. По причине: '${this.reason}'`;
        }
      }

      case VoteType.Spectate: {
        if (this.reason === 'No reason given' || !this.reason) {
          return `'${this.voter}' проголосовал за перевод в наблюдатели '${this.target}'.`;
        } else {
          return `'${this.voter}' проголосовал за перевод в наблюдатели '${this.target}'. По причине: '${this.reason}'`;
        }
      }

      case VoteType.Option: {
        if (this.reason === 'No reason given' || !this.reason) {
          return `'${this.voter}' проголосовал за '${this.target}'.`;
        } else {
          return `'${this.voter}' проголосовал за '${this.target}'. По причине: '${this.reason}'`;
        }
      }
    }
  }
}
