import { Injectable, Logger, Scope } from '@nestjs/common';
import { Client } from 'teeworlds';
import { ObserverConfigDto } from './dto/observer-config.dto';
import { SnapshotItemTypes } from 'teeworlds/lib/enums_types/types';

interface IMessage {
  team: number;
  client_id: number;
  author?: {
    ClientInfo?: SnapshotItemTypes.ClientInfo;
    PlayerInfo?: SnapshotItemTypes.PlayerInfo;
  };
  message: string;
}

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
      { timeout: 5000 },
    );
    this.logger = new Logger(this.getServerName());
    this.registerEventHandlers();
  }

  async connect(): Promise<void> {
    this.client.removeAllListeners();
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
      console.log(message);
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
  }

  public isConnected(): boolean {
    return this.connected;
  }
}
