import { BaseEventDto } from '../../abstract/base-event.dto';
import { IJoinEvent } from '../../interfaces/join-event.interface';
import { IServerContext } from '../../interfaces/server-context.interface';

export class JoinEventDto extends BaseEventDto implements IJoinEvent {
  target: string;

  constructor(server: IServerContext, dto: IJoinEvent) {
    super(server);
    Object.assign(this, dto);
  }

  toString(): string {
    return `Игрок ${this.target} вошёл в игру.`;
  }
}
