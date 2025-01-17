import { Address } from 'src/modules/event-storage/entities/address.entity';
import { MapInfo } from 'src/modules/event-storage/entities/map.entity';

export interface IServerContext {
  address: Address;
  map: MapInfo;
  name: string;
}
