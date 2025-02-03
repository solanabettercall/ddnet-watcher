import { Inject, Injectable } from '@nestjs/common';

import { ObserverService } from './observer.service';
import { ObserverServiceConfigDto } from './dto/observer-service-config.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Address } from '../event-storage/entities/address.entity';
import { ServerDiscoveryCacheService } from '../server-discovery/server-discovery-cache.service';
import { ObserverFactoryServiceConfigDto } from './dto/observer-factory-service-config.dto';
import { Server } from '../event-storage/entities/server.entity';
import { MapInfo } from '../event-storage/entities/map.entity';
import { ServerDiscoveryService } from '../server-discovery/server-discovery.service';

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
      const { host, port } = config.address;
      const address = new Address(host, port);
      const map = new MapInfo('Unknown');

      const server = new Server({
        address,
        map,
        name: 'Unknown',
      });

      return new ObserverService(
        this.eventEmitter,
        {
          server,
          botName: config.botName,
          skin: config.skin,
        },
        this.serverDiscoveryCacheService,
      );
    }

    return new ObserverService(
      this.eventEmitter,
      {
        server,
        botName: config.botName,
        skin: config.skin,
      },
      this.serverDiscoveryCacheService,
    );
  }
}
