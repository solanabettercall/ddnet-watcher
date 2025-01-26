import { Module } from '@nestjs/common';
import { EventStorageService } from './event-storage.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Address } from './entities/address.entity';
import { Server } from './entities/server.entity';
import { Ban } from './entities/ban.entity';
import { Clan } from './entities/clan.entity';
import { Kick } from './entities/kick.entity';
import { MapInfo } from './entities/map.entity';
import { Player } from './entities/player.entity';
import { Vote } from './entities/vote.entity';
import { EventStorageController } from './event-storage.controller';
import { TelegramBotModule } from '../telegram-bot/telegram-bot.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Address,
      Ban,
      Clan,
      Kick,
      MapInfo,
      Player,
      Server,
      Vote,
    ]),
  ],
  providers: [EventStorageService],
  exports: [EventStorageService],
  controllers: [EventStorageController],
})
export class EventStorageModule {}
