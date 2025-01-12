export interface IServerContext {
  ip: string;
  port: number;
}

export interface IBanEvent {
  target: string;

  until?: Date;

  reason: string;
}

export abstract class EventDto {
  constructor(public server: IServerContext) {}
}

export class BanEventDto extends EventDto implements IBanEvent {
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
