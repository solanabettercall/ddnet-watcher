import { Module } from '@nestjs/common';
import { ObserverService } from './observer.service';
import { ObserverManagerService } from './observer-manager.service';

import { ObserverFactoryService } from './observer-factory.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventListenerService } from './event-listener.service';
import { EventDebouncer } from './event-debouncer';
import { ServerDiscoveryModule } from '../server-discovery/server-discovery.module';

@Module({
  imports: [EventEmitterModule.forRoot(), ServerDiscoveryModule],
  providers: [
    ObserverService,
    ObserverManagerService,
    ObserverFactoryService,
    EventListenerService,
    EventDebouncer,
  ],
  exports: [ObserverManagerService],
})
export class ObserverModule {}
