import { BaseEventDto } from 'src/observer/abstract/base-event.dto';
import { IServerContext } from 'src/observer/interfaces/server-context.interface';
import { IVoteResult } from 'src/observer/interfaces/vote-result.interface';

export class VoteResultEventDto extends BaseEventDto implements IVoteResult {
  constructor(server: IServerContext, dto: IVoteResult) {
    super(server);
    Object.assign(this, dto);
  }
  success: boolean;

  toString(): string {
    return `Голосование ${this.success ? 'прошло' : 'не прошло'}`;
  }
}
