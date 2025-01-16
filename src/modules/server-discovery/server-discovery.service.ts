import { Injectable } from '@nestjs/common';
import * as ipaddr from 'ipaddr.js';
import { parse } from 'uri-js';
import { ServerDiscoveryApiService } from './server-discovery-api.service';
import { Address } from 'src/entities/address.entity';
import { Server } from 'src/entities/server.entity';
import { MapInfo } from 'src/entities/map.entity';
import { Player } from 'src/entities/player.entity';
import { Clan } from 'src/entities/clan.entity';

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
    const address = new Address();

    const parsedHost = ipaddr.parse(parsed.host!);
    address.host = parsedHost.toNormalizedString();
    address.port = parsed.port ? parseInt(String(parsed.port), 10) : 0;
    address.scheme = parsed.scheme;

    return address;
  }

  private async getServers(): Promise<Server[]> {
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
          const server = new Server();
          server.name = rawServer.info.name;
          server.map = new MapInfo();
          server.map.name = rawServer.info.map.name;
          server.address = parsedAddresses[0];
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
          const server = new Server();
          server.name = rawServer.info.name;
          server.map = new MapInfo();
          server.map.name = rawServer.info.map.name;
          server.address = parsedAddresses[0];

          const players: Player[] = rawServer.info.clients.map((client) => {
            const player = new Player();
            player.name = client.name;
            player.clan = Clan.create(client.clan);

            return player;
          });

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
