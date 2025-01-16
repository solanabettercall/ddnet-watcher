import { Inject, Injectable, Logger } from '@nestjs/common';
import { Player } from 'src/entities/player.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ServerDiscoveryService } from './server-discovery.service';
import { GetCachedPlayerDto } from './dto/get-cached-player.dto';

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
    const player = await this.cacheManager.get<Player>(
      `${host}:${port}:${username}`,
    );
    return player || null;
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  protected async cachePlayers() {
    const servers = await this.serverDiscoveryService.getServersWithPlayers();

    for (const server of servers) {
      for (const player of server.players) {
        const { host, port } = server.server.address;
        const key = `${host}:${port}:${player.name}`;
        await this.cacheManager.set(key, player, 5000); // 5 секунд
      }
    }
    this.logger.debug('Игроки кэшированы');
  }
}
