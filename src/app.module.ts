import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ObserverModule } from './modules/observer/observer.module';
import { ObserverManagerService } from './modules/observer/observer-manager.service';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from 'dotenv';
import { Address } from './entities/address.entity';
import { Ban } from './entities/ban.entity';
import { Clan } from './entities/clan.entity';
import { Kick } from './entities/kick.entity';
import { Player } from './entities/player.entity';
import { Server } from './entities/server.entity';
import { Vote } from './entities/vote.entity';
import { MapInfo } from './entities/map.entity';
import { ServerDiscoveryModule } from './modules/server-discovery/server-discovery.module';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
