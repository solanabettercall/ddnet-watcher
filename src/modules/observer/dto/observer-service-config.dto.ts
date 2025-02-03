import { Address } from 'src/modules/event-storage/entities/address.entity';
import { Server } from 'src/modules/event-storage/entities/server.entity';

export class ObserverServiceConfigDto {
  server: Server;
  botName: string;
  skin: string;
}
