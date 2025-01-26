import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ServerDiscoveryApiService } from '../server-discovery/server-discovery-api.service';
import { ServerDiscoveryService } from '../server-discovery/server-discovery.service';
import { Server } from '../event-storage/entities/server.entity';
import { ObserverManagerService } from '../observer/observer-manager.service';

@Injectable()
export class ObserverConnnecterService implements OnApplicationBootstrap {
  constructor(
    private readonly serverDiscoveryService: ServerDiscoveryService,
    private readonly observerManagerService: ObserverManagerService,
  ) {}

  async onApplicationBootstrap() {
    return;
    const servers: Server[] = await this.serverDiscoveryService.getServers();

    const serverNames = [
      'DDNet RUS1 - Novice',
      'DDNet RUS2 - Novice',
      'DDNet RUS3 - Novice',
      'DDNet RUS4 - Novice',
      'DDNet RUS5 - Novice',
    ];

    const mapNames = ['Kobra', 'Kobra 2', 'Kobra 3', 'Kobra 4'];

    const filteredServers = servers.filter(
      (server) =>
        serverNames.includes(server.name) && mapNames.includes(server.map.name),
    );

    for (const server of filteredServers) {
      await this.observerManagerService.addObserver({
        address: server.address,
        botName: 'Watcher',
      });
    }
  }
}
