import { Module } from '@nestjs/common';
import { ObserverService } from './observer.service';
import { ObserverManagerService } from './observer-manager.service';

import { ObserverFactoryService } from './observer-factory.service';
import { BullModule } from '@nestjs/bull';
import { EVENTS_QUEUE } from './consts';
import { EventsProcessor } from './processors/events.processor';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventListenerService } from './event-listener.service';
import { EventDebouncer } from './event-debouncer';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: EVENTS_QUEUE,
    }),
    EventEmitterModule.forRoot(),
  ],
  providers: [
    ObserverService,
    ObserverManagerService,
    ObserverFactoryService,
    EventsProcessor,
    EventListenerService,
    EventDebouncer,
  ],
  exports: [ObserverManagerService],
})
export class ObserverModule {}
