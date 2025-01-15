import { BaseEventDto } from 'src/modules/observer/abstract/base-event.dto';
import { IServerContext } from 'src/modules/observer/interfaces/server-context.interface';
import {
  IVoteEvent,
  VoteType,
} from 'src/modules/observer/interfaces/vote-event.interface';

export class VoteEventDto extends BaseEventDto implements IVoteEvent {
  constructor(server: IServerContext, dto: IVoteEvent) {
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
      case VoteType.Ban: {
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
