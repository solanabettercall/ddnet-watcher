import { Logger } from '@nestjs/common';
import { ObserverConfigDto } from './dto/observer-config.dto';
import { Client, IMessage } from 'src/lib/client';
import {
  banWithUntilRegex,
  banWithMinutesRegex,
  kickWithoutReasonRegex,
  kickWithReasonRegex,
  permanentBanRegex,
  voteKickRegex,
  voteSpectateRegex,
  voteChangeOptionRegex,
} from './regex';
import { parseDate, parseDateFromMinutes } from 'src/utils/parse-date';
import { BanEventDto } from './dto/events/ban-event.dto';
import { VoteResultEventDto } from './dto/events/vote-result-event.dto';
import { VoteEventDto } from './dto/events/vote-event.dto';
import { VoteType } from './interfaces/vote.interface';

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
        if (this.handleVoteSpectate(text)) return;
        if (this.handleVoteKick(text)) return;
        if (this.handleVoteChangeOption(text)) return;
        if (this.handleVotePassed(text)) return;
        if (this.handleVoteFailed(text)) return;
        if (this.handleBanUntil(text)) return;
        if (this.handleBanWithMinutes(text)) return;
        if (this.handlePermanentBan(text)) return;

        this.logger.verbose(text);
      } else {
        this.logger.log(text);
      }
    });

    this.client.on('disconnect', (reason: string) => {
      this.logger.warn(`Бот ${this.config.botName} отключен: ${reason}`);
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

  //#region Кик
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
  //#endregion

  private handleVoteSpectate(text: string): boolean {
    const voteSpectate = text.match(voteSpectateRegex);
    if (voteSpectate) {
      const [, voter, target, reason] = voteSpectate;

      const vote = new VoteEventDto(
        { ...this.config },
        {
          target,
          voter,
          reason,
          type: VoteType.Spectate,
        },
      );

      this.logger.debug(vote);

      return true;
    }
    return false;
  }

  private handleVoteKick(text: string): boolean {
    const voteKick = text.match(voteKickRegex);
    if (voteKick) {
      const [, voter, target, reason] = voteKick;

      const vote = new VoteEventDto(
        { ...this.config },
        {
          target,
          voter,
          reason,
          type: VoteType.Kick,
        },
      );

      this.logger.debug(vote);
      return true;
    }
    return false;
  }

  private handleVoteChangeOption(text: string): boolean {
    const voteChangeOption = text.match(voteChangeOptionRegex);
    if (voteChangeOption) {
      const [, voter, target, reason] = voteChangeOption;

      const vote = new VoteEventDto(
        { ...this.config },
        {
          target,
          voter,
          reason,
          type: VoteType.Option,
        },
      );

      this.logger.debug(vote);
      return true;
    }
    return false;
  }

  private handleVotePassed(text: string): boolean {
    if (text === 'Vote passed') {
      const votingResult = new VoteResultEventDto(
        { ...this.config },
        {
          success: true,
        },
      );
      this.logger.debug(votingResult);
      return true;
    }
    return false;
  }

  private handleVoteFailed(text: string): boolean {
    if (text === 'Vote failed' || text.includes('canceled their vote')) {
      const votingResult = new VoteResultEventDto(
        { ...this.config },
        {
          success: false,
        },
      );
      this.logger.debug(votingResult);
      return true;
    }
    return false;
  }

  private handleBanWithMinutes(text: string) {
    const banWithMinutes = text.match(banWithMinutesRegex);
    if (banWithMinutes) {
      const [, target, minutes, reason] = banWithMinutes;
      const until = parseDateFromMinutes(minutes);
      const banEvent = new BanEventDto(
        {
          ip: this.config.ip,
          port: this.config.port,
        },
        {
          reason,
          target,
          until,
        },
      );
      this.logger.debug(banEvent);
      return true;
    }
    return false;
  }

  private handlePermanentBan(text: string) {
    const permanentBan = text.match(permanentBanRegex);
    if (permanentBan) {
      const [, target, reason] = permanentBan;

      const banEvent = new BanEventDto(
        {
          ip: this.config.ip,
          port: this.config.port,
        },
        { reason, target },
      );
      this.logger.debug(banEvent);
      return true;
    }
    return false;
  }

  private handleBanUntil(text: string) {
    const banUntil = text.match(banWithUntilRegex);
    if (banUntil) {
      const [, target, reason, until] = banUntil;
      const parsedDate = parseDate(until);

      const banEvent = new BanEventDto(
        {
          ip: this.config.ip,
          port: this.config.port,
        },
        {
          reason,
          target,
          until: parsedDate,
        },
      );
      this.logger.debug(banEvent);

      return true;
    }
    return false;
  }
}
