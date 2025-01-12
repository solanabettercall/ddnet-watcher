import { Injectable, Logger, Scope } from '@nestjs/common';
import { ObserverConfigDto } from './dto/observer-config.dto';
import { SnapshotItemTypes } from 'src/lib/enums_types/types';
import { Client, IMessage } from 'src/lib/client';

export class ObserverService {
  private readonly logger: Logger;

  private client: Client;
  private connected = false;

  private readonly getServerName = () =>
    `${this.config.ip}:${this.config.port}`;

  constructor(public readonly config: ObserverConfigDto) {
    if (!this.config) return;
    this.client = new Client(
      this.config.ip,
      this.config.port,
      this.config.botName,
    );
    this.logger = new Logger(this.getServerName());
    this.registerEventHandlers();
  }

  async connect(): Promise<void> {
    if (!this.connected) {
      this.logger.log(`Попытка подключения`);
      await this.client.connect();
    }
  }

  private registerEventHandlers(): void {
    this.client.on('connected', () => {
      this.logger.log(
        `Бот ${this.config.botName} подключен к ${this.getServerName()}`,
      );
      this.client.game.Say('Привет! Я бот-наблюдатель');
      this.connected = true;
    });

    this.client.on('message', (message: IMessage) => {
      this.logger.verbose(message.message);
    });

    this.client.on('disconnect', () => {
      this.logger.warn(
        `Бот ${this.config.botName} отключен от ${this.getServerName()}`,
      );
      this.connected = false;
    });
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.Disconnect();
      this.logger.log('Отключен от сервера');
    }
    this.connected = false;
  }

  public isConnected(): boolean {
    return this.connected;
  }
}
