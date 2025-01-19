import { BaseEventDto } from '../../abstract/base-event.dto';
import { ILeaveEvent } from '../../interfaces/leave-event.interface';
import { IServerContext } from '../../interfaces/server-context.interface';

export class LeaveEventDto extends BaseEventDto implements ILeaveEvent {
  target: string;

  constructor(server: IServerContext, dto: ILeaveEvent) {
    super(server);
    Object.assign(this, dto);
  }

  toString(): string {
    return `Игрок ${this.target} покинул игру.`;
  }
}
