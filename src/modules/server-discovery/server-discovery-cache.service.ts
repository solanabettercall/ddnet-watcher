import { Inject, Injectable, Logger } from '@nestjs/common';
import { Player } from 'src/entities/player.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ServerDiscoveryService } from './server-discovery.service';
import { GetCachedPlayerDto } from './dto/get-cached-player.dto';
import { Address } from 'src/entities/address.entity';

@Injectable()
export class ServerDiscoveryCacheService {
  private readonly logger: Logger = new Logger(
    ServerDiscoveryCacheService.name,
  );

  constructor(
    private readonly serverDiscoveryService: ServerDiscoveryService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getCachedPlayer(dto: GetCachedPlayerDto): Promise<Player | null> {
    const { host, port, username } = dto;
    const key = `${host}:${port}:${username}`;
    const player = await this.cacheManager.get<Player>(key);
    return player || null;
  }

  async сachePlayer(address: Address, player: Player): Promise<void> {
    const { host, port } = address;
    const { name } = player;
    const key = `${host}:${port}:${name}`;
    await this.cacheManager.set<Player>(key, player, 60000); // Минута
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  protected async cachePlayers() {
    const servers = await this.serverDiscoveryService.getServersWithPlayers();

    for (const server of servers) {
      for (const player of server.players) {
        const { host, port } = server.server.address;
        const key = `${host}:${port}:${player.name}`;
        await this.cacheManager.set(key, player, 60000); // Минута
      }
    }
    this.logger.debug('Игроки кэшированы');
  }
}
