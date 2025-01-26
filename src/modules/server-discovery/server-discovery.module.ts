import { InternalServerErrorException, Module } from '@nestjs/common';
import { ServerDiscoveryApiService } from './server-discovery-api.service';
import { HttpModule } from '@nestjs/axios';
import { ServerDiscoveryService } from './server-discovery.service';
import { CacheModule, CacheStore } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { ScheduleModule } from '@nestjs/schedule';
import { ServerDiscoveryCacheService } from './server-discovery-cache.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
      baseURL: 'https://master1.ddnet.org',
    }),

    CacheModule.registerAsync({
      useFactory: async () => {
        const host = process.env.REDIS_HOST;
        const port = parseInt(process.env.REDIS_PORT, 10);
        if (!host || !port)
          throw new InternalServerErrorException('Неверная конфигурация redis');
        const store = await redisStore({
          socket: {
            host,
            port,
          },
        });

        return {
          store,
          ttl: 10,
        };
      },
    }),
    ScheduleModule.forRoot(),
  ],
  providers: [
    ServerDiscoveryApiService,
    ServerDiscoveryService,
    ServerDiscoveryCacheService,
  ],
  exports: [ServerDiscoveryService, ServerDiscoveryCacheService],
})
export class ServerDiscoveryModule {}
