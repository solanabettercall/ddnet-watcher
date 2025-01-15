import { Module } from '@nestjs/common';
import { ServerDiscoveryApiService } from './server-discovery-api.service';
import { HttpModule } from '@nestjs/axios';
import { ServerDiscoveryService } from './server-discovery.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
      baseURL: 'https://master1.ddnet.org',
    }),
  ],
  providers: [ServerDiscoveryApiService, ServerDiscoveryService],
  exports: [ServerDiscoveryService],
})
export class ServerDiscoveryModule {}
