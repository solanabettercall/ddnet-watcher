import { Player } from 'src/modules/event-storage/entities/player.entity';
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
  voter: Player;
  target?: Player;
  option?: string;
  reason: string | null;
  type: VoteType;

  toString(): string {
    const targetName = this.target?.name || this.option;
    const voterName = this.voter.name;
    switch (this.type) {
      case VoteType.Ban: {
        if (this.reason === 'No reason given' || !this.reason) {
          return `'${voterName}' проголосовал за исключение '${targetName}'.`;
        } else {
          return `'${voterName}' проголосовал за исключение '${targetName}'. По причине: '${this.reason}'`;
        }
      }

      case VoteType.Spectate: {
        if (this.reason === 'No reason given' || !this.reason) {
          return `'${voterName}' проголосовал за перевод в наблюдатели '${targetName}'.`;
        } else {
          return `'${voterName}' проголосовал за перевод в наблюдатели '${targetName}'. По причине: '${this.reason}'`;
        }
      }

      case VoteType.Option: {
        if (this.reason === 'No reason given' || !this.reason) {
          return `'${voterName}' проголосовал за '${targetName}'.`;
        } else {
          return `'${voterName}' проголосовал за '${targetName}'. По причине: '${this.reason}'`;
        }
      }
    }
  }
}
