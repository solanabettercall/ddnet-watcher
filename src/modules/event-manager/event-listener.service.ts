import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { KickEventDto } from '../observer/dto/events/kick-event.dto';
import { BanEventDto } from '../observer/dto/events/ban-event.dto';
import { VoteEventDto } from '../observer/dto/events/vote-event.dto';
import { VoteResultEventDto } from '../observer/dto/events/vote-result-event.dto';
import { IMessage } from 'src/lib/client';
import { ServerDiscoveryCacheService } from '../server-discovery/server-discovery-cache.service';
import { EventStorageService } from '../event-storage/event-storage.service';
import { Vote } from '../event-storage/entities/vote.entity';
import { Server } from '../event-storage/entities/server.entity';
import { JoinEventDto } from '../observer/dto/events/join-event.dto';
import { LeaveEventDto } from '../observer/dto/events/leave-event.dto';
import { PlayerUpdateEventDto } from '../observer/dto/events/player-update-event.dto';
import { Ban } from '../event-storage/entities/ban.entity';
import { Kick } from '../event-storage/entities/kick.entity';
import { TelegramBotService } from '../telegram-bot/telegram-bot.service';

@Injectable()
export class EventListenerService {
  private readonly logger = new Logger(EventListenerService.name);

  constructor(
    private readonly eventStorageService: EventStorageService,
    private readonly telegramBotService: TelegramBotService,
  ) {}

  @OnEvent('kick', { async: true })
  async handleKick(event: KickEventDto) {
    const kick = new Kick(event);
    kick.server = new Server(event.server);
    await this.eventStorageService.saveKick(kick);
    this.logger.debug(event);
  }

  @OnEvent('vote.spectate', { async: true })
  async handleVoteSpectate(event: VoteEventDto) {
    const vote = new Vote(event);
    vote.server = new Server(event.server);

    const { id } = await this.eventStorageService.saveVote(vote);
    const fullVote = await this.eventStorageService.getVoteFull(id);
    await this.telegramBotService.sendVote(fullVote);
    this.logger.debug(event);
  }

  @OnEvent('vote.ban', { async: true })
  async handleVoteBan(event: VoteEventDto) {
    const vote = new Vote(event);
    vote.server = new Server(event.server);

    const { id } = await this.eventStorageService.saveVote(vote);
    const fullVote = await this.eventStorageService.getVoteFull(id);
    await this.telegramBotService.sendVote(fullVote);
    this.logger.debug(event);
  }

  @OnEvent('vote.changeOption', { async: true })
  async handleVoteChangeOption(event: VoteEventDto) {
    const vote = new Vote(event);
    vote.server = new Server(event.server);

    await this.eventStorageService.saveVote(vote);
    this.logger.debug(event);
  }

  @OnEvent('vote.passed')
  handleVotePassed(event: VoteResultEventDto) {
    this.logger.debug(event);
  }

  @OnEvent('vote.failed')
  handleVoteFailed(event: VoteResultEventDto) {
    this.logger.debug(event);
  }

  @OnEvent('ban', { async: true })
  async handleBan(event: BanEventDto) {
    const ban = new Ban(event);
    ban.server = new Server(event.server);

    const savedBan = await this.eventStorageService.saveBan(ban);
    this.logger.debug(event);
  }

  @OnEvent('join')
  handleJoin(event: JoinEventDto) {
    this.logger.debug(event);
  }

  @OnEvent('leave')
  handleLeave(event: LeaveEventDto) {
    this.logger.debug(event);
  }

  @OnEvent('chat.message.player')
  handleChatMessagePlayer(event: IMessage) {
    const name = event?.author?.ClientInfo?.name;
    const message = event.message;

    if (name) this.logger.log(`${name}: ${message}`);
    else this.logger.log(message);
  }

  @OnEvent('chat.message.system')
  handleChatMessageSystem(event: IMessage) {
    this.logger.verbose(event.message);
  }

  @OnEvent('player.update')
  handlePlayerUpdate(event: PlayerUpdateEventDto) {
    this.logger.verbose(event);
  }
}
