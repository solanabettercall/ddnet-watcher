import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import * as ipaddr from 'ipaddr.js';
import { parse } from 'uri-js';
import { ServerDiscoveryApiService } from './server-discovery-api.service';
import { Address } from 'src/entities/address.entity';
import { Server } from 'src/entities/server.entity';
import { MapInfo } from 'src/entities/map.entity';

@Injectable()
export class ServerDiscoveryService implements OnApplicationBootstrap {
  constructor(
    private readonly serverDiscoveryApiService: ServerDiscoveryApiService,
  ) {}

  private parseAddress(addressString: string): Address {
    const parsed = parse(addressString);
    const address = new Address();

    address.host = ipaddr.parse(parsed.host!).toNormalizedString();
    address.port = parsed.port ? parseInt(String(parsed.port), 10) : 0;
    address.scheme = parsed.scheme;

    return address;
  }

  private async getServers(): Promise<Server[]> {
    const rawServers = await this.serverDiscoveryApiService.fetchServers();

    return rawServers.map((rawServer) => {
      const server = new Server();

      server.map = new MapInfo();
      server.map.name = rawServer.info.map.name;
      // TODO: Выбирать наиболее подходящий сервер (последняя версия), неподдерживаемые протоколы отбрасывать
      server.address = this.parseAddress(rawServer.addresses[0]);
      return server;
    });
  }

  async onApplicationBootstrap() {
    const servers = await this.getServers();

    console.log(servers);
  }
}
