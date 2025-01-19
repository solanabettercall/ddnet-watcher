import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ban } from './entities/ban.entity';
import { Kick } from './entities/kick.entity';
import { Vote } from './entities/vote.entity';
import { BanEventDto } from '../observer/dto/events/ban-event.dto';
import { ServerDiscoveryCacheService } from '../server-discovery/server-discovery-cache.service';
import { Player } from './entities/player.entity';
import { VoteEventDto } from '../observer/dto/events/vote-event.dto';

@Injectable()
export class EventStorageService {
  private readonly logger: Logger = new Logger(EventStorageService.name);

  constructor(
    @InjectRepository(Ban)
    private banRepository: Repository<Ban>,
    @InjectRepository(Kick)
    private kickRepository: Repository<Kick>,
    @InjectRepository(Vote)
    private voteRepository: Repository<Vote>,
  ) {}

  async saveBan(dto: Ban) {
    // const target: Player | null =
    //   await this.serverDiscoveryCacheService.getCachedPlayer({
    //     host: dto.server.address.host,
    //     port: dto.server.address.port,
    //     username: dto.target,
    //   });
    // if (!target) {
    //   this.logger.warn(
    //     'Не удалось сохранить события бана игрока',
    //     JSON.stringify(dto),
    //   );
    //   return;
    // }
    // const ban: Ban = {
    //   ...dto,
    //   target,
    // };
    // dto.server.this.banRepository.create({
    //   ...dto,
    //   target,
    // });
    // return this.banRepository.save<Ban>();
  }

  async saveVote(dto: Vote) {
    this.logger.debug('Сохранили голосование');
    console.log(dto);
  }
  async saveKick(dto: Kick) {}
}
