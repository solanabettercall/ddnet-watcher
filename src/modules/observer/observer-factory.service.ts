import { Inject, Injectable } from '@nestjs/common';

import { ObserverService } from './observer.service';
import { ObserverServiceConfigDto } from './dto/observer-service-config.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Address } from '../event-storage/entities/address.entity';
import { ServerDiscoveryCacheService } from '../server-discovery/server-discovery-cache.service';
import { ObserverFactoryServiceConfigDto } from './dto/observer-factory-service-config.dto';
import { Server } from '../event-storage/entities/server.entity';
import { MapInfo } from '../event-storage/entities/map.entity';

@Injectable()
export class ObserverFactoryService {
  constructor(
    @Inject(EventEmitter2) private readonly eventEmitter: EventEmitter2,
    private readonly serverDiscoveryCacheService: ServerDiscoveryCacheService,
  ) {}

  async create(
    config: ObserverFactoryServiceConfigDto,
  ): Promise<ObserverService> {
    const server = await this.serverDiscoveryCacheService.getCachedServer({
      ...config.address,
    });

    if (!server) {
      const server = new Server();
      server.address = new Address();
      server.address.host = config.address.host;
      server.address.port = config.address.port;
      server.address.scheme = 'tw-0.7+udp';
      server.map = new MapInfo();

      return new ObserverService(this.eventEmitter, {
        server,
        botName: config.botName,
      });
    }

    return new ObserverService(this.eventEmitter, {
      server,
      botName: config.botName,
    });
  }
}
