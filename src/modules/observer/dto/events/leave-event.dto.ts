import { Player } from 'src/modules/event-storage/entities/player.entity';
import { BaseEventDto } from '../../abstract/base-event.dto';
import { ILeaveEvent } from '../../interfaces/leave-event.interface';
import { IServerContext } from '../../interfaces/server-context.interface';

export class LeaveEventDto extends BaseEventDto implements ILeaveEvent {
  constructor(server: IServerContext, dto: ILeaveEvent) {
    super(server);
    Object.assign(this, dto);
  }
  target: Player;

  toString(): string {
    return `Игрок ${this.target.name} покинул игру.`;
  }
}
