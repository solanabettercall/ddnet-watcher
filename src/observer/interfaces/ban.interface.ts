export interface IBan {
  target: string;

  until?: Date;

  reason: string;
}
