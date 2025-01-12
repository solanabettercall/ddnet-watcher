export class BanEventDto {
  target: string;

  until?: Date;

  reason: string;

  constructor(dto: Partial<BanEventDto>) {
    Object.assign(this, dto);
  }

  toString(): string {
    if (this.until) {
      const untilFormatted = this.until.toISOString();
      return `'${this.target}' забанен до ${untilFormatted} по причине: '${this.reason}'.`;
    } else {
      return `'${this.target}' забанен навсегда по причине: '${this.reason}'.`;
    }
  }
}
