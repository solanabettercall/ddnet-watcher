import { IKickEvent } from 'src/modules/observer/interfaces/kick-event.interface';
import { BaseEventDto } from '../../abstract/base-event.dto';
import { IServerContext } from '../../interfaces/server-context.interface';

export class KickEventDto extends BaseEventDto implements IKickEvent {
  constructor(server: IServerContext, dto: IKickEvent) {
    super(server);
    Object.assign(this, dto);
  }

  target: string;
  reason: string | null;

  toString(): string {
    if (this.reason) {
      return `'${this.target}' исключен по причине: '${this.reason}'.`;
    } else {
      return `'${this.target}' исключен.`;
    }
  }
}
