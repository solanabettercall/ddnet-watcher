import { Player } from 'src/modules/event-storage/entities/player.entity';
import { BaseEventDto } from '../../abstract/base-event.dto';
import { IJoinEvent } from '../../interfaces/join-event.interface';
import { IServerContext } from '../../interfaces/server-context.interface';

export class JoinEventDto extends BaseEventDto implements IJoinEvent {
  constructor(server: IServerContext, dto: IJoinEvent) {
    super(server);
    Object.assign(this, dto);
  }
  target: Player;

  toString(): string {
    return `Игрок ${this.target.name} вошёл в игру.`;
  }
}
