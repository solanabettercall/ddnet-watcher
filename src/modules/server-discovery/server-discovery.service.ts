import { Injectable } from '@nestjs/common';
import * as ipaddr from 'ipaddr.js';
import { parse } from 'uri-js';
import { ServerDiscoveryApiService } from './server-discovery-api.service';
import { Address } from 'src/modules/event-storage/entities/address.entity';
import { Server } from 'src/modules/event-storage/entities/server.entity';
import { MapInfo } from 'src/modules/event-storage/entities/map.entity';
import { Player } from 'src/modules/event-storage/entities/player.entity';
import { Clan } from 'src/modules/event-storage/entities/clan.entity';

interface ServerInfo {
  server: Server;
  players: Player[];
}

@Injectable()
export class ServerDiscoveryService {
  constructor(
    private readonly serverDiscoveryApiService: ServerDiscoveryApiService,
  ) {}

  private parseAddress(addressString: string): Address {
    const parsed = parse(addressString);

    const parsedHost = ipaddr.parse(parsed.host!);
    const host = parsedHost.toNormalizedString();
    const port = parsed.port ? parseInt(String(parsed.port), 10) : 0;
    const scheme = parsed.scheme;
    const address = new Address(host, port, scheme);

    return address;
  }

  public async getServers(): Promise<Server[]> {
    const rawServers = await this.serverDiscoveryApiService.fetchServers();

    return rawServers
      .flatMap((rawServer) => {
        const parsedAddresses = rawServer.addresses
          .map((address) => this.parseAddress(address))
          .filter(
            (parsedAddress) =>
              ['tw-0.7+udp', 'tw-0.6+udp'].includes(parsedAddress.scheme) &&
              ipaddr.parse(parsedAddress.host).kind() === 'ipv4',
          )
          .sort((a, b) => {
            const priority = {
              'tw-0.7+udp': 1,
              'tw-0.6+udp': 2,
            };
            return (priority[a.scheme] || 99) - (priority[b.scheme] || 99);
          });

        if (parsedAddresses.length > 0) {
          const map = new MapInfo('Unknown');
          map.name = rawServer.info.map.name;
          const address = parsedAddresses[0];
          const server = new Server({
            address: address,
            map,
            name: rawServer.info.name,
          });
          return server;
        }
        return null;
      })
      .filter((server) => server !== null);
  }

  public async getServersWithPlayers(): Promise<ServerInfo[]> {
    const rawServers = await this.serverDiscoveryApiService.fetchServers();

    return rawServers
      .flatMap((rawServer) => {
        const parsedAddresses = rawServer.addresses
          .map((address) => this.parseAddress(address))
          .filter(
            (parsedAddress) =>
              ['tw-0.7+udp', 'tw-0.6+udp'].includes(parsedAddress.scheme) &&
              ipaddr.parse(parsedAddress.host).kind() === 'ipv4',
          )
          .sort((a, b) => {
            const priority = {
              'tw-0.7+udp': 1,
              'tw-0.6+udp': 2,
            };
            return (priority[a.scheme] || 99) - (priority[b.scheme] || 99);
          });

        if (parsedAddresses.length > 0) {
          const name = rawServer.info.name;
          const map = new MapInfo('Unknown');
          map.name = rawServer.info.map.name;
          const address = parsedAddresses[0];
          const server = new Server({
            address,
            map,
            name,
          });

          const players: Player[] = rawServer.info.clients.map(
            (client) => new Player(client.name, client.clan),
          );

          return {
            server,
            players,
          } as ServerInfo;
        }
        return null;
      })
      .filter((server) => server !== null);
  }
}
