import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { KickEventDto } from './dto/events/kick-event.dto';
import { BanEventDto } from './dto/events/ban-event.dto';
import { VoteEventDto } from './dto/events/vote-event.dto';
import { VoteResultEventDto } from './dto/events/vote-result-event.dto';
import { IMessage } from 'src/lib/client';
import { ServerDiscoveryCacheService } from '../server-discovery/server-discovery-cache.service';
import { EventStorageService } from '../event-storage/event-storage.service';
import { Vote } from '../event-storage/entities/vote.entity';
import { Server } from '../event-storage/entities/server.entity';
import { JoinEventDto } from './dto/events/join-event.dto';
import { LeaveEventDto } from './dto/events/leave-event.dto';
import { PlayerUpdateEventDto } from './dto/events/player-update-event.dto';

@Injectable()
export class EventListenerService {
  private readonly logger = new Logger(EventListenerService.name);

  constructor(
    private readonly serverDiscoveryCacheService: ServerDiscoveryCacheService,
    private readonly eventStorageService: EventStorageService,
  ) {}

  @OnEvent('kick', { async: true })
  async handleKick(event: KickEventDto) {
    this.logger.debug(event);
  }

  @OnEvent('vote.spectate', { async: true })
  async handleVoteSpectate(event: VoteEventDto) {
    const vote = new Vote();
    vote.server = new Server(event.server);

    Object.assign(vote, event);

    await this.eventStorageService.saveVote(vote);
    this.logger.debug(event);
  }

  @OnEvent('vote.ban')
  handleVoteBan(event: VoteEventDto) {
    this.logger.debug(event);
  }

  @OnEvent('vote.changeOption')
  handleVoteChangeOption(event: VoteEventDto) {
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

  @OnEvent('ban')
  handleBan(event: BanEventDto) {
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
