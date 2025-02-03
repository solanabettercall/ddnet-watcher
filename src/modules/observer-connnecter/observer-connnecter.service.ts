import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ServerDiscoveryService } from '../server-discovery/server-discovery.service';
import { Server } from '../event-storage/entities/server.entity';
import { ObserverManagerService } from '../observer/observer-manager.service';
import { Address } from '../event-storage/entities/address.entity';
import { MapInfo } from '../event-storage/entities/map.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ObserverConnnecterService implements OnApplicationBootstrap {
  constructor(
    private readonly serverDiscoveryService: ServerDiscoveryService,
    private readonly observerManagerService: ObserverManagerService,
  ) {}

  private readonly logger = new Logger(ObserverConnnecterService.name);

  async onApplicationBootstrap() {
    const servers = await this.getTestServers();

    for (const server of servers) {
      await this.observerManagerService.addObserver({
        address: server.address,
        botName: 'Thoth',
        skin: 'monkey',
      });
    }
  }

  private async getTestServers() {
    const servers: Server[] = [
      new Server({
        address: new Address('176.98.40.225', 8303),
        map: new MapInfo('Tutorial'),
        name: 'My Server',
      }),
      new Server({
        address: new Address('172.19.0.1', 8303),
        map: new MapInfo('dm2'),
        name: 'My Local Server',
      }),
    ];
    return servers;
  }

  // @Cron(CronExpression.EVERY_30_SECONDS)
  async checkAndReconnectObservers() {
    // Получаем список актуальных серверов
    const servers = await this.getKobraRusServers();

    // Создаем Map для хранения текущих карт на серверах
    const currentServerMap = new Map<string, string>();

    // Заполняем Map текущими картами
    for (const server of servers) {
      const key = `${server.address.host}:${server.address.port}`;
      currentServerMap.set(key, server.map.name);
    }

    // Проверяем подключенных ботов
    for (const [key, observer] of this.observerManagerService.observers) {
      const currentMap = currentServerMap.get(key);

      if (!currentMap) {
        // Сервер больше не в списке, отключаем бота
        this.logger.log(`Сервер ${key} больше не доступен, отключаем бота...`);
        await this.observerManagerService.removeObserver(
          observer.config.server.address.host,
          observer.config.server.address.port,
        );
        continue;
      }

      if (observer.config.server.map.name !== currentMap) {
        // Карта на сервере изменилась, отключаем бота
        this.logger.log(
          `Карта на сервере ${key} изменилась с ${observer.config.server.map.name} на ${currentMap}. Отключаем бота...`,
        );
        await this.observerManagerService.removeObserver(
          observer.config.server.address.host,
          observer.config.server.address.port,
        );
      }
    }

    // Подключаем ботов к новым серверам с нужными картами
    for (const server of servers) {
      const key = `${server.address.host}:${server.address.port}`;

      // Если бот еще не подключен к этому серверу и карта подходящая
      if (
        !this.observerManagerService.observers.has(key) &&
        this.isKobraRusMap(server.map.name)
      ) {
        this.logger.log(`Подключаем бота к серверу ${key}...`);
        await this.observerManagerService.addObserver({
          address: server.address,
          botName: 'Thoth',
          skin: 'monkey',
        });
      }
    }
  }

  private isKobraRusMap(mapName: string): boolean {
    const desiredMaps = ['Kobra', 'Kobra 2', 'Kobra 3', 'Kobra 4'];
    return desiredMaps.includes(mapName);
  }

  private isTestMap(mapName: string): boolean {
    const desiredMaps = ['Gold Mine', 'dm2'];
    return desiredMaps.includes(mapName);
  }

  private async getKobraRusServers() {
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
    return filteredServers;
  }
}
