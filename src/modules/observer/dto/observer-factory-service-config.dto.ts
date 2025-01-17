import { Address } from 'src/modules/event-storage/entities/address.entity';
import { Server } from 'src/modules/event-storage/entities/server.entity';
import { IAddress } from 'src/modules/event-storage/interfaces';

interface IObserveServiceAddress {
  host: string;
  port: number;
}

export class ObserverFactoryServiceConfigDto {
  address: IObserveServiceAddress;
  botName: string;
}
