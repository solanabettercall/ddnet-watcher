import { InternalServerErrorException, Module } from '@nestjs/common';
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
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const host = process.env.DB_HOST;
        const port = parseInt(process.env.DB_PORT, 10);
        const database = process.env.DB_NAME;
        const username = process.env.DB_USER;
        const password = process.env.DB_PASSWORD;
        if (!host || !port || !database || !username || !password) {
          throw new InternalServerErrorException(
            'Неверная конфигурация typeorm',
          );
        }

        return {
          type: 'postgres',
          host,
          port,
          username,
          password,
          database,
          entities: [Address, Ban, Clan, Kick, MapInfo, Player, Server, Vote],
          synchronize: true,
        };
      },
    }),
    ServerDiscoveryModule,
    EventStorageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
