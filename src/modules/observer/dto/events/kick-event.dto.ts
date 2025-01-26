import { IKickEvent } from 'src/modules/observer/interfaces/kick-event.interface';
import { BaseEventDto } from '../../abstract/base-event.dto';
import { IServerContext } from '../../interfaces/server-context.interface';
import { Player } from 'src/modules/event-storage/entities/player.entity';

export class KickEventDto extends BaseEventDto implements IKickEvent {
  constructor(server: IServerContext, dto: IKickEvent) {
    super(server);
    Object.assign(this, dto);
  }
  target: Player;

  reason: string | null;

  toString(): string {
    if (this.reason) {
      return `'${this.target.name}' исключен по причине: '${this.reason}'.`;
    } else {
      return `'${this.target.name}' исключен.`;
    }
  }
}
