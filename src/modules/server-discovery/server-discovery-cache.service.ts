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
import Redis from 'ioredis';
import { instanceToPlain, plainToInstance } from 'class-transformer';

import { Clan } from '../event-storage/entities/clan.entity';
import { hashString } from 'src/utils/hast-string';

@Injectable()
export class ServerDiscoveryCacheService implements OnApplicationBootstrap {
  private readonly logger: Logger = new Logger(
    ServerDiscoveryCacheService.name,
  );

  private readonly redis = new Redis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
  });

  constructor(
    private readonly serverDiscoveryService: ServerDiscoveryService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async onApplicationBootstrap() {
    await this.cacheServers();
  }

  async clearCacheForServer(address: Address): Promise<void> {
    const serverKeyPattern = `${this.getServerKey(address)}:player:*`;

    // Получаем все ключи игроков
    const playerKeys = await this.redis.keys(serverKeyPattern);

    // Удаляем ключи игроков
    if (playerKeys.length > 0) {
      await this.redis.del(...playerKeys);
    }

    // Удаляем информацию о сервере
    const serverInfoKey = `${this.getServerKey(address)}:info`;
    await this.redis.del(serverInfoKey);

    this.logger.debug(
      `Кэш для сервера ${serverInfoKey} и игроков ${serverKeyPattern} очищен`,
    );
  }

  private getServerKey(address: Address): string {
    return `server:${address.host}:${address.port}`;
  }

  async cachePlayer(
    address: Address,
    player: Player,
    ttl: number = 60,
  ): Promise<void> {
    const playerKey = `${this.getServerKey(address)}:player:${hashString(
      player.name,
    )}`;

    // Формируем данные для сохранения
    const playerData = JSON.stringify(instanceToPlain(player));

    if (ttl > 0) {
      // Если TTL больше 0, задаём время жизни
      await this.redis.set(playerKey, playerData, 'EX', ttl);
      this.logger.debug(
        `Игрок ${player.name} кэширован с TTL: ${ttl} (ключ: ${playerKey})`,
      );
    } else {
      // Если TTL равно 0, сохраняем без ограничения времени жизни
      await this.redis.set(playerKey, playerData);
      this.logger.debug(
        `Игрок ${player.name} кэширован с TTL: ${ttl} (ключ: ${playerKey})`,
      );
    }
  }

  async getCachedPlayer(
    address: Address,
    username: string,
  ): Promise<Player | null> {
    const playerKey = `${this.getServerKey(address)}:player:${hashString(
      username,
    )}`;

    // Извлекаем данные игрока
    const rawPlayer = await this.redis.get(playerKey);
    if (!rawPlayer) {
      return null;
    }

    return plainToInstance(Player, JSON.parse(rawPlayer));
  }

  async сacheServer(server: Server, ttl: number = 60): Promise<void> {
    const serverKey = `${this.getServerKey(server.address)}:info`;

    // Сохраняем метаинформацию о сервере
    await this.redis.call(
      'JSON.SET',
      serverKey,
      '.',
      JSON.stringify(instanceToPlain(server)),
    );

    if (ttl > 0) {
      await this.redis.expire(serverKey, ttl);
    }
  }

  async getCachedServer(dto: GetCachedServerDto): Promise<Server | null> {
    const serverKey = `${this.getServerKey(new Address(dto.host, dto.port))}:info`;

    // Извлекаем метаинформацию о сервере
    const rawServer = await this.redis.call('JSON.GET', serverKey, '.');
    if (!rawServer) {
      return null;
    }

    return plainToInstance(Server, JSON.parse(rawServer as string));
  }

  async updatePlayerTTL(
    address: Address,
    playerName: string,
    ttl: number,
  ): Promise<void> {
    const playerKey = `${this.getServerKey(address)}:player:${hashString(
      playerName,
    )}`;

    // Проверяем, существует ли игрок в кэше
    const exists = await this.redis.exists(playerKey);
    if (!exists) {
      this.logger.warn(
        `Игрок ${playerName} не найден в кэше с ключом ${playerKey}`,
      );
      return;
    }

    if (ttl > 0) {
      // Устанавливаем TTL для игрока
      await this.redis.expire(playerKey, ttl);
      this.logger.debug(
        `TTL для игрока ${playerName} обновлён до ${ttl} секунд (ключ: ${playerKey})`,
      );
    } else {
      // Удаляем TTL (делаем ключ постоянным)
      await this.redis.persist(playerKey);
      this.logger.debug(
        `TTL для игрока ${playerName} удалён (ключ: ${playerKey})`,
      );
    }
  }

  async updatePlayerClan(
    address: Address,
    playerName: string,
    newClan: string,
  ): Promise<void> {
    const playerKey = `${this.getServerKey(address)}:player:${hashString(playerName)}`;

    // Проверяем, существует ли игрок
    const rawPlayer = await this.redis.get(playerKey);
    if (!rawPlayer) {
      this.logger.warn(`Игрок ${playerName} не найден в кэше.`);
      return;
    }

    // Обновляем клан игрока
    const player = plainToInstance(Player, JSON.parse(rawPlayer));
    player.clan = new Clan(newClan);

    // Сохраняем обновлённого игрока в кэш
    await this.redis.set(playerKey, JSON.stringify(instanceToPlain(player)));
    this.logger.debug(
      `Клан игрока ${playerName} обновлён на ${newClan} (ключ: ${playerKey}).`,
    );
  }

  // @Cron(CronExpression.EVERY_30_SECONDS)
  protected async cacheServers(): Promise<void> {
    const servers = await this.serverDiscoveryService.getServersWithPlayers();

    for (const serverInfo of servers) {
      await this.сacheServer(serverInfo.server);

      // Кэшируем игроков сервера
      for (const player of serverInfo.players) {
        await this.cachePlayer(serverInfo.server.address, player);
      }
    }
  }
}
