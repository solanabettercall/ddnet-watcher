import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { KickEventDto } from './dto/events/kick-event.dto';
import { BanEventDto } from './dto/events/ban-event.dto';
import { VoteEventDto } from './dto/events/vote-event.dto';
import { VoteResultEventDto } from './dto/events/vote-result-event.dto';
import { IMessage } from 'src/lib/client';

@Injectable()
export class EventListenerService {
  private readonly logger = new Logger(EventListenerService.name);

  @OnEvent('kick')
  handleKick(event: KickEventDto) {
    this.logger.debug(event);
  }

  @OnEvent('vote.spectate')
  handleVoteSpectate(event: VoteEventDto) {
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
}
