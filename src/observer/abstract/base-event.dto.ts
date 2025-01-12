import { IServerContext } from '../interfaces/server-context.interface';

export abstract class BaseEventDto {
  constructor(public server: IServerContext) {}
}
