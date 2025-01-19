import { Player } from 'src/modules/event-storage/entities/player.entity';
import { BaseEventDto } from '../../abstract/base-event.dto';
import { IBanEvent } from '../../interfaces/ban-event.interface';
import { IServerContext } from '../../interfaces/server-context.interface';

export class BanEventDto extends BaseEventDto implements IBanEvent {
  target: Player;

  until?: Date;

  reason: string;

  constructor(server: IServerContext, dto: IBanEvent) {
    super(server);
    Object.assign(this, dto);
  }

  toString(): string {
    const untilText = this.until
      ? `до ${this.until.toISOString()}`
      : 'навсегда';
    return `Игрок '${this.target.name}' забанен ${untilText} по причине: '${this.reason}'.`;
  }
}
