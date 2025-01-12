import { Injectable, Logger, Scope } from '@nestjs/common';
import { ObserverConfigDto } from './dto/observer-config.dto';
import { SnapshotItemTypes } from 'src/lib/enums_types/types';
import { Client, IMessage } from 'src/lib/client';
import {
  kickWithoutReasonRegex,
  kickWithReasonRegex,
  voteKickRegex,
  voteSpectateRegex,
} from './regex';

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
      await this.client.connect();
    }
  }

  private registerEventHandlers(): void {
    this.client.on('connected', () => {
      this.logger.log(`Бот ${this.config.botName} подключен`);
      // this.client.game.Say('Привет! Я бот-наблюдатель');

      this.connected = true;
    });

    this.client.on('message', (message: IMessage) => {
      this.client.game.SetTeam(-1);
      const { message: text } = message;
      const clientId = message?.client_id;
      console.log(clientId);
      if (clientId === -1) {
        if (this.handleKickWithReason(text)) return;
        if (this.handleKickWithoutReason(text)) return;
        if (this.handleSpectateKick(text)) return;
        if (this.handleVoteKick(text)) return;
        if (this.handleVotePassed(text)) return;
        if (this.handleVoteFailed(text)) return;
        this.logger.verbose(text);
      } else {
        this.logger.log(text);
      }
    });

    this.client.on('disconnect', () => {
      this.logger.warn(`Бот ${this.config.botName} отключен`);
      this.connected = false;
    });
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.Disconnect();
    }
    this.connected = false;
  }

  public isConnected(): boolean {
    return this.connected;
  }

  private handleKickWithReason(text: string): boolean {
    const kickWithReason = text.match(kickWithReasonRegex);
    if (kickWithReason) {
      const [, username, reason] = kickWithReason;
      this.logger.debug(`'${username}' исключен по причине: '${reason}'.`);
      return true;
    }
    return false;
  }

  private handleKickWithoutReason(text: string): boolean {
    const kickWithoutReason = text.match(kickWithoutReasonRegex);
    if (kickWithoutReason) {
      const [, username] = kickWithoutReason;
      this.logger.debug(`'${username}' исключен.`);
      return true;
    }
    return false;
  }

  private handleSpectateKick(text: string): boolean {
    const voteSpectate = text.match(voteSpectateRegex);
    if (voteSpectate) {
      const [, voter, target, reason] = voteSpectate;
      if (reason === 'No reason given') {
        this.logger.debug(
          `'${voter}' проголосовал за перевод в наблюдатели '${target}'.`,
        );
      } else {
        this.logger.debug(
          `'${voter}' проголосовал за перевод в наблюдатели '${target}'. По причине: '${reason}'`,
        );
      }
      return true;
    }
    return false;
  }

  private handleVoteKick(text: string): boolean {
    const voteKick = text.match(voteKickRegex);
    if (voteKick) {
      const [, voter, target, reason] = voteKick;
      if (reason === 'No reason given') {
        this.logger.debug(`'${voter}' проголосовал за исключение '${target}'.`);
      } else {
        this.logger.debug(
          `'${voter}' проголосовал за исключение '${target}'. По причине: '${reason}'`,
        );
      }
      return true;
    }
    return false;
  }

  private handleVotePassed(text: string): boolean {
    if (text === 'Vote passed') {
      this.logger.debug('Голосование прошло');
      return true;
    }
    return false;
  }

  private handleVoteFailed(text: string): boolean {
    if (text === 'Vote failed') {
      this.logger.debug('Голосование не прошло');
      return true;
    }
    return false;
  }
}
