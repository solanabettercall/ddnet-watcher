import { Logger } from '@nestjs/common';
import { ObserverConfigDto } from './dto/observer-config.dto';
import { Client, IMessage } from 'src/lib/client';
import {
  banWithUntilRegex,
  banWithMinutesRegex,
  kickWithoutReasonRegex,
  kickWithReasonRegex,
  permanentBanRegex,
  voteKickRegex as voteBanRegex,
  voteSpectateRegex,
  voteChangeOptionRegex,
} from './regex';
import { parseDate, parseDateFromMinutes } from 'src/utils/parse-date';
import { BanEventDto } from './dto/events/ban-event.dto';
import { VoteResultEventDto } from './dto/events/vote-result-event.dto';
import { VoteEventDto } from './dto/events/vote-event.dto';
import { VoteType } from './interfaces/vote.interface';
import { KickEventDto } from './dto/events/kick-event.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventDebouncer } from './event-debouncer';

export class ObserverService {
  private readonly logger: Logger;
  private readonly debouncer: EventDebouncer;

  private client: Client;
  private connected = false;

  private readonly getServerName = () =>
    `${this.config.ip}:${this.config.port}`;

  constructor(
    private readonly eventEmitter: EventEmitter2,
    public readonly config: ObserverConfigDto,
  ) {
    this.debouncer = new EventDebouncer();
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
      this.connected = true;
      this.client.game.SetTeam(-1);
    });

    this.client.on('message', (message: IMessage) => {
      const eventKey = JSON.stringify(message);

      const { message: text } = message;
      const clientId = message?.client_id;
      if (clientId === -1) {
        if (this.handleKickWithReason(text)) return;
        if (this.handleKickWithoutReason(text)) return;
        if (this.handleVoteSpectate(text)) return;
        if (this.handleVoteBan(text)) return;
        if (this.handleVoteChangeOption(text)) return;
        if (this.handleVotePassed(text)) return;
        if (this.handleVoteFailed(text)) return;
        if (this.handleBanUntil(text)) return;
        if (this.handleBanWithMinutes(text)) return;
        if (this.handlePermanentBan(text)) return;

        // this.logger.verbose(text);
        this.debouncer.emit(eventKey, message, (event) => {
          this.eventEmitter.emit('chat.message.system', event);
        });
      } else {
        // this.eventsQueue.add(message, {
        //   debounce: {
        //     id: message.message,
        //     ttl: 300,
        //   },
        // });

        this.debouncer.emit(eventKey, message, (event) => {
          this.eventEmitter.emit('chat.message.player', event);
        });
        // this.logger.log(text);
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
      const [, target, reason] = kickWithReason;
      const kickEvent = new KickEventDto(
        { ...this.config },
        {
          target,
          reason,
        },
      );
      const eventKey = JSON.stringify(kickEvent);
      this.debouncer.emit(eventKey, kickEvent, (event) => {
        this.eventEmitter.emit('kick', event);
      });

      return true;
    }
    return false;
  }

  private handleKickWithoutReason(text: string): boolean {
    const kickWithoutReason = text.match(kickWithoutReasonRegex);
    if (kickWithoutReason) {
      const [, target] = kickWithoutReason;
      const kickEvent = new KickEventDto(
        { ...this.config },
        {
          target,
          reason: null,
        },
      );
      const eventKey = JSON.stringify(kickEvent);
      this.debouncer.emit(eventKey, kickEvent, (event) => {
        this.eventEmitter.emit('kick', event);
      });
      return true;
    }
    return false;
  }
  //#endregion

  //#region Голосования
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

      this.eventEmitter.emit('vote.spectate', vote);

      return true;
    }
    return false;
  }

  private handleVoteBan(text: string): boolean {
    const voteBan = text.match(voteBanRegex);
    if (voteBan) {
      const [, voter, target, reason] = voteBan;

      const vote = new VoteEventDto(
        { ...this.config },
        {
          target,
          voter,
          reason,
          type: VoteType.Ban,
        },
      );

      this.eventEmitter.emit('vote.ban', vote);

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

      this.eventEmitter.emit('vote.changeOption', vote);

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
      this.eventEmitter.emit('vote.passed', votingResult);

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
      this.eventEmitter.emit('vote.failed', votingResult);

      return true;
    }
    return false;
  }
  //#endregion

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
      this.eventEmitter.emit('ban', banEvent);

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
      this.eventEmitter.emit('ban', banEvent);

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
      this.eventEmitter.emit('ban', banEvent);

      return true;
    }
    return false;
  }
}
