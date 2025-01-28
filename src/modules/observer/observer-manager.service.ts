import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ObserverService } from './observer.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ObserverFactoryService } from './observer-factory.service';
import { ObserverFactoryServiceConfigDto } from './dto/observer-factory-service-config.dto';

@Injectable()
export class ObserverManagerService implements OnModuleDestroy {
  private readonly logger: Logger = new Logger(ObserverManagerService.name);

  public observers: Map<string, ObserverService> = new Map();

  constructor(private readonly observerFactory: ObserverFactoryService) {
    process.on('SIGINT', async () => {
      await this.disconnectAll();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await this.disconnectAll();
      process.exit(0);
    });
  }

  private getKey(ip: string, port: number): string {
    return `${ip}:${port}`;
  }

  async addObserver(config: ObserverFactoryServiceConfigDto): Promise<void> {
    const key = this.getKey(config.address.host, config.address.port);
    if (this.observers.has(key)) {
      this.logger.warn(`Наблюдатель для ${key} уже существует.`);
      return;
    }

    const observer = await this.observerFactory.create(config);

    try {
      await observer.connect();
    } catch (err) {
      this.logger.error(
        `Не удалось подключить наблюдателя для ${key}: ${err.message}.`,
      );
    }
    this.observers.set(key, observer);
  }

  async removeObserver(ip: string, port: number): Promise<void> {
    const key = this.getKey(ip, port);

    const observer = this.observers.get(key);
    if (!observer) {
      this.logger.warn(`Наблюдатель для ${key} не найден.`);
      return;
    }

    await observer.disconnect();
    this.observers.delete(key);
  }

  @Cron(CronExpression.EVERY_5_SECONDS, {
    disabled: false,
  })
  public async reconnectDisconnected() {
    this.observers.forEach(async (observer) => {
      if (!observer.isConnected()) {
        await observer.connect();
      }
    });
  }

  async disconnectAll(): Promise<void> {
    for (const [_, observer] of this.observers) {
      await observer.disconnect();
    }
    this.observers.clear();
    this.logger.log('Все наблюдатели успешно отключены.');
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log(
      'Отключение всех наблюдателей перед завершением работы модуля...',
    );
    await this.disconnectAll();
  }
}
