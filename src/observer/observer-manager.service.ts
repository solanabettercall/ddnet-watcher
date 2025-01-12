import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ObserverService } from './observer.service';
import { ObserverConfigDto } from './dto/observer-config.dto';

@Injectable()
export class ObserverManagerService implements OnModuleDestroy {
  private readonly logger: Logger = new Logger(ObserverManagerService.name);

  private observers: Map<string, ObserverService> = new Map();

  constructor() {
    process.on('SIGINT', async () => {
      await this.disconnectAll();
      process.exit(0);
    });
  }

  private getKey(ip: string, port: number): string {
    return `${ip}:${port}`;
  }

  async addObserver(config: ObserverConfigDto): Promise<void> {
    const key = this.getKey(config.ip, config.port);

    if (this.observers.has(key)) {
      this.logger.warn(`Наблюдатель для ${key} уже существует.`);
      return;
    }

    const observer = new ObserverService(config);

    try {
      await observer.connect();
    } catch (err) {
      this.logger.error(
        `Не удалось подключить наблюдателя для ${key}: ${err.message}`,
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
    this.logger.log(`Наблюдатель для ${key} успешно удалён.`);
  }

  //   private scheduleReconnect(observer: ObserverService, key: string): void {
  //     Logger.log(`Запланирован реконнект для ${key} через 5 секунд...`);
  //     setTimeout(async () => {
  //       if (!observer.isConnected()) {
  //         Logger.log(`Попытка реконнекта для ${key}...`);
  //         try {
  //           await observer.connect();
  //           Logger.log(`Наблюдатель для ${key} успешно переподключён.`);
  //         } catch (err) {
  //           Logger.error(
  //             `Не удалось переподключить наблюдателя для ${key}: ${err.message}`,
  //           );
  //           this.scheduleReconnect(observer, key);
  //         }
  //       }
  //     }, 5000);
  //   }

  public async reconnectDisconnected() {
    this.observers.forEach(async (observer) => {
      if (!observer.isConnected()) {
        await observer.connect();
      }
    });
  }

  async disconnectAll(): Promise<void> {
    for (const [key, observer] of this.observers) {
      await observer.disconnect();
      this.logger.log(`Наблюдатель для ${key} успешно отключён.`);
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
