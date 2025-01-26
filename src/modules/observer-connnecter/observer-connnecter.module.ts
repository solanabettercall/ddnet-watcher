import { Module } from '@nestjs/common';
import { ObserverConnnecterService } from './observer-connnecter.service';
import { ServerDiscoveryModule } from '../server-discovery/server-discovery.module';
import { ObserverModule } from '../observer/observer.module';

@Module({
  imports: [ServerDiscoveryModule, ObserverModule],
  providers: [ObserverConnnecterService],
})
export class ObserverConnnecterModule {}
