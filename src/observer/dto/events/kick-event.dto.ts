import { IKick } from 'src/observer/interfaces/kick.interface';
import { BaseEventDto } from '../../abstract/base-event.dto';
import { IServerContext } from '../../interfaces/server-context.interface';

export class KickEventDto extends BaseEventDto implements IKick {
  constructor(server: IServerContext, dto: IKick) {
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
