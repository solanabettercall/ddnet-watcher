import { BaseEventDto } from 'src/modules/observer/abstract/base-event.dto';
import { IServerContext } from 'src/modules/observer/interfaces/server-context.interface';
import { IVoteResultEvent } from 'src/modules/observer/interfaces/vote-result-event.interface';

export class VoteResultEventDto
  extends BaseEventDto
  implements IVoteResultEvent
{
  constructor(server: IServerContext, dto: IVoteResultEvent) {
    super(server);
    Object.assign(this, dto);
  }
  success: boolean;

  toString(): string {
    return `Голосование ${this.success ? 'прошло' : 'не прошло'}`;
  }
}
