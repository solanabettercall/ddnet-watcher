import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { Player } from 'src/modules/event-storage/entities/player.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ServerDiscoveryService } from './server-discovery.service';
import { GetCachedPlayerDto } from './dto/get-cached-player.dto';
import { Address } from 'src/modules/event-storage/entities/address.entity';
import { GetCachedServerDto } from './dto/get-cached-server.dto';
import { Server } from '../event-storage/entities/server.entity';

@Injectable()
export class ServerDiscoveryCacheService implements OnApplicationBootstrap {
  private readonly logger: Logger = new Logger(
    ServerDiscoveryCacheService.name,
  );

  constructor(
    private readonly serverDiscoveryService: ServerDiscoveryService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async onApplicationBootstrap() {
    await this.cacheSerers();
  }

  async getCachedPlayer(dto: GetCachedPlayerDto): Promise<Player | null> {
    const { host, port, username } = dto;
    const key = `${host}:${port}:${username}`;
    const player = await this.cacheManager.get<Player>(key);
    return player || null;
  }

  async getCachedServer(dto: GetCachedServerDto): Promise<Server | null> {
    const { host, port } = dto;
    const key = `${host}:${port}`;
    const server = await this.cacheManager.get<Server>(key);
    return server || null;
  }

  async сachePlayer(address: Address, player: Player): Promise<void> {
    const { host, port } = address;
    const { name } = player;
    const key = `${host}:${port}:${name}`;
    await this.cacheManager.set<Player>(key, player, 60000); // Минута
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  protected async cacheSerers() {
    const servers = await this.serverDiscoveryService.getServersWithPlayers();

    for (const server of servers) {
      const { host, port } = server.server.address;
      const key = `${host}:${port}`;
      await this.cacheManager.set(key, server, 60000); // Минута

      for (const player of server.players) {
        const { name } = player;
        const key = `${host}:${port}:${player.name}`;
        await this.cacheManager.set(key, player, 60000); // Минута
      }
    }
    this.logger.debug('Сервера и игроки кэшированы');
  }
}
