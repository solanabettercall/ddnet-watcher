import { BaseEventDto } from '../../abstract/base-event.dto';
import { IBanEvent } from '../../interfaces/ban-event.interface';
import { IServerContext } from '../../interfaces/server-context.interface';

export class BanEventDto extends BaseEventDto implements IBanEvent {
  target: string;

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
    return `[${this.server.ip}:${this.server.port}] '${this.target}' забанен ${untilText} по причине: '${this.reason}'.`;
  }
}
