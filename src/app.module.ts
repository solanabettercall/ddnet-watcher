import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ObserverModule } from './modules/observer/observer.module';
import { ObserverManagerService } from './modules/observer/observer-manager.service';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from 'dotenv';
import { Address } from './modules/event-storage/entities/address.entity';
import { Ban } from './modules/event-storage/entities/ban.entity';
import { Clan } from './modules/event-storage/entities/clan.entity';
import { Kick } from './modules/event-storage/entities/kick.entity';
import { Player } from './modules/event-storage/entities/player.entity';
import { Server } from './modules/event-storage/entities/server.entity';
import { Vote } from './modules/event-storage/entities/vote.entity';
import { MapInfo } from './modules/event-storage/entities/map.entity';
import { ServerDiscoveryModule } from './modules/server-discovery/server-discovery.module';
import { EventStorageModule } from './modules/event-storage/event-storage.module';

config();

@Module({
  imports: [
    ObserverModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [Address, Ban, Clan, Kick, MapInfo, Player, Server, Vote],
      synchronize: true,
    }),
    ServerDiscoveryModule,
    EventStorageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
